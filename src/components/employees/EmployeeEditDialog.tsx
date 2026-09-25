"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { updateWorker } from "@/actions/employees";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input, Select } from "@/components/ui/Field";
import { updateWorkerSchema, type UpdateWorkerFormValues } from "@/schema/employee";
import { EmployeeType, WageType } from "@/types/enums";
import type { EmployeeListDTO } from "@/types/employee";

export function EmployeeEditDialog({ open, onClose, employee }: { open: boolean; onClose: () => void; employee: EmployeeListDTO | null }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateWorkerFormValues>({
    resolver: zodResolver(updateWorkerSchema),
    defaultValues: { name: "", phone: "", employeeType: EmployeeType.Worker, wageType: WageType.Daily, wageAmount: 0, insuranceAmount: 0, suspended: false },
  });

  useEffect(() => {
    if (open && employee) {
      reset({
        name: employee.name,
        phone: employee.phone ?? "",
        employeeType: employee.employeeType,
        wageType: employee.wageType,
        wageAmount: employee.wageAmount,
        insuranceAmount: employee.insuranceAmount,
        suspended: employee.suspended,
      });
      setServerError(null);
    }
  }, [open, employee, reset]);

  if (!employee) return null;

  const onSubmit = async (data: UpdateWorkerFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await updateWorker({ id: employee.id, ...data, phone: data.phone || null });
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
      title={`تعديل بيانات ${employee.name}`}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="employee-edit-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
          </Button>
        </>
      }
    >
      <form id="employee-edit-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="الاسم" error={errors.name?.message}>
          <Input {...register("name")} />
        </FieldGroup>
        <FieldGroup label="رقم الهاتف" error={errors.phone?.message}>
          <Input {...register("phone")} />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label="النوع" error={errors.employeeType?.message}>
            <Select {...register("employeeType", { valueAsNumber: true })}>
              <option value={EmployeeType.Worker}>عامل</option>
              <option value={EmployeeType.Admin}>إداري</option>
            </Select>
          </FieldGroup>
          <FieldGroup label="نوع الأجر" error={errors.wageType?.message}>
            <Select {...register("wageType", { valueAsNumber: true })}>
              <option value={WageType.Daily}>يومي</option>
              <option value={WageType.Monthly}>شهري</option>
            </Select>
          </FieldGroup>
        </div>
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label="قيمة الأجر" error={errors.wageAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("wageAmount", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label="قيمة التأمين الشهري" error={errors.insuranceAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("insuranceAmount", { valueAsNumber: true })} />
          </FieldGroup>
        </div>
        <label className="flex items-center gap-2 text-body-sm text-on-surface">
          <input type="checkbox" {...register("suspended")} />
          موظف موقوف
        </label>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
