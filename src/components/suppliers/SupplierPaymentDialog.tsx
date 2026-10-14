"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { recordSupplierPayment, updateSupplierPayment } from "@/actions/suppliers";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input } from "@/components/ui/Field";
import { InvoiceAttachmentField, type InvoiceAttachmentValue } from "@/components/ui/InvoiceAttachmentField";
import { formatDate } from "@/lib/utils";
import { supplierPaymentSchema, type SupplierPaymentFormValues } from "@/schema/supplier";
import type { SupplierPaymentDTO } from "@/types/supplier";

interface Props {
  open: boolean;
  onClose: () => void;
  supplierId: number;
  outstanding: number;
  payment?: SupplierPaymentDTO;
}

export function SupplierPaymentDialog({ open, onClose, supplierId, outstanding, payment }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<InvoiceAttachmentValue | null>(null);
  const isEdit = !!payment;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SupplierPaymentFormValues>({
    resolver: zodResolver(supplierPaymentSchema),
    defaultValues: { amountCash: 0, amountCredit: 0, paymentDate: formatDate(new Date()), notes: "", isCheck: false, checkDueDate: "" },
  });

  useEffect(() => {
    if (open) {
      reset({
        amountCash: payment?.amountCash ?? 0,
        amountCredit: payment?.amountCredit ?? 0,
        paymentDate: payment ? payment.paymentDate.slice(0, 10) : formatDate(new Date()),
        notes: payment?.notes ?? "",
        isCheck: payment?.isCheck ?? false,
        checkDueDate: payment?.checkDueDate ? payment.checkDueDate.slice(0, 10) : "",
      });
      setAttachment(
        payment?.attachmentUrl ? { attachmentUrl: payment.attachmentUrl, attachmentFileName: payment.attachmentFileName ?? payment.attachmentUrl } : null,
      );
      setServerError(null);
    }
  }, [open, payment, reset]);

  const isCheck = watch("isCheck");

  const onSubmit = async (data: SupplierPaymentFormValues) => {
    setLoading(true);
    setServerError(null);

    const payload = {
      amountCash: data.amountCash,
      amountCredit: data.isCheck ? 0 : data.amountCredit,
      paymentDate: data.paymentDate,
      notes: data.notes || null,
      isCheck: data.isCheck,
      checkDueDate: data.isCheck ? data.checkDueDate || null : null,
      attachmentUrl: attachment?.attachmentUrl ?? null,
      attachmentFileName: attachment?.attachmentFileName ?? null,
    };

    const result = isEdit
      ? await updateSupplierPayment({ id: payment!.id, ...payload }, supplierId)
      : await recordSupplierPayment({ supplierId, ...payload });

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
      title={isEdit ? "تعديل دفعة المورد" : "تسجيل دفعة للمورد"}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="supplier-payment-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </>
      }
    >
      <p className="text-body-sm text-on-surface-variant">
        المستحق الحالي: <span dir="ltr" className="font-mono-data text-on-surface">{outstanding.toFixed(2)}</span>
      </p>
      <form id="supplier-payment-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <label className="flex items-center gap-2 text-body-sm text-on-surface">
          <input type="checkbox" {...register("isCheck")} />
          دفعة بشيك
        </label>

        {isCheck ? (
          <FieldGroup label="قيمة الشيك" error={errors.amountCash?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("amountCash", { valueAsNumber: true })} />
          </FieldGroup>
        ) : (
          <div className="grid grid-cols-2 gap-stack-md">
            <FieldGroup label="المبلغ كاش" error={errors.amountCash?.message}>
              <Input type="number" step="0.01" dir="ltr" {...register("amountCash", { valueAsNumber: true })} />
            </FieldGroup>
            <FieldGroup label="المبلغ كريديت" error={errors.amountCredit?.message}>
              <Input type="number" step="0.01" dir="ltr" {...register("amountCredit", { valueAsNumber: true })} />
            </FieldGroup>
          </div>
        )}

        {isCheck && (
          <FieldGroup label="تاريخ استحقاق الشيك" error={errors.checkDueDate?.message}>
            <Input type="date" {...register("checkDueDate")} />
          </FieldGroup>
        )}

        <FieldGroup label="تاريخ الدفعة" error={errors.paymentDate?.message}>
          <Input type="date" {...register("paymentDate")} />
        </FieldGroup>
        <FieldGroup label="ملاحظات" error={errors.notes?.message}>
          <Input {...register("notes")} />
        </FieldGroup>
        <InvoiceAttachmentField folder="suppliers" value={attachment} onChange={setAttachment} />
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
