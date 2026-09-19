"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { createAdjustment, deleteAdjustment, updateAdjustment } from "@/actions/payroll";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldGroup, Input, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTableState } from "@/lib/useTableState";
import { createAdjustmentSchema, updateAdjustmentSchema, type CreateAdjustmentFormValues, type UpdateAdjustmentFormValues } from "@/schema/payroll";
import { AdjustmentType, adjustmentTypeLabels } from "@/types/enums";
import type { EmployeeListDTO } from "@/types/employee";
import type { PayrollAdjustmentDTO } from "@/types/payroll";

export function AdjustmentsSection({ adjustments, employees, canManage }: { adjustments: PayrollAdjustmentDTO[]; employees: EmployeeListDTO[]; canManage: boolean }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdjustment, setEditingAdjustment] = useState<PayrollAdjustmentDTO | null>(null);
  const [deletingAdjustment, setDeletingAdjustment] = useState<PayrollAdjustmentDTO | null>(null);

  const table = useTableState({
    rows: adjustments,
    pageSize: 10,
    searchPredicate: (a, term) => a.employeeName.toLowerCase().includes(term) || a.reason.toLowerCase().includes(term),
  });

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex items-center justify-between gap-stack-sm flex-wrap">
        {adjustments.length > 0 && <SearchInput value={table.search} onChange={table.setSearch} placeholder="بحث بالموظف أو السبب..." />}
        {canManage && (
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Icon name="add" size={18} />
            خصم / حافز جديد
          </Button>
        )}
      </div>

      {adjustments.length === 0 ? (
        <EmptyState icon="tune" title="لا توجد خصومات أو حوافز مسجلة بعد" />
      ) : table.totalCount === 0 ? (
        <EmptyState icon="search_off" title="لا توجد نتائج مطابقة" />
      ) : (
        <>
        <Table>
          <THead>
            <tr>
              <Th>الموظف</Th>
              <Th>النوع</Th>
              <Th>القيمة</Th>
              <Th>السبب</Th>
              <Th>التاريخ</Th>
              <Th>مُطبَّق</Th>
              {canManage && <Th>إجراءات</Th>}
            </tr>
          </THead>
          <TBody>
            {table.pageRows.map((a) => (
              <Tr key={a.id}>
                <Td>{a.employeeName}</Td>
                <Td>
                  <Badge tone={a.type === "Bonus" ? "success" : "error"}>{adjustmentTypeLabels[a.type] ?? a.type}</Badge>
                </Td>
                <TdMono>{formatCurrency(a.amount)}</TdMono>
                <Td>{a.reason}</Td>
                <Td>{formatDate(a.date)}</Td>
                <Td>{a.applied ? "نعم" : "لا"}</Td>
                {canManage && (
                  <Td>
                    {!a.applied ? (
                      <div className="flex items-center gap-1">
                        <button className="text-on-surface-variant hover:text-on-surface" title="تعديل" onClick={() => setEditingAdjustment(a)}>
                          <Icon name="edit" size={18} />
                        </button>
                        <button className="text-error hover:opacity-80" title="حذف" onClick={() => setDeletingAdjustment(a)}>
                          <Icon name="delete" size={18} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-on-surface-variant">تم تطبيقها في راتب</span>
                    )}
                  </Td>
                )}
              </Tr>
            ))}
          </TBody>
        </Table>
        <Pagination page={table.page} pageSize={table.pageSize} totalCount={table.totalCount} onPageChange={table.setPage} />
        </>
      )}

      <CreateAdjustmentDialog open={dialogOpen} onClose={() => setDialogOpen(false)} employees={employees} />
      <EditAdjustmentDialog open={!!editingAdjustment} onClose={() => setEditingAdjustment(null)} adjustment={editingAdjustment} />
      <ConfirmDialog
        open={!!deletingAdjustment}
        onClose={() => setDeletingAdjustment(null)}
        title="حذف التسوية"
        message="هل أنت متأكد من حذف هذا الخصم/الحافز؟"
        onConfirm={() => deleteAdjustment(deletingAdjustment!.id)}
        onConfirmed={() => router.refresh()}
      />
    </div>
  );
}

function CreateAdjustmentDialog({ open, onClose, employees }: { open: boolean; onClose: () => void; employees: EmployeeListDTO[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAdjustmentFormValues>({
    resolver: zodResolver(createAdjustmentSchema),
    defaultValues: { employeeId: 0, type: 0, amount: 0, reason: "", date: new Date().toISOString().slice(0, 10) },
  });

  const onSubmit = async (data: CreateAdjustmentFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await createAdjustment(data);
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
      title="إضافة خصم أو حافز"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="create-adjustment-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </>
      }
    >
      <form id="create-adjustment-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
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
          <FieldGroup label="النوع" error={errors.type?.message}>
            <Select {...register("type", { valueAsNumber: true })}>
              <option value={0}>اختر النوع</option>
              <option value={AdjustmentType.Deduction}>خصم</option>
              <option value={AdjustmentType.Bonus}>حافز</option>
            </Select>
          </FieldGroup>
          <FieldGroup label="القيمة" error={errors.amount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("amount", { valueAsNumber: true })} />
          </FieldGroup>
        </div>
        <FieldGroup label="السبب" error={errors.reason?.message}>
          <Input {...register("reason")} />
        </FieldGroup>
        <FieldGroup label="التاريخ" error={errors.date?.message}>
          <Input type="date" {...register("date")} />
        </FieldGroup>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}

function EditAdjustmentDialog({ open, onClose, adjustment }: { open: boolean; onClose: () => void; adjustment: PayrollAdjustmentDTO | null }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateAdjustmentFormValues>({
    resolver: zodResolver(updateAdjustmentSchema),
    defaultValues: { type: 0, amount: 0, reason: "", date: new Date().toISOString().slice(0, 10) },
  });

  useEffect(() => {
    if (open && adjustment) {
      reset({
        type: AdjustmentType[adjustment.type as keyof typeof AdjustmentType] ?? 0,
        amount: adjustment.amount,
        reason: adjustment.reason,
        date: adjustment.date.slice(0, 10),
      });
      setServerError(null);
    }
  }, [open, adjustment, reset]);

  if (!adjustment) return null;

  const onSubmit = async (data: UpdateAdjustmentFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await updateAdjustment({ id: adjustment.id, ...data });
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
      title="تعديل خصم/حافز"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="edit-adjustment-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </>
      }
    >
      <form id="edit-adjustment-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label="النوع" error={errors.type?.message}>
            <Select {...register("type", { valueAsNumber: true })}>
              <option value={0}>اختر النوع</option>
              <option value={AdjustmentType.Deduction}>خصم</option>
              <option value={AdjustmentType.Bonus}>حافز</option>
            </Select>
          </FieldGroup>
          <FieldGroup label="القيمة" error={errors.amount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("amount", { valueAsNumber: true })} />
          </FieldGroup>
        </div>
        <FieldGroup label="السبب" error={errors.reason?.message}>
          <Input {...register("reason")} />
        </FieldGroup>
        <FieldGroup label="التاريخ" error={errors.date?.message}>
          <Input type="date" {...register("date")} />
        </FieldGroup>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
