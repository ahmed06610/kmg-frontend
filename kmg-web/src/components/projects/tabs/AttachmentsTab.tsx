"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { addProjectAttachment } from "@/actions/projects";
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
        <p className="text-body-sm text-on-surface-variant">
          مرفقات المشروع تُضاف كرابط ملف (مش رفع مباشر - لسه مش متاح في الباك اند)
        </p>
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
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectAttachmentFormValues>({
    resolver: zodResolver(projectAttachmentSchema),
    defaultValues: { fileUrl: "", fileName: "", description: "" },
  });

  const onSubmit = async (data: ProjectAttachmentFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await addProjectAttachment({ projectId, fileUrl: data.fileUrl, fileName: data.fileName || null, description: data.description || null });
    setLoading(false);
    if (!result.success) {
      setServerError(result.message ?? "حدث خطأ");
      return;
    }
    reset();
    onClose();
    router.refresh();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="إضافة مرفق"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="attachment-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "إضافة"}
          </Button>
        </>
      }
    >
      <form id="attachment-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
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
    </Dialog>
  );
}
