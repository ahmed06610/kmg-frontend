"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createProjectAndRedirect } from "@/actions/projects";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/Field";
import { createProjectSchema, type CreateProjectFormValues } from "@/schema/project";
import { ProjectType } from "@/types/enums";
import type { ClientListDTO } from "@/types/client";

export function CreateProjectDialog({ open, onClose, clients }: { open: boolean; onClose: () => void; clients: ClientListDTO[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { projectType: 0, clientId: 0, contractValue: 0, description: "" },
  });

  const projectType = watch("projectType");

  const onSubmit = async (data: CreateProjectFormValues) => {
    setLoading(true);
    setServerError(null);

    const payload = {
      projectType: data.projectType,
      clientId: data.clientId,
      contractValue: data.contractValue,
      description: data.description || null,
      tenderInsuranceAmount: projectType === ProjectType.ManufactureExecution ? data.tenderInsuranceAmount || null : null,
      tenderTaxAmount: projectType === ProjectType.ManufactureExecution ? data.tenderTaxAmount || null : null,
      supplyProfitMargin: projectType === ProjectType.Supply ? data.supplyProfitMargin || null : null,
    };

    const result = await createProjectAndRedirect(payload);
    setLoading(false);
    if (result && !result.success) {
      setServerError(result.message ?? "حدث خطأ");
      return;
    }
    onClose();
    router.refresh();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="مشروع جديد"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="create-project-form" disabled={loading}>
            {loading ? "جاري الإنشاء..." : "إنشاء المشروع"}
          </Button>
        </>
      }
    >
      <form id="create-project-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="نوع المشروع" error={errors.projectType?.message}>
          <Select {...register("projectType", { valueAsNumber: true })}>
            <option value={0}>اختر نوع المشروع</option>
            <option value={ProjectType.ManufactureExecution}>تصنيع وتنفيذ (مناقصة)</option>
            <option value={ProjectType.Subcontracting}>مقاولات من الباطن</option>
            <option value={ProjectType.Supply}>توريد</option>
          </Select>
        </FieldGroup>

        <FieldGroup label="العميل" error={errors.clientId?.message}>
          <Select {...register("clientId", { valueAsNumber: true })}>
            <option value={0}>اختر العميل</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup label="قيمة العقد" error={errors.contractValue?.message}>
          <Input type="number" step="0.01" dir="ltr" {...register("contractValue", { valueAsNumber: true })} />
        </FieldGroup>

        <FieldGroup label="وصف المشروع" error={errors.description?.message}>
          <Textarea rows={2} {...register("description")} />
        </FieldGroup>

        {projectType === ProjectType.ManufactureExecution && (
          <div className="grid grid-cols-2 gap-stack-md">
            <FieldGroup label="تأمين المناقصة" error={errors.tenderInsuranceAmount?.message}>
              <Input type="number" step="0.01" dir="ltr" {...register("tenderInsuranceAmount", { valueAsNumber: true })} />
            </FieldGroup>
            <FieldGroup label="ضريبة المناقصة" error={errors.tenderTaxAmount?.message}>
              <Input type="number" step="0.01" dir="ltr" {...register("tenderTaxAmount", { valueAsNumber: true })} />
            </FieldGroup>
          </div>
        )}

        {projectType === ProjectType.Supply && (
          <FieldGroup label="هامش الربح (%)" error={errors.supplyProfitMargin?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("supplyProfitMargin", { valueAsNumber: true })} />
          </FieldGroup>
        )}

        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
