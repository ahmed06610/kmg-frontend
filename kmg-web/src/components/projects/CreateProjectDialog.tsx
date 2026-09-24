"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { createProjectAndRedirect } from "@/actions/projects";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
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
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", projectType: 0, clientId: 0, contractValue: 0, description: "" },
  });

  const projectType = watch("projectType");

  const onSubmit = async (data: CreateProjectFormValues) => {
    setLoading(true);
    setServerError(null);

    const isManufacture = projectType === ProjectType.ManufactureExecution;
    const payload = {
      name: data.name,
      projectType: data.projectType,
      clientId: data.clientId,
      contractValue: data.contractValue,
      description: data.description || null,
      tenderInsurancePercent: isManufacture ? data.tenderInsurancePercent || null : null,
      insuranceDueDate: isManufacture ? data.insuranceDueDate || null : null,
      tenderTaxPercent: isManufacture ? data.tenderTaxPercent || null : null,
      workGuaranteePercent: isManufacture ? data.workGuaranteePercent || null : null,
      workGuaranteeDueDate: isManufacture ? data.workGuaranteeDueDate || null : null,
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
        <FieldGroup label="اسم المشروع" error={errors.name?.message}>
          <Input {...register("name")} />
        </FieldGroup>

        <FieldGroup label="نوع المشروع" error={errors.projectType?.message}>
          <Select {...register("projectType", { valueAsNumber: true })}>
            <option value={0}>اختر نوع المشروع</option>
            <option value={ProjectType.ManufactureExecution}>تصنيع وتنفيذ (مناقصة)</option>
            <option value={ProjectType.Subcontracting}>مقاولات من الباطن</option>
            <option value={ProjectType.Supply}>توريد</option>
          </Select>
        </FieldGroup>

        <FieldGroup label="العميل" error={errors.clientId?.message}>
          <Controller
            name="clientId"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value ? String(field.value) : ""}
                onChange={(v) => field.onChange(Number(v))}
                placeholder="اختر العميل"
                options={clients.map((c) => ({ value: String(c.id), label: c.name }))}
              />
            )}
          />
        </FieldGroup>

        <FieldGroup label="قيمة العقد" error={errors.contractValue?.message}>
          <Input type="number" step="0.01" dir="ltr" {...register("contractValue", { valueAsNumber: true })} />
        </FieldGroup>

        <FieldGroup label="وصف المشروع" error={errors.description?.message}>
          <Textarea rows={2} {...register("description")} />
        </FieldGroup>

        {projectType === ProjectType.ManufactureExecution && (
          <>
            <div className="grid grid-cols-2 gap-stack-md">
              <FieldGroup label="نسبة تأمين المناقصة %" error={errors.tenderInsurancePercent?.message}>
                <Input type="number" step="0.01" dir="ltr" {...register("tenderInsurancePercent", { valueAsNumber: true })} />
              </FieldGroup>
              <FieldGroup label="تاريخ استحقاق استرداد التأمين" error={errors.insuranceDueDate?.message}>
                <Input type="date" {...register("insuranceDueDate")} />
              </FieldGroup>
            </div>
            <FieldGroup label="نسبة ضريبة المناقصة %" error={errors.tenderTaxPercent?.message}>
              <Input type="number" step="0.01" dir="ltr" {...register("tenderTaxPercent", { valueAsNumber: true })} />
            </FieldGroup>
            <div className="grid grid-cols-2 gap-stack-md">
              <FieldGroup label="نسبة ضمان الأعمال %" error={errors.workGuaranteePercent?.message}>
                <Input type="number" step="0.01" dir="ltr" {...register("workGuaranteePercent", { valueAsNumber: true })} />
              </FieldGroup>
              <FieldGroup label="تاريخ استحقاق استرداد الضمان" error={errors.workGuaranteeDueDate?.message}>
                <Input type="date" {...register("workGuaranteeDueDate")} />
              </FieldGroup>
            </div>
          </>
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
