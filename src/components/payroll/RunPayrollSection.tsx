"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { deletePayrollPayout, previewPayroll, runPayroll, updatePayrollPayout } from "@/actions/payroll";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Combobox } from "@/components/ui/Combobox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExportButton } from "@/components/ui/ExportButton";
import { FieldGroup, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { downloadWorkbook } from "@/lib/excel";
import { downloadStyledWeeklyPayroll, type StyledPayrollWeek } from "@/lib/excelStyled";
import { formatCurrency, formatDate } from "@/lib/utils";
import { runPayrollSchema, type RunPayrollFormValues, updatePayrollPayoutSchema, type UpdatePayrollPayoutFormValues } from "@/schema/payroll";
import type { EmployeeListDTO } from "@/types/employee";
import type { PayrollPayoutDTO, PayrollPreviewDTO } from "@/types/payroll";

// الأسبوع المصري بيبدأ السبت وينتهي الجمعة - بنقسم الفترة المختارة لأسابيع زي الشيت اليدوي اللي المحاسب متعود عليه
function splitIntoWeeks(startStr: string, endStr: string): { start: string; end: string }[] {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const weeks: { start: string; end: string }[] = [];
  let cursor = new Date(start);

  while (cursor <= end) {
    const dayOfWeek = cursor.getDay(); // 0=أحد ... 6=سبت
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    const weekEnd = new Date(cursor);
    weekEnd.setDate(cursor.getDate() + daysUntilFriday);
    const actualEnd = weekEnd < end ? weekEnd : end;

    weeks.push({ start: formatDate(cursor), end: formatDate(actualEnd) });

    cursor = new Date(actualEnd);
    cursor.setDate(cursor.getDate() + 1);
  }

  return weeks;
}

function shortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}-${d.getDate()}`;
}

const ARABIC_WEEKDAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function longDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${ARABIC_WEEKDAYS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function BulkPayrollSection({ employees }: { employees: EmployeeListDTO[] }) {
  const router = useRouter();
  const activeEmployees = employees.filter((e) => !e.suspended);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [running, setRunning] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [exportingWeekly, setExportingWeekly] = useState(false);
  const [previews, setPreviews] = useState<PayrollPreviewDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setPreviews(null);
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === activeEmployees.length ? new Set() : new Set(activeEmployees.map((e) => e.id))));
    setPreviews(null);
  }

  async function handlePreviewAll() {
    if (!periodStart || !periodEnd) {
      setError("حدد بداية ونهاية الفترة أولًا");
      return;
    }
    if (selected.size === 0) {
      setError("اختر موظف واحد على الأقل");
      return;
    }

    setPreviewing(true);
    setError(null);
    setPreviews(null);

    const results: PayrollPreviewDTO[] = [];
    const failed: { name: string; message: string }[] = [];

    for (const employeeId of selected) {
      const employee = activeEmployees.find((e) => e.id === employeeId)!;
      const result = await previewPayroll({ employeeId, periodStart, periodEnd });
      if (result.success && result.data) {
        results.push(result.data);
      } else {
        failed.push({ name: employee.name, message: result.message ?? "حدث خطأ" });
      }
    }

    setPreviewing(false);
    setPreviews(results);

    if (failed.length > 0) {
      setError(`فشلت معاينة ${failed.length} موظف: ${failed.map((f) => `${f.name} (${f.message})`).join("، ")}`);
    }
  }

  async function handleDisburse() {
    if (!periodStart || !periodEnd) {
      setError("حدد بداية ونهاية الفترة أولًا");
      return;
    }
    if (selected.size === 0) {
      setError("اختر موظف واحد على الأقل");
      return;
    }

    setRunning(true);
    setError(null);

    const succeeded: PayrollPayoutDTO[] = [];
    const failed: { name: string; message: string }[] = [];

    for (const employeeId of selected) {
      const employee = activeEmployees.find((e) => e.id === employeeId)!;
      const result = await runPayroll({ employeeId, periodStart, periodEnd });
      if (result.success && result.data) {
        succeeded.push(result.data);
      } else {
        failed.push({ name: employee.name, message: result.message ?? "حدث خطأ" });
      }
    }

    setRunning(false);

    if (succeeded.length > 0) {
      downloadWorkbook(`صرف_رواتب_${periodStart}_${periodEnd}`, [
        {
          name: "صرف الرواتب",
          columns: [
            { header: "الموظف", key: "employee" },
            { header: "الأساسي", key: "base" },
            { header: "أجر أيام المأمورية الإضافي", key: "missionDoubleUp" },
            { header: "حوافز", key: "bonus" },
            { header: "خصومات", key: "deductions" },
            { header: "قسط سلفة", key: "advanceInstallment" },
            { header: "خصم تأمين", key: "insurance" },
            { header: "خصم مصر للتأمين", key: "misrInsurance" },
            { header: "الصافي", key: "net" },
          ],
          rows: succeeded.map((p) => ({
            employee: p.employeeName,
            base: p.baseAmount,
            missionDoubleUp: p.missionDoubleUpAmount,
            bonus: p.bonusAmount,
            deductions: p.deductionsAmount,
            advanceInstallment: p.advanceInstallmentAmount,
            insurance: p.insuranceAmount,
            misrInsurance: p.misrInsuranceAmount,
            net: p.netPaid,
          })),
        },
      ]);
    }

    if (failed.length > 0) {
      setError(`فشل صرف راتب ${failed.length} موظف: ${failed.map((f) => `${f.name} (${f.message})`).join("، ")}`);
    }

    setSelected(new Set());
    setPreviews(null);
    router.refresh();
  }

  // تصدير بالشكل الأسبوعي اللي المحاسب متعود عليه: شيت منفصل لكل أسبوع (سبت-جمعة)، عمود "ورشة" للأيام العادية
  // وعمود "سفر" لأيام المأمورية، وباقي الأعمدة من بيانات الراتب الفعلية - بدون أي صرف فعلي، معاينة بس
  async function handleExportWeekly() {
    if (!periodStart || !periodEnd) {
      setError("حدد بداية ونهاية الفترة أولًا");
      return;
    }
    if (selected.size === 0) {
      setError("اختر موظف واحد على الأقل");
      return;
    }

    setExportingWeekly(true);
    setError(null);

    const weeks = splitIntoWeeks(periodStart, periodEnd);
    const failed: { name: string; message: string }[] = [];
    const sheets: StyledPayrollWeek[] = [];

    for (const week of weeks) {
      const rows: StyledPayrollWeek["rows"] = [];
      const periodLabel = `الاجور من ${longDateLabel(week.start)} حتى ${longDateLabel(week.end)}`;
      for (const employeeId of selected) {
        const employee = activeEmployees.find((e) => e.id === employeeId)!;
        const result = await previewPayroll({ employeeId, periodStart: week.start, periodEnd: week.end });
        if (result.success && result.data) {
          const p = result.data;
          const gross = p.baseAmount + p.missionDoubleUpAmount + p.bonusAmount;
          rows.push({
            name: p.employeeName,
            workshop: p.workshopDays,
            travel: p.missionDays,
            totalDays: p.workshopDays + p.missionDays,
            rate: employee.wageAmount,
            gross,
            advanceBalance: employee.remainingAdvances,
            advanceDeducted: p.advanceInstallmentAmount,
            netAfterAdvance: gross - p.advanceInstallmentAmount,
            insurance: p.insuranceAmount,
            misrInsurance: p.misrInsuranceAmount,
            hourlyDeduction: p.hourlyDeductionAmount,
            hourlyBonus: p.hourlyBonusAmount,
            net: p.netPaid,
          });
        } else {
          failed.push({ name: `${employee.name} (${week.start})`, message: result.message ?? "حدث خطأ" });
        }
      }
      sheets.push({ sheetName: `من ${shortDate(week.start)} حتى ${shortDate(week.end)}`, periodLabel, rows });
    }

    if (sheets.some((s) => s.rows.length > 0)) {
      await downloadStyledWeeklyPayroll(`الرواتب_الاسبوعي_${periodStart}_${periodEnd}`, sheets);
    }

    setExportingWeekly(false);

    if (failed.length > 0) {
      setError(`فشلت معاينة ${failed.length} سجل: ${failed.map((f) => `${f.name} (${f.message})`).join("، ")}`);
    }
  }

  return (
    <Card>
      <p className="text-title-sm text-on-surface mb-stack-md">صرف رواتب جماعي</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-stack-md mb-stack-md">
        <FieldGroup label="بداية الفترة">
          <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
        </FieldGroup>
        <FieldGroup label="نهاية الفترة">
          <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
        </FieldGroup>
      </div>

      {activeEmployees.length === 0 ? (
        <EmptyState icon="groups" title="لا يوجد موظفين نشطين" />
      ) : (
        <Table>
          <THead>
            <tr>
              <Th>
                <input type="checkbox" checked={selected.size === activeEmployees.length} onChange={toggleAll} />
              </Th>
              <Th>الموظف</Th>
              <Th>نوع الأجر</Th>
            </tr>
          </THead>
          <TBody>
            {activeEmployees.map((e) => (
              <Tr key={e.id}>
                <Td>
                  <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggle(e.id)} />
                </Td>
                <Td>{e.name}</Td>
                <Td>{e.wageType === 1 ? "شهري" : "يومي"}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}

      {error && <div className="mt-stack-md rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{error}</div>}

      <div className="mt-stack-md flex items-center gap-stack-sm flex-wrap">
        <Button variant="secondary" onClick={handlePreviewAll} disabled={previewing || running || selected.size === 0}>
          {previewing ? "جاري المعاينة..." : `معاينة قبل الصرف (${selected.size})`}
        </Button>
        <Button onClick={handleDisburse} disabled={running || previewing || selected.size === 0}>
          {running ? "جاري الصرف..." : `صرف رواتب المحددين (${selected.size})`}
        </Button>
        <Button variant="secondary" onClick={handleExportWeekly} disabled={exportingWeekly || running || selected.size === 0}>
          <Icon name="download" size={18} />
          {exportingWeekly ? "جاري التصدير..." : "تصدير الشكل الأسبوعي"}
        </Button>
      </div>

      {previews && previews.length > 0 && (
        <div className="mt-stack-md">
          <p className="text-body-sm text-on-surface-variant mb-stack-sm">معاينة المستحقات قبل الصرف الفعلي - راجع الأرقام ثم اضغط "صرف رواتب المحددين" لو كل شيء صحيح</p>
          <Table>
            <THead>
              <tr>
                <Th>الموظف</Th>
                <Th>الأساسي</Th>
                <Th>أجر أيام المأمورية الإضافي</Th>
                <Th>حوافز</Th>
                <Th>خصومات</Th>
                <Th>قسط سلفة</Th>
                <Th>خصم تأمين</Th>
                <Th>خصم مصر للتأمين</Th>
                <Th>الصافي</Th>
              </tr>
            </THead>
            <TBody>
              {previews.map((p) => (
                <Tr key={p.employeeId}>
                  <Td>{p.employeeName}</Td>
                  <TdMono>{formatCurrency(p.baseAmount)}</TdMono>
                  <TdMono>{formatCurrency(p.missionDoubleUpAmount)}</TdMono>
                  <TdMono>{formatCurrency(p.bonusAmount)}</TdMono>
                  <TdMono>{formatCurrency(p.deductionsAmount)}</TdMono>
                  <TdMono>{formatCurrency(p.advanceInstallmentAmount)}</TdMono>
                  <TdMono>{formatCurrency(p.insuranceAmount)}</TdMono>
                  <TdMono>{formatCurrency(p.misrInsuranceAmount)}</TdMono>
                  <TdMono className="font-semibold">{formatCurrency(p.netPaid)}</TdMono>
                </Tr>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </Card>
  );
}

export function RunPayrollSection({
  employees,
  history,
  canManage,
}: {
  employees: EmployeeListDTO[];
  history: PayrollPayoutDTO[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [preview, setPreview] = useState<PayrollPreviewDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [editingPayout, setEditingPayout] = useState<PayrollPayoutDTO | null>(null);
  const [deletingPayout, setDeletingPayout] = useState<PayrollPayoutDTO | null>(null);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RunPayrollFormValues>({
    resolver: zodResolver(runPayrollSchema),
    defaultValues: { employeeId: 0, periodStart: "", periodEnd: "" },
  });

  const onPreview = handleSubmit(async (data) => {
    setPreviewLoading(true);
    setError(null);
    setPreview(null);
    const result = await previewPayroll(data);
    setPreviewLoading(false);
    if (!result.success || !result.data) {
      setError(result.message ?? "حدث خطأ");
      return;
    }
    setPreview(result.data);
  });

  const onRun = async () => {
    setRunLoading(true);
    setError(null);
    const result = await runPayroll(getValues());
    setRunLoading(false);
    if (!result.success) {
      setError(result.message ?? "حدث خطأ");
      return;
    }
    setPreview(null);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-stack-lg">
      <BulkPayrollSection employees={employees} />
      <Card>
        <form onSubmit={onPreview} className="flex flex-col gap-stack-md">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-stack-md">
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
            <FieldGroup label="بداية الفترة" error={errors.periodStart?.message}>
              <Input type="date" {...register("periodStart")} />
            </FieldGroup>
            <FieldGroup label="نهاية الفترة" error={errors.periodEnd?.message}>
              <Input type="date" {...register("periodEnd")} />
            </FieldGroup>
          </div>
          <div>
            <Button type="submit" variant="secondary" disabled={previewLoading}>
              {previewLoading ? "جاري الحساب..." : "معاينة المستحقات"}
            </Button>
          </div>
        </form>

        {error && <div className="mt-stack-md rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{error}</div>}

        {preview && (
          <div className="mt-stack-lg flex flex-col gap-stack-md">
            <div className="grid grid-cols-2 sm:grid-cols-7 gap-stack-sm text-center">
              <PreviewStat label="الأساسي" value={preview.baseAmount} />
              <PreviewStat label="أجر أيام المأمورية الإضافي" value={preview.missionDoubleUpAmount} />
              <PreviewStat label="حوافز" value={preview.bonusAmount} tone="text-success" />
              <PreviewStat label="خصومات" value={-preview.deductionsAmount} tone="text-error" />
              <PreviewStat label="قسط سلفة" value={-preview.advanceInstallmentAmount} tone="text-error" />
              <PreviewStat label="خصم تأمين" value={-preview.insuranceAmount} tone="text-error" />
              <PreviewStat label="خصم مصر للتأمين" value={-preview.misrInsuranceAmount} tone="text-error" />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-stack-md py-stack-sm">
              <span className="text-body-sm text-on-surface-variant">صافي المستحق لـ {preview.employeeName}</span>
              <span dir="ltr" className="text-title-sm text-mono-data text-success font-bold">
                {formatCurrency(preview.netPaid)}
              </span>
            </div>
            <div>
              <Button onClick={onRun} disabled={runLoading}>
                {runLoading ? "جاري الصرف..." : "اعتماد وصرف الراتب"}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div>
        <div className="flex items-center justify-between mb-stack-sm">
          <h3 className="text-title-sm text-on-surface">آخر عمليات الصرف</h3>
          {history.length > 0 && (
            <ExportButton
              filename="سجل_الرواتب"
              columns={[
                { header: "الموظف", key: "employee" },
                { header: "بداية الفترة", key: "start" },
                { header: "نهاية الفترة", key: "end" },
                { header: "الصافي", key: "net" },
                { header: "تاريخ الصرف", key: "paidDate" },
              ]}
              rows={history.map((p) => ({
                employee: p.employeeName,
                start: formatDate(p.periodStart),
                end: formatDate(p.periodEnd),
                net: p.netPaid,
                paidDate: formatDate(p.paidDate),
              }))}
            />
          )}
        </div>
        {history.length === 0 ? (
          <EmptyState icon="history" title="لا يوجد رواتب مصروفة بعد" />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>الموظف</Th>
                <Th>الفترة</Th>
                <Th>الصافي</Th>
                <Th>تاريخ الصرف</Th>
                {canManage && <Th>إجراءات</Th>}
              </tr>
            </THead>
            <TBody>
              {history.map((p) => (
                <Tr key={p.id}>
                  <Td>{p.employeeName}</Td>
                  <Td>
                    {formatDate(p.periodStart)} - {formatDate(p.periodEnd)}
                  </Td>
                  <TdMono className="font-semibold">{formatCurrency(p.netPaid)}</TdMono>
                  <Td>{formatDate(p.paidDate)}</Td>
                  {canManage && (
                    <Td>
                      <div className="flex items-center gap-1">
                        <button className="text-on-surface-variant hover:text-on-surface" title="تعديل" onClick={() => setEditingPayout(p)}>
                          <Icon name="edit" size={18} />
                        </button>
                        <button className="text-error hover:opacity-80" title="حذف" onClick={() => setDeletingPayout(p)}>
                          <Icon name="delete" size={18} />
                        </button>
                      </div>
                    </Td>
                  )}
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </div>

      <EditPayrollPayoutDialog open={!!editingPayout} onClose={() => setEditingPayout(null)} payout={editingPayout} />
      <ConfirmDialog
        open={!!deletingPayout}
        onClose={() => setDeletingPayout(null)}
        title="حذف الراتب المصروف"
        message="هل أنت متأكد من حذف هذا الراتب؟ سيتم إلغاء أثره في الخزنة وإرجاع أي سلف أو تسويات استخدمها."
        onConfirm={() => deletePayrollPayout(deletingPayout!.id)}
        onConfirmed={() => router.refresh()}
      />
    </div>
  );
}

function EditPayrollPayoutDialog({ open, onClose, payout }: { open: boolean; onClose: () => void; payout: PayrollPayoutDTO | null }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePayrollPayoutFormValues>({
    resolver: zodResolver(updatePayrollPayoutSchema),
    defaultValues: {
      baseAmount: 0,
      missionDoubleUpAmount: 0,
      deductionsAmount: 0,
      bonusAmount: 0,
      advanceInstallmentAmount: 0,
      insuranceAmount: 0,
      misrInsuranceAmount: 0,
    },
  });

  useEffect(() => {
    if (open && payout) {
      reset({
        baseAmount: payout.baseAmount,
        missionDoubleUpAmount: payout.missionDoubleUpAmount,
        deductionsAmount: payout.deductionsAmount,
        bonusAmount: payout.bonusAmount,
        advanceInstallmentAmount: payout.advanceInstallmentAmount,
        insuranceAmount: payout.insuranceAmount,
        misrInsuranceAmount: payout.misrInsuranceAmount,
      });
      setServerError(null);
    }
  }, [open, payout, reset]);

  if (!payout) return null;

  const onSubmit = async (data: UpdatePayrollPayoutFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await updatePayrollPayout({ id: payout.id, ...data });
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
      title={`تعديل راتب ${payout.employeeName}`}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="edit-payout-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </>
      }
    >
      <form id="edit-payout-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label="الأساسي" error={errors.baseAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("baseAmount", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label="أجر أيام المأمورية الإضافي" error={errors.missionDoubleUpAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("missionDoubleUpAmount", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label="حوافز" error={errors.bonusAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("bonusAmount", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label="خصومات" error={errors.deductionsAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("deductionsAmount", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label="قسط سلفة" error={errors.advanceInstallmentAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("advanceInstallmentAmount", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label="خصم تأمين" error={errors.insuranceAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("insuranceAmount", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label="خصم مصر للتأمين" error={errors.misrInsuranceAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("misrInsuranceAmount", { valueAsNumber: true })} />
          </FieldGroup>
        </div>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}

function PreviewStat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-lg border border-outline-variant p-stack-sm">
      <p className="text-xs text-on-surface-variant">{label}</p>
      <p dir="ltr" className={`text-mono-data text-sm mt-1 ${tone ?? "text-on-surface"}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}
