"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { issueToProject, returnFromProject } from "@/actions/stock";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input } from "@/components/ui/Field";
import { issueReturnSchema, type IssueReturnFormValues } from "@/schema/stock";
import type { MaterialDTO } from "@/types/stock";
import type { ProjectListDTO } from "@/types/project";

interface Props {
  open: boolean;
  onClose: () => void;
  mode: "issue" | "return";
  materials: MaterialDTO[];
  projects: ProjectListDTO[];
  defaultMaterialId?: number;
  defaultProjectId?: number;
}

export function IssueReturnDialog({ open, onClose, mode, materials, projects, defaultMaterialId, defaultProjectId }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isIssue = mode === "issue";

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IssueReturnFormValues>({
    resolver: zodResolver(issueReturnSchema),
    defaultValues: { materialId: defaultMaterialId ?? 0, projectId: defaultProjectId ?? 0, quantity: 0, notes: "" },
  });

  const onSubmit = async (data: IssueReturnFormValues) => {
    setLoading(true);
    setServerError(null);
    const payload = { ...data, notes: data.notes || null };
    const result = isIssue ? await issueToProject(payload) : await returnFromProject(payload);
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
      title={isIssue ? "صرف خامة لمشروع" : "مرتجع خامة من مشروع"}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="issue-return-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : isIssue ? "تسجيل الصرف" : "تسجيل المرتجع"}
          </Button>
        </>
      }
    >
      <form id="issue-return-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="الخامة" error={errors.materialId?.message}>
          <Controller
            name="materialId"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value ? String(field.value) : ""}
                onChange={(v) => field.onChange(Number(v))}
                disabled={!!defaultMaterialId}
                placeholder="اختر خامة"
                options={materials.map((m) => ({ value: String(m.id), label: m.name, hint: `متاح: ${m.quantity}` }))}
              />
            )}
          />
        </FieldGroup>
        <FieldGroup label="المشروع" error={errors.projectId?.message}>
          <Controller
            name="projectId"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value ? String(field.value) : ""}
                onChange={(v) => field.onChange(Number(v))}
                disabled={!!defaultProjectId}
                placeholder="اختر مشروع"
                options={projects.map((p) => ({ value: String(p.id), label: p.projectCode }))}
              />
            )}
          />
        </FieldGroup>
        <FieldGroup label="الكمية" error={errors.quantity?.message}>
          <Input type="number" step="0.01" dir="ltr" {...register("quantity", { valueAsNumber: true })} />
        </FieldGroup>
        <FieldGroup label="ملاحظات" error={errors.notes?.message}>
          <Input {...register("notes")} />
        </FieldGroup>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
