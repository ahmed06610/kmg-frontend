"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { deleteProjectExpense, recordProjectExpense, updateProjectExpense } from "@/actions/projects";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldGroup, Input, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { InvoiceAttachmentField, type InvoiceAttachmentValue } from "@/components/ui/InvoiceAttachmentField";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTableState } from "@/lib/useTableState";
import { projectExpenseSchema, updateProjectExpenseSchema, type ProjectExpenseFormValues, type UpdateProjectExpenseFormValues } from "@/schema/project";
import { ExpenseCategory, expenseCategoryLabels } from "@/types/enums";
import type { ProjectExpenseDTO } from "@/types/project";

export function ExpensesTab({ projectId, expenses, canManage }: { projectId: number; expenses: ProjectExpenseDTO[]; canManage: boolean }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ProjectExpenseDTO | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<ProjectExpenseDTO | null>(null);
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const table = useTableState({
    rows: expenses,
    pageSize: 10,
    searchPredicate: (e, term) =>
      (e.description ?? "").toLowerCase().includes(term) || (expenseCategoryLabels[e.category] ?? e.category).toLowerCase().includes(term),
  });

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex items-center justify-between flex-wrap gap-stack-sm">
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

      {expenses.length > 0 && <SearchInput value={table.search} onChange={table.setSearch} placeholder="بحث بالوصف أو التصنيف..." />}

      {expenses.length === 0 ? (
        <EmptyState icon="receipt_long" title="لا توجد مصاريف نثرية مسجلة بعد" />
      ) : table.totalCount === 0 ? (
        <EmptyState icon="search_off" title="لا توجد نتائج مطابقة" />
      ) : (
        <>
        <Table>
          <THead>
            <tr>
              <Th>التصنيف</Th>
              <Th>القيمة</Th>
              <Th>الوصف</Th>
              <Th>التاريخ</Th>
              {canManage && <Th>إجراءات</Th>}
            </tr>
          </THead>
          <TBody>
            {table.pageRows.map((e) => (
              <Tr key={e.id}>
                <Td>{expenseCategoryLabels[e.category] ?? e.category}</Td>
                <TdMono>{formatCurrency(e.amount)}</TdMono>
                <Td>{e.description ?? "-"}</Td>
                <Td>{formatDate(e.expenseDate)}</Td>
                {canManage && (
                  <Td>
                    <div className="flex items-center gap-1">
                      <button className="text-on-surface-variant hover:text-on-surface" title="تعديل" onClick={() => setEditingExpense(e)}>
                        <Icon name="edit" size={18} />
                      </button>
                      <button className="text-error hover:opacity-80" title="حذف" onClick={() => setDeletingExpense(e)}>
                        <Icon name="delete" size={18} />
                      </button>
                    </div>
                  </Td>
                )}
              </Tr>
            ))}
          </TBody>
        </Table>
        <Pagination page={table.page} pageSize={table.pageSize} totalCount={table.totalCount} onPageChange={table.setPage} />
        </>
      )}

      <RecordExpenseDialog open={dialogOpen} onClose={() => setDialogOpen(false)} projectId={projectId} />
      <EditExpenseDialog open={!!editingExpense} onClose={() => setEditingExpense(null)} projectId={projectId} expense={editingExpense} />
      <ConfirmDialog
        open={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
        title="حذف المصروف"
        message="هل أنت متأكد من حذف هذا المصروف؟ سيتم إلغاء أثره في الخزنة لو كان مخصومًا منها."
        onConfirm={() => deleteProjectExpense(deletingExpense!.id, projectId)}
        onConfirmed={() => router.refresh()}
      />
    </div>
  );
}

function RecordExpenseDialog({ open, onClose, projectId }: { open: boolean; onClose: () => void; projectId: number }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<InvoiceAttachmentValue | null>(null);

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
    const result = await recordProjectExpense({
      projectId,
      ...data,
      description: data.description || null,
      attachmentUrl: attachment?.attachmentUrl ?? null,
      attachmentFileName: attachment?.attachmentFileName ?? null,
    });
    setLoading(false);
    if (!result.success) {
      setServerError(result.message ?? "حدث خطأ");
      return;
    }
    reset();
    setAttachment(null);
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
        <InvoiceAttachmentField folder="projects" value={attachment} onChange={setAttachment} />
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}

function EditExpenseDialog({
  open,
  onClose,
  projectId,
  expense,
}: {
  open: boolean;
  onClose: () => void;
  projectId: number;
  expense: ProjectExpenseDTO | null;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProjectExpenseFormValues>({
    resolver: zodResolver(updateProjectExpenseSchema),
    defaultValues: { amount: 0, category: 0, description: "", expenseDate: formatDate(new Date()) },
  });

  useEffect(() => {
    if (open && expense) {
      reset({
        amount: expense.amount,
        category: ExpenseCategory[expense.category as keyof typeof ExpenseCategory] ?? 0,
        description: expense.description ?? "",
        expenseDate: expense.expenseDate.slice(0, 10),
      });
      setServerError(null);
    }
  }, [open, expense, reset]);

  if (!expense) return null;

  const onSubmit = async (data: UpdateProjectExpenseFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await updateProjectExpense({ id: expense.id, ...data, description: data.description || null }, projectId);
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
      title="تعديل مصروف نثري"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="edit-project-expense-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </>
      }
    >
      <form id="edit-project-expense-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
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
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
