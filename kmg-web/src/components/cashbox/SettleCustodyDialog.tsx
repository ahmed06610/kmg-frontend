"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { settleCustody } from "@/actions/custody";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input } from "@/components/ui/Field";
import { formatCurrency, formatDate } from "@/lib/utils";
import { settleCustodySchema, type SettleCustodyFormValues } from "@/schema/cashbox";
import type { CustodyDTO } from "@/types/custody";

export function SettleCustodyDialog({ open, onClose, custody }: { open: boolean; onClose: () => void; custody: CustodyDTO | null }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettleCustodyFormValues>({
    resolver: zodResolver(settleCustodySchema),
    defaultValues: { settledAmount: custody?.amount ?? 0, settledDate: formatDate(new Date()), notes: "" },
  });

  if (!custody) return null;

  const onSubmit = async (data: SettleCustodyFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await settleCustody({ custodyId: custody.id, ...data, notes: data.notes || null });
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
      title={`تسوية عهدة - ${custody.employeeName}`}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="settle-custody-form" disabled={loading}>
            {loading ? "جاري التسوية..." : "تسوية العهدة"}
          </Button>
        </>
      }
    >
      <p className="text-body-sm text-on-surface-variant">
        قيمة العهدة المصروفة: <span dir="ltr" className="font-mono-data text-on-surface">{formatCurrency(custody.amount)}</span>
      </p>
      <form id="settle-custody-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="المصروف الفعلي" error={errors.settledAmount?.message}>
          <Input type="number" step="0.01" dir="ltr" {...register("settledAmount", { valueAsNumber: true })} />
        </FieldGroup>
        <FieldGroup label="تاريخ التسوية" error={errors.settledDate?.message}>
          <Input type="date" {...register("settledDate")} />
        </FieldGroup>
        <FieldGroup label="ملاحظات" error={errors.notes?.message}>
          <Input {...register("notes")} />
        </FieldGroup>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
