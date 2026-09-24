"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { createCustody, updateCustody } from "@/actions/custody";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input } from "@/components/ui/Field";
import { formatDate } from "@/lib/utils";
import { custodySchema, type CustodyFormValues } from "@/schema/cashbox";
import type { CustodyDTO } from "@/types/custody";
import type { EmployeeListDTO } from "@/types/employee";
import type { ProjectListDTO } from "@/types/project";

export function CustodyDialog({
  open,
  onClose,
  employees,
  projects,
  custody,
}: {
  open: boolean;
  onClose: () => void;
  employees: EmployeeListDTO[];
  projects: ProjectListDTO[];
  custody?: CustodyDTO;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!custody;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustodyFormValues>({
    resolver: zodResolver(custodySchema),
    defaultValues: { employeeId: 0, amountCash: 0, amountCredit: 0, description: "", issueDate: formatDate(new Date()), notes: "" },
  });

  useEffect(() => {
    if (open) {
      reset({
        employeeId: custody?.employeeId ?? 0,
        amountCash: custody?.amountCash ?? 0,
        amountCredit: custody?.amountCredit ?? 0,
        description: custody?.description ?? "",
        issueDate: custody ? custody.issueDate.slice(0, 10) : formatDate(new Date()),
        projectId: custody?.projectId ?? undefined,
        notes: custody?.notes ?? "",
      });
      setServerError(null);
    }
  }, [open, custody, reset]);

  const onSubmit = async (data: CustodyFormValues) => {
    setLoading(true);
    setServerError(null);
    const payload = { ...data, projectId: data.projectId || null, notes: data.notes || null };
    const result = isEdit ? await updateCustody({ id: custody!.id, ...payload }) : await createCustody(payload);
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
      title={isEdit ? "تعديل عهدة جانبية" : "عهدة جانبية جديدة"}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="custody-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "صرف العهدة"}
          </Button>
        </>
      }
    >
      <form id="custody-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="الموظف" error={errors.employeeId?.message}>
          <Controller
            name="employeeId"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value ? String(field.value) : ""}
                onChange={(v) => field.onChange(Number(v))}
                placeholder="اختر موظف"
                options={employees.map((e) => ({ value: String(e.id), label: e.name }))}
              />
            )}
          />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label="القيمة كاش" error={errors.amountCash?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("amountCash", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label="القيمة كريديت" error={errors.amountCredit?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("amountCredit", { valueAsNumber: true })} />
          </FieldGroup>
        </div>
        <FieldGroup label="الوصف" error={errors.description?.message}>
          <Input {...register("description")} placeholder="سبب صرف العهدة" />
        </FieldGroup>
        <FieldGroup label="تاريخ الصرف" error={errors.issueDate?.message}>
          <Input type="date" {...register("issueDate")} />
        </FieldGroup>
        <FieldGroup label="ربط بمشروع (اختياري)">
          <Controller
            name="projectId"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value ? String(field.value) : ""}
                onChange={(v) => field.onChange(v ? Number(v) : undefined)}
                placeholder="بدون ربط بمشروع"
                options={projects.map((p) => ({ value: String(p.id), label: `${p.name} (${p.projectCode})` }))}
              />
            )}
          />
        </FieldGroup>
        <FieldGroup label="ملاحظات" error={errors.notes?.message}>
          <Input {...register("notes")} />
        </FieldGroup>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
