"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { updateProject } from "@/actions/projects";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input, Textarea } from "@/components/ui/Field";
import { updateProjectSchema, type UpdateProjectFormValues } from "@/schema/project";
import type { ClientListDTO } from "@/types/client";
import type { ProjectDetailsDTO } from "@/types/project";

interface Props {
  open: boolean;
  onClose: () => void;
  project: ProjectDetailsDTO;
  clients: ClientListDTO[];
}

export function ProjectEditDialog({ open, onClose, project, clients }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name: project.name,
      clientId: project.clientId,
      contractValue: project.contractValue,
      description: project.description ?? "",
      tenderInsurancePercent: project.tenderInsurancePercent ?? undefined,
      insuranceDueDate: project.insuranceDueDate?.slice(0, 10) ?? "",
      tenderTaxPercent: project.tenderTaxPercent ?? undefined,
      workGuaranteePercent: project.workGuaranteePercent ?? undefined,
      workGuaranteeDueDate: project.workGuaranteeDueDate?.slice(0, 10) ?? "",
    },
  });

  const isManufacture = project.projectType === "ManufactureExecution";

  useEffect(() => {
    if (open) {
      reset({
        name: project.name,
        clientId: project.clientId,
        contractValue: project.contractValue,
        description: project.description ?? "",
        tenderInsurancePercent: project.tenderInsurancePercent ?? undefined,
        insuranceDueDate: project.insuranceDueDate?.slice(0, 10) ?? "",
        tenderTaxPercent: project.tenderTaxPercent ?? undefined,
        workGuaranteePercent: project.workGuaranteePercent ?? undefined,
        workGuaranteeDueDate: project.workGuaranteeDueDate?.slice(0, 10) ?? "",
      });
      setServerError(null);
    }
  }, [open, project, reset]);

  const onSubmit = async (data: UpdateProjectFormValues) => {
    setLoading(true);
    setServerError(null);

    const result = await updateProject({
      id: project.id,
      name: data.name,
      clientId: data.clientId,
      contractValue: data.contractValue,
      description: data.description || null,
      tenderInsurancePercent: isManufacture ? data.tenderInsurancePercent ?? null : null,
      insuranceDueDate: isManufacture ? data.insuranceDueDate || null : null,
      tenderTaxPercent: isManufacture ? data.tenderTaxPercent ?? null : null,
      workGuaranteePercent: isManufacture ? data.workGuaranteePercent ?? null : null,
      workGuaranteeDueDate: isManufacture ? data.workGuaranteeDueDate || null : null,
    });

    setLoading(false);
    if (!result.success) {
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
      title="تعديل بيانات المشروع"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="edit-project-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </>
      }
    >
      <form id="edit-project-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="اسم المشروع" error={errors.name?.message}>
          <Input {...register("name")} />
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

        {isManufacture && (
          <>
            <div className="grid grid-cols-2 gap-stack-md">
              <FieldGroup label="نسبة تأمين المناقصة %" error={errors.tenderInsurancePercent?.message}>
                <Input type="number" step="0.01" dir="ltr" disabled={project.insuranceRecovered} {...register("tenderInsurancePercent", { valueAsNumber: true })} />
              </FieldGroup>
              <FieldGroup label="تاريخ استحقاق استرداد التأمين" error={errors.insuranceDueDate?.message}>
                <Input type="date" disabled={project.insuranceRecovered} {...register("insuranceDueDate")} />
              </FieldGroup>
            </div>
            {project.insuranceRecovered && <p className="text-xs text-on-surface-variant -mt-2">التأمين مسترد بالفعل - مينفعش يتعدّل</p>}

            <FieldGroup label="نسبة ضريبة المناقصة %" error={errors.tenderTaxPercent?.message}>
              <Input type="number" step="0.01" dir="ltr" {...register("tenderTaxPercent", { valueAsNumber: true })} />
            </FieldGroup>

            <div className="grid grid-cols-2 gap-stack-md">
              <FieldGroup label="نسبة ضمان الأعمال %" error={errors.workGuaranteePercent?.message}>
                <Input type="number" step="0.01" dir="ltr" disabled={project.workGuaranteeRecovered} {...register("workGuaranteePercent", { valueAsNumber: true })} />
              </FieldGroup>
              <FieldGroup label="تاريخ استحقاق استرداد الضمان" error={errors.workGuaranteeDueDate?.message}>
                <Input type="date" disabled={project.workGuaranteeRecovered} {...register("workGuaranteeDueDate")} />
              </FieldGroup>
            </div>
            {project.workGuaranteeRecovered && <p className="text-xs text-on-surface-variant -mt-2">ضمان الأعمال مسترد بالفعل - مينفعش يتعدّل</p>}
          </>
        )}

        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
