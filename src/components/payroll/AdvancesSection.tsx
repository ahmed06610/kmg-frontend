"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { createAdvance, deleteAdvance, updateAdvance } from "@/actions/payroll";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldGroup, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { advanceStatusTone } from "@/lib/status-tone";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTableState } from "@/lib/useTableState";
import { createAdvanceSchema, updateAdvanceSchema, type CreateAdvanceFormValues, type UpdateAdvanceFormValues } from "@/schema/payroll";
import type { EmployeeListDTO } from "@/types/employee";
import type { AdvanceDTO } from "@/types/payroll";

export function AdvancesSection({ advances, employees, canManage }: { advances: AdvanceDTO[]; employees: EmployeeListDTO[]; canManage: boolean }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdvance, setEditingAdvance] = useState<AdvanceDTO | null>(null);
  const [deletingAdvance, setDeletingAdvance] = useState<AdvanceDTO | null>(null);

  const table = useTableState({
    rows: advances,
    pageSize: 10,
    searchPredicate: (a, term) => a.employeeName.toLowerCase().includes(term),
  });

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex items-center justify-between gap-stack-sm flex-wrap">
        {advances.length > 0 && <SearchInput value={table.search} onChange={table.setSearch} placeholder="بحث بالموظف..." />}
        {canManage && (
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Icon name="add" size={18} />
            سلفة جديدة
          </Button>
        )}
      </div>

      {advances.length === 0 ? (
        <EmptyState icon="account_balance" title="لا توجد سلف مسجلة بعد" />
      ) : table.totalCount === 0 ? (
        <EmptyState icon="search_off" title="لا توجد نتائج مطابقة" />
      ) : (
        <>
        <Table>
          <THead>
            <tr>
              <Th>الموظف</Th>
              <Th>المبلغ الكلي</Th>
              <Th>القسط</Th>
              <Th>المتبقي</Th>
              <Th>التاريخ</Th>
              <Th>الحالة</Th>
              {canManage && <Th>إجراءات</Th>}
            </tr>
          </THead>
          <TBody>
            {table.pageRows.map((a) => {
              const canEdit = a.remainingAmount === a.totalAmount;
              return (
                <Tr key={a.id}>
                  <Td>{a.employeeName}</Td>
                  <TdMono>{formatCurrency(a.totalAmount)}</TdMono>
                  <TdMono>{formatCurrency(a.installmentAmount)}</TdMono>
                  <TdMono>{formatCurrency(a.remainingAmount)}</TdMono>
                  <Td>{formatDate(a.issueDate)}</Td>
                  <Td>
                    <Badge tone={advanceStatusTone(a.status)}>{a.status === "Settled" ? "مسددة" : "نشطة"}</Badge>
                  </Td>
                  {canManage && (
                    <Td>
                      {canEdit ? (
                        <div className="flex items-center gap-1">
                          <button className="text-on-surface-variant hover:text-on-surface" title="تعديل" onClick={() => setEditingAdvance(a)}>
                            <Icon name="edit" size={18} />
                          </button>
                          <button className="text-error hover:opacity-80" title="حذف" onClick={() => setDeletingAdvance(a)}>
                            <Icon name="delete" size={18} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-on-surface-variant">تم خصم أقساط منها</span>
                      )}
                    </Td>
                  )}
                </Tr>
              );
            })}
          </TBody>
        </Table>
        <Pagination page={table.page} pageSize={table.pageSize} totalCount={table.totalCount} onPageChange={table.setPage} />
        </>
      )}

      <CreateAdvanceDialog open={dialogOpen} onClose={() => setDialogOpen(false)} employees={employees} />
      <EditAdvanceDialog open={!!editingAdvance} onClose={() => setEditingAdvance(null)} advance={editingAdvance} />
      <ConfirmDialog
        open={!!deletingAdvance}
        onClose={() => setDeletingAdvance(null)}
        title="حذف السلفة"
        message="هل أنت متأكد من حذف هذه السلفة؟ سيتم إلغاء أثرها في الخزنة."
        onConfirm={() => deleteAdvance(deletingAdvance!.id)}
        onConfirmed={() => router.refresh()}
      />
    </div>
  );
}

function CreateAdvanceDialog({ open, onClose, employees }: { open: boolean; onClose: () => void; employees: EmployeeListDTO[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAdvanceFormValues>({
    resolver: zodResolver(createAdvanceSchema),
    defaultValues: { employeeId: 0, totalAmount: 0, installmentAmount: 0, notes: "" },
  });

  const onSubmit = async (data: CreateAdvanceFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await createAdvance({ ...data, notes: data.notes || null });
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
      title="سلفة جديدة"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="create-advance-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "تسليم السلفة"}
          </Button>
        </>
      }
    >
      <form id="create-advance-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="الموظف" error={errors.employeeId?.message}>
          <Controller
            name="employeeId"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value ? String(field.value) : ""}
                onChange={(v) => field.onChange(Number(v))}
                placeholder="اختر موظف"
                options={employees.map((e) => ({ value: String(e.id), label: e.name }))}
              />
            )}
          />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label="قيمة السلفة" error={errors.totalAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("totalAmount", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label="قيمة القسط الأسبوعي" error={errors.installmentAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("installmentAmount", { valueAsNumber: true })} />
          </FieldGroup>
        </div>
        <FieldGroup label="ملاحظات" error={errors.notes?.message}>
          <Input {...register("notes")} />
        </FieldGroup>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}

function EditAdvanceDialog({ open, onClose, advance }: { open: boolean; onClose: () => void; advance: AdvanceDTO | null }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateAdvanceFormValues>({
    resolver: zodResolver(updateAdvanceSchema),
    defaultValues: { totalAmount: 0, installmentAmount: 0, notes: "" },
  });

  useEffect(() => {
    if (open && advance) {
      reset({ totalAmount: advance.totalAmount, installmentAmount: advance.installmentAmount, notes: advance.notes ?? "" });
      setServerError(null);
    }
  }, [open, advance, reset]);

  if (!advance) return null;

  const onSubmit = async (data: UpdateAdvanceFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await updateAdvance({ id: advance.id, ...data, notes: data.notes || null });
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
      title="تعديل السلفة"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="edit-advance-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </>
      }
    >
      <form id="edit-advance-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label="قيمة السلفة" error={errors.totalAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("totalAmount", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label="قيمة القسط الأسبوعي" error={errors.installmentAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("installmentAmount", { valueAsNumber: true })} />
          </FieldGroup>
        </div>
        <FieldGroup label="ملاحظات" error={errors.notes?.message}>
          <Input {...register("notes")} />
        </FieldGroup>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
