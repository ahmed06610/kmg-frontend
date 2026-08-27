"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input } from "@/components/ui/Field";
import { loginSchema, type LoginFormValues } from "@/schema/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    setLoading(true);
    const result = await login(data);
    setLoading(false);

    if (!result.success) {
      setServerError(result.message ?? "حدث خطأ غير متوقع");
      return;
    }

    const from = searchParams.get("from") ?? "/";
    router.push(from);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
      {searchParams.get("sessionExpired") && (
        <div className="rounded bg-warning-container text-on-warning-container text-body-sm px-stack-md py-2">
          انتهت صلاحية الجلسة، سجّل الدخول مرة أخرى
        </div>
      )}

      <FieldGroup label="اسم المستخدم أو البريد الإلكتروني" error={errors.usernameOrEmail?.message}>
        <Input autoFocus autoComplete="username" {...register("usernameOrEmail")} />
      </FieldGroup>

      <FieldGroup label="كلمة المرور" error={errors.password?.message}>
        <Input type="password" autoComplete="current-password" {...register("password")} />
      </FieldGroup>

      {serverError && (
        <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">
          {serverError}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full mt-stack-sm">
        {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
      </Button>
    </form>
  );
}
