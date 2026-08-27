"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { recordSupplierPayment } from "@/actions/suppliers";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input } from "@/components/ui/Field";
import { formatDate } from "@/lib/utils";
import { supplierPaymentSchema, type SupplierPaymentFormValues } from "@/schema/supplier";

export function SupplierPaymentDialog({ open, onClose, supplierId, outstanding }: { open: boolean; onClose: () => void; supplierId: number; outstanding: number }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierPaymentFormValues>({
    resolver: zodResolver(supplierPaymentSchema),
    defaultValues: { amountCash: 0, amountCredit: 0, paymentDate: formatDate(new Date()), notes: "" },
  });

  const onSubmit = async (data: SupplierPaymentFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await recordSupplierPayment({ supplierId, ...data, notes: data.notes || null });
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
      title="تسجيل دفعة للمورد"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="supplier-payment-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "تسجيل الدفعة"}
          </Button>
        </>
      }
    >
      <p className="text-body-sm text-on-surface-variant">
        المستحق الحالي: <span dir="ltr" className="font-mono-data text-on-surface">{outstanding.toFixed(2)}</span>
      </p>
      <form id="supplier-payment-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label="المبلغ كاش" error={errors.amountCash?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("amountCash", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label="المبلغ كريديت" error={errors.amountCredit?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("amountCredit", { valueAsNumber: true })} />
          </FieldGroup>
        </div>
        <FieldGroup label="تاريخ الدفعة" error={errors.paymentDate?.message}>
          <Input type="date" {...register("paymentDate")} />
        </FieldGroup>
        <FieldGroup label="ملاحظات" error={errors.notes?.message}>
          <Input {...register("notes")} />
        </FieldGroup>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
