"use client";

import { useT } from "@/lib/i18n/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { adjustCashBox } from "@/actions/cashbox";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input } from "@/components/ui/Field";
import { adjustCashBoxSchema, type AdjustCashBoxFormValues } from "@/schema/cashbox";

interface Props {
  open: boolean;
  onClose: () => void;
  currentCash: number;
  currentCredit: number;
}

export function AdjustCashBoxDialog({ open, onClose, currentCash, currentCredit }: Props) {
  const t = useT();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdjustCashBoxFormValues>({
    resolver: zodResolver(adjustCashBoxSchema),
    defaultValues: { newTotalCash: currentCash, newTotalCredit: currentCredit, reason: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ newTotalCash: currentCash, newTotalCredit: currentCredit, reason: "" });
      setServerError(null);
    }
  }, [open, currentCash, currentCredit, reset]);

  const onSubmit = async (data: AdjustCashBoxFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await adjustCashBox({ ...data, reason: data.reason || null });
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
      title={t("تعديل رصيد الخزنة")}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t("إلغاء")}</Button>
          <Button type="submit" form="adjust-cashbox-form" disabled={loading}>
            {loading ? t("جاري الحفظ...") : t("حفظ")}
          </Button>
        </>
      }
    >
      <form id="adjust-cashbox-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <p className="text-body-sm text-on-surface-variant">
          {t("هيتسجل الفرق بين الرصيد الحالي والجديد كحركة في سجل الخزنة توضح إن التعديل تم وأصبح الرصيد كذا.")}</p>
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label={t("الرصيد الكاش الجديد")} error={errors.newTotalCash?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("newTotalCash", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label={t("الرصيد الكريديت الجديد")} error={errors.newTotalCredit?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("newTotalCredit", { valueAsNumber: true })} />
          </FieldGroup>
        </div>
        <FieldGroup label={t("سبب التعديل (اختياري)")} error={errors.reason?.message}>
          <Input {...register("reason")} />
        </FieldGroup>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{t(serverError)}</div>}
      </form>
    </Dialog>
  );
}
