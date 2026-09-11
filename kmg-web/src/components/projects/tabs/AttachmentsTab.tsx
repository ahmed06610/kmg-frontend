"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { addProjectAttachment, uploadProjectAttachment } from "@/actions/projects";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldGroup, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/utils";
import { projectAttachmentSchema, type ProjectAttachmentFormValues } from "@/schema/project";
import type { ProjectAttachmentDTO } from "@/types/project";

export function AttachmentsTab({ projectId, attachments, canManage }: { projectId: number; attachments: ProjectAttachmentDTO[]; canManage: boolean }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex items-center justify-between">
        <p className="text-body-sm text-on-surface-variant">مرفقات المشروع - ارفع ملف من جهازك أو أضف رابط جاهز</p>
        {canManage && (
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Icon name="add" size={18} />
            إضافة مرفق
          </Button>
        )}
      </div>

      {attachments.length === 0 ? (
        <EmptyState icon="attach_file" title="لا توجد مرفقات بعد" description="فواتير، كراسة المناقصة، شهادات التأمين..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
          {attachments.map((a) => (
            <a
              key={a.id}
              href={a.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-stack-sm rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md hover:border-primary transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                <Icon name="description" />
              </div>
              <div className="min-w-0">
                <p className="text-body-sm text-on-surface font-semibold truncate">{a.fileName || a.fileUrl}</p>
                {a.description && <p className="text-xs text-on-surface-variant truncate">{a.description}</p>}
                <p className="text-xs text-on-surface-variant mt-1">
                  {a.uploadedByEmployeeName} · {formatDate(a.uploadedAt)}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}

      <AddAttachmentDialog open={dialogOpen} onClose={() => setDialogOpen(false)} projectId={projectId} />
    </div>
  );
}

function AddAttachmentDialog({ open, onClose, projectId }: { open: boolean; onClose: () => void; projectId: number }) {
  const router = useRouter();
  const [mode, setMode] = useState<"upload" | "link">("upload");
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectAttachmentFormValues>({
    resolver: zodResolver(projectAttachmentSchema),
    defaultValues: { fileUrl: "", fileName: "", description: "" },
  });

  function closeAndReset() {
    reset();
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  }

  const onSubmitLink = async (data: ProjectAttachmentFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await addProjectAttachment({ projectId, fileUrl: data.fileUrl, fileName: data.fileName || null, description: data.description || null });
    setLoading(false);
    if (!result.success) {
      setServerError(result.message ?? "حدث خطأ");
      return;
    }
    closeAndReset();
    router.refresh();
  };

  const onSubmitUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setServerError("اختر ملف أولاً");
      return;
    }
    setLoading(true);
    setServerError(null);

    const formData = new FormData();
    formData.set("file", file);
    formData.set("description", descriptionRef.current?.value ?? "");

    const result = await uploadProjectAttachment(projectId, formData);
    setLoading(false);
    if (!result.success) {
      setServerError(result.message ?? "حدث خطأ");
      return;
    }
    closeAndReset();
    router.refresh();
  };

  return (
    <Dialog
      open={open}
      onClose={closeAndReset}
      title="إضافة مرفق"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={closeAndReset}>
            إلغاء
          </Button>
          {mode === "link" ? (
            <Button type="submit" form="attachment-link-form" disabled={loading}>
              {loading ? "جاري الحفظ..." : "إضافة"}
            </Button>
          ) : (
            <Button type="button" onClick={onSubmitUpload} disabled={loading}>
              {loading ? "جاري الرفع..." : "رفع وإضافة"}
            </Button>
          )}
        </>
      }
    >
      <div className="flex gap-2 mb-stack-md rounded-lg bg-surface-container-low p-1">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded py-1.5 text-body-sm font-semibold transition-colors ${
            mode === "upload" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant"
          }`}
        >
          <Icon name="upload_file" size={16} />
          رفع من الجهاز
        </button>
        <button
          type="button"
          onClick={() => setMode("link")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded py-1.5 text-body-sm font-semibold transition-colors ${
            mode === "link" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant"
          }`}
        >
          <Icon name="link" size={16} />
          رابط
        </button>
      </div>

      {mode === "upload" ? (
        <div className="flex flex-col gap-stack-md">
          <FieldGroup label="الملف">
            <label className="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-outline-variant bg-surface-container-lowest p-stack-lg cursor-pointer hover:border-primary transition-colors">
              <Icon name="upload_file" size={28} className="text-on-surface-variant" />
              <span className="text-body-sm text-on-surface-variant text-center">
                {fileName ?? "اضغط لاختيار ملف من جهازك (بحد أقصى 20 ميجا)"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
              />
            </label>
          </FieldGroup>
          <FieldGroup label="الوصف">
            <Input ref={descriptionRef} placeholder="فاتورة، كراسة مناقصة، شهادة تأمين..." />
          </FieldGroup>
          {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
        </div>
      ) : (
        <form id="attachment-link-form" onSubmit={handleSubmit(onSubmitLink)} className="flex flex-col gap-stack-md">
          <FieldGroup label="رابط الملف" error={errors.fileUrl?.message}>
            <Input dir="ltr" placeholder="https://..." {...register("fileUrl")} />
          </FieldGroup>
          <FieldGroup label="اسم الملف" error={errors.fileName?.message}>
            <Input {...register("fileName")} />
          </FieldGroup>
          <FieldGroup label="الوصف" error={errors.description?.message}>
            <Input placeholder="فاتورة، كراسة مناقصة، شهادة تأمين..." {...register("description")} />
          </FieldGroup>
          {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
        </form>
      )}
    </Dialog>
  );
}
