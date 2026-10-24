"use client";

import { useT } from "@/lib/i18n/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { registerEmployee } from "@/actions/employees";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input, Select } from "@/components/ui/Field";
import { registerEmployeeSchema, type RegisterEmployeeFormValues } from "@/schema/employee";
import { EmployeeType, WageType } from "@/types/enums";
import type { RoleDto } from "@/types/auth";

export function RegisterEmployeeDialog({ open, onClose, roles }: { open: boolean; onClose: () => void; roles: RoleDto[] }) {
  const t = useT();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterEmployeeFormValues>({
    resolver: zodResolver(registerEmployeeSchema),
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
      insuranceAmount: 0,
      misrInsuranceAmount: 0,
    },
  });

  const onSubmit = async (data: RegisterEmployeeFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await registerEmployee({ ...data, email: data.email || null, phone: data.phone || null });
    setLoading(false);
    if (!result.success) {
      setServerError(result.message ?? t("حدث خطأ"));
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
      title={t("تسجيل موظف بحساب دخول")}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t("إلغاء")}</Button>
          <Button type="submit" form="register-employee-form" disabled={loading}>
            {loading ? t("جاري الحفظ...") : t("تسجيل الموظف")}
          </Button>
        </>
      }
    >
      <form id="register-employee-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label={t("الاسم")} error={errors.name?.message}>
          <Input {...register("name")} />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label={t("اسم المستخدم")} error={errors.userName?.message}>
            <Input dir="ltr" {...register("userName")} />
          </FieldGroup>
          <FieldGroup label={t("كلمة المرور")} error={errors.password?.message}>
            <Input type="password" dir="ltr" {...register("password")} />
          </FieldGroup>
        </div>
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label={t("البريد الإلكتروني")} error={errors.email?.message}>
            <Input dir="ltr" {...register("email")} />
          </FieldGroup>
          <FieldGroup label={t("رقم الهاتف")} error={errors.phone?.message}>
            <Input {...register("phone")} />
          </FieldGroup>
        </div>
        <FieldGroup label={t("الدور")} error={errors.roleId?.message}>
          <Select {...register("roleId")}>
            <option value="">{t("اختر الدور")}</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label={t("نوع الأجر")} error={errors.wageType?.message}>
            <Select {...register("wageType", { valueAsNumber: true })}>
              <option value={WageType.Monthly}>{t("شهري")}</option>
              <option value={WageType.Daily}>{t("يومي")}</option>
            </Select>
          </FieldGroup>
          <FieldGroup label={t("قيمة الأجر")} error={errors.wageAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("wageAmount", { valueAsNumber: true })} />
          </FieldGroup>
        </div>
        <FieldGroup label={t("قيمة التأمين الشهري")} error={errors.insuranceAmount?.message}>
          <Input type="number" step="0.01" dir="ltr" {...register("insuranceAmount", { valueAsNumber: true })} />
        </FieldGroup>
        <FieldGroup label={t("قيمة مصر للتأمين الشهري")} error={errors.misrInsuranceAmount?.message}>
          <Input type="number" step="0.01" dir="ltr" {...register("misrInsuranceAmount", { valueAsNumber: true })} />
        </FieldGroup>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{t(serverError)}</div>}
      </form>
    </Dialog>
  );
}
