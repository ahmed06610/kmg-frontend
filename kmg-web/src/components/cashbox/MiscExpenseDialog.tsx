"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createMiscExpense, updateMiscExpense } from "@/actions/cashbox";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input, Select } from "@/components/ui/Field";
import { formatDate } from "@/lib/utils";
import { miscExpenseSchema, type MiscExpenseFormValues } from "@/schema/cashbox";
import { MiscExpenseCategory } from "@/types/enums";
import type { CashBoxTransactionDTO } from "@/types/cashbox";

interface Props {
  open: boolean;
  onClose: () => void;
  transaction?: CashBoxTransactionDTO;
}

export function MiscExpenseDialog({ open, onClose, transaction }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!transaction;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MiscExpenseFormValues>({
    resolver: zodResolver(miscExpenseSchema),
    defaultValues: { amount: 0, category: 0, notes: "", expenseDate: formatDate(new Date()) },
  });

  useEffect(() => {
    if (open) {
      reset({
        amount: transaction ? -transaction.amountCash : 0,
        category: transaction?.miscExpenseCategory ? MiscExpenseCategory[transaction.miscExpenseCategory as keyof typeof MiscExpenseCategory] ?? 0 : 0,
        notes: transaction?.miscExpenseNotes ?? "",
        expenseDate: transaction?.miscExpenseDate ? transaction.miscExpenseDate.slice(0, 10) : formatDate(new Date()),
      });
      setServerError(null);
    }
  }, [open, transaction, reset]);

  const onSubmit = async (data: MiscExpenseFormValues) => {
    setLoading(true);
    setServerError(null);
    const payload = { ...data, notes: data.notes || null };
    const result =
      isEdit && transaction?.miscExpenseId
        ? await updateMiscExpense({ id: transaction.miscExpenseId, ...payload })
        : await createMiscExpense(payload);
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
      title={isEdit ? "تعديل مصروف نثري" : "مصروف نثري جديد"}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="misc-expense-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </>
      }
    >
      <form id="misc-expense-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="نوع المصروف" error={errors.category?.message}>
          <Select {...register("category", { valueAsNumber: true })}>
            <option value={0}>اختر النوع</option>
            <option value={MiscExpenseCategory.Administrative}>إداري</option>
            <option value={MiscExpenseCategory.Operational}>تشغيلي</option>
            <option value={MiscExpenseCategory.Other}>أخرى</option>
          </Select>
        </FieldGroup>
        <FieldGroup label="القيمة" error={errors.amount?.message}>
          <Input type="number" step="0.01" dir="ltr" {...register("amount", { valueAsNumber: true })} />
        </FieldGroup>
        <FieldGroup label="ملاحظات" error={errors.notes?.message}>
          <Input {...register("notes")} />
        </FieldGroup>
        <FieldGroup label="التاريخ" error={errors.expenseDate?.message}>
          <Input type="date" {...register("expenseDate")} />
        </FieldGroup>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
