"use client";

import { useT } from "@/lib/i18n/client";
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
import { AdjustmentType, WageType, adjustmentTypeLabels } from "@/types/enums";
import type { EmployeeListDTO } from "@/types/employee";
import type { PayrollAdjustmentDTO } from "@/types/payroll";

const WORK_HOURS_PER_DAY = 9;
const HOURLY_PENALTY_FACTOR = 2;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// سعر الساعة التلقائي للعامل اليومي = (يوميته ÷ 9 ساعات) × 2 - نفس المضاعف اللي كان بيتطبق على المأموريات،
// بيحول "نصيب الساعة من اليومية" لسعر خصم/حافز واقعي بدل ما يبقى رقم هزيل مالوش معنى
function autoHourlyRate(employee: EmployeeListDTO | undefined): number | null {
  if (!employee || employee.wageType !== WageType.Daily) return null;
  return round2((employee.wageAmount / WORK_HOURS_PER_DAY) * HOURLY_PENALTY_FACTOR);
}

export function AdjustmentsSection({ adjustments, employees, canManage }: { adjustments: PayrollAdjustmentDTO[]; employees: EmployeeListDTO[]; canManage: boolean }) {
  const t = useT();
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
        {adjustments.length > 0 && <SearchInput value={table.search} onChange={table.setSearch} placeholder={t("بحث بالموظف أو السبب...")} />}
        {canManage && (
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Icon name="add" size={18} />
            {t("خصم / حافز جديد")}</Button>
        )}
      </div>

      {adjustments.length === 0 ? (
        <EmptyState icon="tune" title={t("لا توجد خصومات أو حوافز مسجلة بعد")} />
      ) : table.totalCount === 0 ? (
        <EmptyState icon="search_off" title={t("لا توجد نتائج مطابقة")} />
      ) : (
        <>
        <Table>
          <THead>
            <tr>
              <Th>{t("الموظف")}</Th>
              <Th>{t("النوع")}</Th>
              <Th>{t("القيمة")}</Th>
              <Th>{t("السبب")}</Th>
              <Th>{t("التاريخ")}</Th>
              <Th>{t("مُطبَّق")}</Th>
              {canManage && <Th>{t("إجراءات")}</Th>}
            </tr>
          </THead>
          <TBody>
            {table.pageRows.map((a) => (
              <Tr key={a.id}>
                <Td>{a.employeeName}</Td>
                <Td>
                  <Badge tone={a.type === "Bonus" ? "success" : "error"}>{t(adjustmentTypeLabels[a.type] ?? a.type)}</Badge>
                </Td>
                <TdMono>
                  {formatCurrency(a.amount)}
                  {a.hours != null && a.hourlyRate != null && (
                    <div className="text-xs text-on-surface-variant font-normal">
                      ({a.hours} {t(" ساعة × ")}{formatCurrency(a.hourlyRate)})
                    </div>
                  )}
                </TdMono>
                <Td>{a.reason}</Td>
                <Td>{formatDate(a.date)}</Td>
                <Td>{a.applied ? t("نعم") : t("لا")}</Td>
                {canManage && (
                  <Td>
                    {!a.applied ? (
                      <div className="flex items-center gap-1">
                        <button className="text-on-surface-variant hover:text-on-surface" title={t("تعديل")} onClick={() => setEditingAdjustment(a)}>
                          <Icon name="edit" size={18} />
                        </button>
                        <button className="text-error hover:opacity-80" title={t("حذف")} onClick={() => setDeletingAdjustment(a)}>
                          <Icon name="delete" size={18} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-on-surface-variant">{t("تم تطبيقها في راتب")}</span>
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
      <EditAdjustmentDialog open={!!editingAdjustment} onClose={() => setEditingAdjustment(null)} adjustment={editingAdjustment} employees={employees} />
      <ConfirmDialog
        open={!!deletingAdjustment}
        onClose={() => setDeletingAdjustment(null)}
        title={t("حذف التسوية")}
        message={t("هل أنت متأكد من حذف هذا الخصم/الحافز؟")}
        onConfirm={() => deleteAdjustment(deletingAdjustment!.id)}
        onConfirmed={() => router.refresh()}
      />
    </div>
  );
}

function CreateAdjustmentDialog({ open, onClose, employees }: { open: boolean; onClose: () => void; employees: EmployeeListDTO[] }) {
  const t = useT();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hourlyMode, setHourlyMode] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateAdjustmentFormValues>({
    resolver: zodResolver(createAdjustmentSchema),
    defaultValues: { employeeId: 0, type: 0, amount: 0, reason: "", date: new Date().toISOString().slice(0, 10), hours: 0, hourlyRate: 0 },
  });

  const employeeId = watch("employeeId");
  const hours = watch("hours") ?? 0;
  const hourlyRate = watch("hourlyRate") ?? 0;
  const selectedEmployee = employees.find((e) => e.id === employeeId);

  useEffect(() => {
    if (!hourlyMode) return;
    const auto = autoHourlyRate(selectedEmployee);
    if (auto != null) setValue("hourlyRate", auto);
  }, [hourlyMode, employeeId, selectedEmployee, setValue]);

  useEffect(() => {
    if (!hourlyMode) return;
    setValue("amount", round2(hours * hourlyRate), { shouldValidate: true });
  }, [hourlyMode, hours, hourlyRate, setValue]);

  const onSubmit = async (data: CreateAdjustmentFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await createAdjustment({ ...data, hours: hourlyMode ? data.hours : null, hourlyRate: hourlyMode ? data.hourlyRate : null });
    setLoading(false);
    if (!result.success) {
      setServerError(result.message ?? t("حدث خطأ"));
      return;
    }
    reset();
    setHourlyMode(false);
    onClose();
    router.refresh();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("إضافة خصم أو حافز")}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t("إلغاء")}</Button>
          <Button type="submit" form="create-adjustment-form" disabled={loading}>
            {loading ? t("جاري الحفظ...") : t("حفظ")}
          </Button>
        </>
      }
    >
      <form id="create-adjustment-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label={t("الموظف")} error={errors.employeeId?.message}>
          <Controller
            name="employeeId"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value ? String(field.value) : ""}
                onChange={(v) => field.onChange(Number(v))}
                placeholder={t("اختر موظف")}
                options={employees.map((e) => ({ value: String(e.id), label: e.name }))}
              />
            )}
          />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label={t("النوع")} error={errors.type?.message}>
            <Select {...register("type", { valueAsNumber: true })}>
              <option value={0}>{t("اختر النوع")}</option>
              <option value={AdjustmentType.Deduction}>{t("خصم")}</option>
              <option value={AdjustmentType.Bonus}>{t("حافز")}</option>
            </Select>
          </FieldGroup>
          <FieldGroup label={t("القيمة")} error={errors.amount?.message}>
            <Input type="number" step="0.01" dir="ltr" disabled={hourlyMode} {...register("amount", { valueAsNumber: true })} />
          </FieldGroup>
        </div>

        <label className="flex items-center gap-2 text-body-sm text-on-surface-variant">
          <input type="checkbox" checked={hourlyMode} onChange={(e) => setHourlyMode(e.target.checked)} />
          {t("احتساب القيمة بالساعة")}</label>

        {hourlyMode && (
          <div className="grid grid-cols-2 gap-stack-md rounded-lg border border-outline-variant p-stack-sm">
            <FieldGroup label={t("عدد الساعات")}>
              <Input type="number" step="0.5" min={0} dir="ltr" {...register("hours", { valueAsNumber: true })} />
            </FieldGroup>
            <FieldGroup label={t("سعر الساعة")}>
              <Input type="number" step="0.01" min={0} dir="ltr" {...register("hourlyRate", { valueAsNumber: true })} />
            </FieldGroup>
            <p className="col-span-2 text-xs text-on-surface-variant">
              {selectedEmployee && selectedEmployee.wageType === WageType.Daily
                ? t("سعر الساعة اتحسب تلقائيًا من يومية العامل (اليومية ÷ 9 × 2) - تقدر تعدّله يدويًا لو حابب")
                : t("اختر موظف شهري أو إداري وحدد سعر الساعة بنفسك")}
            </p>
            <p className="col-span-2 text-body-sm text-on-surface">
              {t("القيمة المحسوبة: ")}<span className="font-semibold">{formatCurrency(round2(hours * hourlyRate))}</span>
            </p>
          </div>
        )}

        <FieldGroup label={t("السبب")} error={errors.reason?.message}>
          <Input {...register("reason")} />
        </FieldGroup>
        <FieldGroup label={t("التاريخ")} error={errors.date?.message}>
          <Input type="date" {...register("date")} />
        </FieldGroup>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{t(serverError)}</div>}
      </form>
    </Dialog>
  );
}

