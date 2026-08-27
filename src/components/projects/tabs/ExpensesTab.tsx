"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { recordProjectExpense } from "@/actions/projects";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldGroup, Input, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { projectExpenseSchema, type ProjectExpenseFormValues } from "@/schema/project";
import { ExpenseCategory, expenseCategoryLabels } from "@/types/enums";
import type { ProjectExpenseDTO } from "@/types/project";

export function ExpensesTab({ projectId, expenses, canManage }: { projectId: number; expenses: ProjectExpenseDTO[]; canManage: boolean }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex items-center justify-between">
        <p className="text-body-sm text-on-surface-variant">
          الإجمالي: <span dir="ltr" className="font-mono-data text-on-surface font-semibold">{formatCurrency(total)}</span>
        </p>
        {canManage && (
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Icon name="add" size={18} />
            مصروف جديد
          </Button>
        )}
      </div>

      {expenses.length === 0 ? (
        <EmptyState icon="receipt_long" title="لا توجد مصاريف نثرية مسجلة بعد" />
      ) : (
        <Table>
          <THead>
            <tr>
              <Th>التصنيف</Th>
              <Th>القيمة</Th>
              <Th>الوصف</Th>
              <Th>التاريخ</Th>
            </tr>
          </THead>
          <TBody>
            {expenses.map((e) => (
              <Tr key={e.id}>
                <Td>{expenseCategoryLabels[e.category] ?? e.category}</Td>
                <TdMono>{formatCurrency(e.amount)}</TdMono>
                <Td>{e.description ?? "-"}</Td>
                <Td>{formatDate(e.expenseDate)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}

      <RecordExpenseDialog open={dialogOpen} onClose={() => setDialogOpen(false)} projectId={projectId} />
    </div>
  );
}

function RecordExpenseDialog({ open, onClose, projectId }: { open: boolean; onClose: () => void; projectId: number }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectExpenseFormValues>({
    resolver: zodResolver(projectExpenseSchema),
    defaultValues: { amount: 0, category: 0, description: "", expenseDate: formatDate(new Date()), paidFromCashBox: true },
  });

  const onSubmit = async (data: ProjectExpenseFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await recordProjectExpense({ projectId, ...data, description: data.description || null });
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
      title="تسجيل مصروف نثري"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="project-expense-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "تسجيل المصروف"}
          </Button>
        </>
      }
    >
      <form id="project-expense-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="التصنيف" error={errors.category?.message}>
          <Select {...register("category", { valueAsNumber: true })}>
            <option value={0}>اختر التصنيف</option>
            <option value={ExpenseCategory.TenderInsurance}>تأمين مناقصة</option>
            <option value={ExpenseCategory.TenderTax}>ضريبة مناقصة</option>
            <option value={ExpenseCategory.Procedural}>دفعة إجرائية</option>
            <option value={ExpenseCategory.Breakdown}>عطل</option>
            <option value={ExpenseCategory.Other}>أخرى</option>
          </Select>
        </FieldGroup>
        <FieldGroup label="القيمة" error={errors.amount?.message}>
          <Input type="number" step="0.01" dir="ltr" {...register("amount", { valueAsNumber: true })} />
        </FieldGroup>
        <FieldGroup label="الوصف" error={errors.description?.message}>
          <Input {...register("description")} />
        </FieldGroup>
        <FieldGroup label="التاريخ" error={errors.expenseDate?.message}>
          <Input type="date" {...register("expenseDate")} />
        </FieldGroup>
        <label className="flex items-center gap-2 text-body-sm text-on-surface">
          <input type="checkbox" {...register("paidFromCashBox")} defaultChecked />
          يخصم من الخزنة فورًا
        </label>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
