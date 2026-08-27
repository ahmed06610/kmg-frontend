"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createWorker } from "@/actions/employees";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input, Select } from "@/components/ui/Field";
import { createWorkerSchema, type CreateWorkerFormValues } from "@/schema/employee";
import { EmployeeType, WageType } from "@/types/enums";

export function CreateWorkerDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkerFormValues>({
    resolver: zodResolver(createWorkerSchema),
    defaultValues: { name: "", phone: "", employeeType: EmployeeType.Worker, wageType: WageType.Daily, wageAmount: 0 },
  });

  const onSubmit = async (data: CreateWorkerFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await createWorker({ ...data, phone: data.phone || null });
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
      title="عامل جديد (بدون حساب دخول)"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="create-worker-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </>
      }
    >
      <form id="create-worker-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
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
        <FieldGroup label="قيمة الأجر" error={errors.wageAmount?.message}>
          <Input type="number" step="0.01" dir="ltr" {...register("wageAmount", { valueAsNumber: true })} />
        </FieldGroup>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