function EditAdjustmentDialog({
  open,
  onClose,
  adjustment,
  employees,
}: {
  open: boolean;
  onClose: () => void;
  adjustment: PayrollAdjustmentDTO | null;
  employees: EmployeeListDTO[];
}) {
  const t = useT();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hourlyMode, setHourlyMode] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateAdjustmentFormValues>({
    resolver: zodResolver(updateAdjustmentSchema),
    defaultValues: { type: 0, amount: 0, reason: "", date: new Date().toISOString().slice(0, 10), hours: 0, hourlyRate: 0 },
  });

  useEffect(() => {
    if (open && adjustment) {
      reset({
        type: AdjustmentType[adjustment.type as keyof typeof AdjustmentType] ?? 0,
        amount: adjustment.amount,
        reason: adjustment.reason,
        date: adjustment.date.slice(0, 10),
        hours: adjustment.hours ?? 0,
        hourlyRate: adjustment.hourlyRate ?? 0,
      });
      setHourlyMode(adjustment.hours != null && adjustment.hourlyRate != null);
      setServerError(null);
    }
  }, [open, adjustment, reset]);

  const hours = watch("hours") ?? 0;
  const hourlyRate = watch("hourlyRate") ?? 0;
  const selectedEmployee = adjustment ? employees.find((e) => e.id === adjustment.employeeId) : undefined;

  useEffect(() => {
    if (!hourlyMode) return;
    setValue("amount", round2(hours * hourlyRate), { shouldValidate: true });
  }, [hourlyMode, hours, hourlyRate, setValue]);

  if (!adjustment) return null;

  const onSubmit = async (data: UpdateAdjustmentFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await updateAdjustment({
      id: adjustment.id,
      ...data,
      hours: hourlyMode ? data.hours : null,
      hourlyRate: hourlyMode ? data.hourlyRate : null,
    });
    setLoading(false);
    if (!result.success) {
      setServerError(result.message ?? t("حدث خطأ"));
      return;
    }
    onClose();
    router.refresh();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("تعديل خصم/حافز")}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t("إلغاء")}</Button>
          <Button type="submit" form="edit-adjustment-form" disabled={loading}>
            {loading ? t("جاري الحفظ...") : t("حفظ")}
          </Button>
        </>
      }
    >
      <form id="edit-adjustment-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label={t("النوع")} error={errors.type?.message}>
            <Select {...register("type", { valueAsNumber: true })}>
              <option value={0}>{t("اختر النوع")}</option>
              <option value={AdjustmentType.Deduction}>{t("خصم")}</option>
              <option value={AdjustmentType.Bonus}>{t("حافز")}</option>
            </Select>
          </FieldGroup>
          <FieldGroup label={t("القيمة")} error={errors.amount?.message}>
            <Input type="number" step="0.01" dir="ltr" disabled={hourlyMode} {...register("amount", { valueAsNumber: true })} />
          </FieldGroup>
        </div>

        <label className="flex items-center gap-2 text-body-sm text-on-surface-variant">
          <input type="checkbox" checked={hourlyMode} onChange={(e) => setHourlyMode(e.target.checked)} />
          {t("احتساب القيمة بالساعة")}</label>

        {hourlyMode && (
          <div className="grid grid-cols-2 gap-stack-md rounded-lg border border-outline-variant p-stack-sm">
            <FieldGroup label={t("عدد الساعات")}>
              <Input type="number" step="0.5" min={0} dir="ltr" {...register("hours", { valueAsNumber: true })} />
            </FieldGroup>
            <FieldGroup label={t("سعر الساعة")}>
              <Input type="number" step="0.01" min={0} dir="ltr" {...register("hourlyRate", { valueAsNumber: true })} />
            </FieldGroup>
            <p className="col-span-2 text-xs text-on-surface-variant">
              {selectedEmployee && selectedEmployee.wageType === WageType.Daily
                ? t("سعر الساعة اتحسب تلقائيًا من يومية العامل (اليومية ÷ 9 × 2) - تقدر تعدّله يدويًا لو حابب")
                : t("موظف شهري أو إداري - حدد سعر الساعة بنفسك")}
            </p>
            <p className="col-span-2 text-body-sm text-on-surface">
              {t("القيمة المحسوبة: ")}<span className="font-semibold">{formatCurrency(round2(hours * hourlyRate))}</span>
            </p>
          </div>
        )}

        <FieldGroup label={t("السبب")} error={errors.reason?.message}>
          <Input {...register("reason")} />
        </FieldGroup>
        <FieldGroup label={t("التاريخ")} error={errors.date?.message}>
          <Input type="date" {...register("date")} />
        </FieldGroup>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{t(serverError)}</div>}
      </form>
    </Dialog>
  );
}
