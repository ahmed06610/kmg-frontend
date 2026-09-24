"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { editEmployee } from "@/actions/employees";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input, Select } from "@/components/ui/Field";
import { editEmployeeSchema, type EditEmployeeFormValues } from "@/schema/employee";
import { EmployeeType, WageType } from "@/types/enums";
import type { RoleDto } from "@/types/auth";
import type { EmployeeListDTO } from "@/types/employee";

export function EditEmployeeDialog({
  open,
  onClose,
  employee,
  roles,
}: {
  open: boolean;
  onClose: () => void;
  employee: EmployeeListDTO | null;
  roles: RoleDto[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(editEmployeeSchema),
    defaultValues: {
      userName: "",
      name: "",
      email: "",
      phone: "",
      password: "",
      roleId: "",
      employeeType: EmployeeType.Admin,
      wageType: WageType.Monthly,
      wageAmount: 0,
      suspended: false,
    },
  });

  useEffect(() => {
    if (open && employee) {
      reset({
        userName: employee.userName ?? "",
        name: employee.name,
        email: employee.email ?? "",
        phone: employee.phone ?? "",
        password: "",
        roleId: employee.roleId ?? "",
        employeeType: employee.employeeType,
        wageType: employee.wageType,
        wageAmount: employee.wageAmount,
        suspended: employee.suspended,
      });
      setServerError(null);
    }
  }, [open, employee, reset]);

  if (!employee) return null;

  const onSubmit = async (data: EditEmployeeFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await editEmployee({
      id: employee.id,
      ...data,
      email: data.email || null,
      phone: data.phone || null,
      password: data.password || null,
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
      title={`تعديل بيانات ${employee.name}`}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="edit-employee-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
          </Button>
        </>
      }
    >
      <form id="edit-employee-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="الاسم" error={errors.name?.message}>
          <Input {...register("name")} />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label="اسم المستخدم" error={errors.userName?.message}>
            <Input dir="ltr" {...register("userName")} />
          </FieldGroup>
          <FieldGroup label="كلمة مرور جديدة (اختياري)" error={errors.password?.message}>
            <Input type="password" dir="ltr" {...register("password")} placeholder="اتركها فاضية لو مش هتتغير" />
          </FieldGroup>
        </div>
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label="البريد الإلكتروني" error={errors.email?.message}>
            <Input dir="ltr" {...register("email")} />
          </FieldGroup>
          <FieldGroup label="رقم الهاتف" error={errors.phone?.message}>
            <Input {...register("phone")} />
          </FieldGroup>
        </div>
        <FieldGroup label="الدور" error={errors.roleId?.message}>
          <Select {...register("roleId")}>
            <option value="">اختر الدور</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label="نوع الأجر" error={errors.wageType?.message}>
            <Select {...register("wageType", { valueAsNumber: true })}>
              <option value={WageType.Monthly}>شهري</option>
              <option value={WageType.Daily}>يومي</option>
            </Select>
          </FieldGroup>
          <FieldGroup label="قيمة الأجر" error={errors.wageAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("wageAmount", { valueAsNumber: true })} />
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
