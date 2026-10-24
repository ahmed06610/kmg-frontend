"use client";

import { useT } from "@/lib/i18n/client";
import { tr } from "@/lib/i18n/global";
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
  return `${tr(ARABIC_WEEKDAYS[d.getDay()])} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

// اختصارات لتحديد الفترة بسرعة: لو فيه تاريخ بداية متحدد، الكويك أكشن بيحرك تاريخ النهاية بس (بداية + المدة)
// - لو مفيش بداية (الحقول فاضية) بيحسب الاتنين من النهارده للخلف (النهاردة - المدة لحد النهاردة)
type QuickRangeOption = { label: string; kind: "days" | "month"; amount: number };

const QUICK_RANGE_OPTIONS: QuickRangeOption[] = [
  { label: "6 أيام", kind: "days", amount: 6 },
  { label: "7 أيام", kind: "days", amount: 7 },
  { label: "14 يوم", kind: "days", amount: 14 },
  { label: "شهر", kind: "month", amount: 1 },
];

function shiftDate(dateStr: string, option: QuickRangeOption, direction: 1 | -1): string {
  const d = new Date(dateStr);
  if (option.kind === "month") d.setMonth(d.getMonth() + direction * option.amount);
  else d.setDate(d.getDate() + direction * option.amount);
  return formatDate(d);
}

function computeQuickRange(option: QuickRangeOption, currentStart: string): { start: string; end: string } {
  if (currentStart) {
    return { start: currentStart, end: shiftDate(currentStart, option, 1) };
  }
  const today = formatDate(new Date());
  return { start: shiftDate(today, option, -1), end: today };
}

function QuickDateRangeActions({ periodStart, onChange }: { periodStart: string; onChange: (start: string, end: string) => void }) {
  const t = useT();
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {QUICK_RANGE_OPTIONS.map((opt) => (
        <button
          key={opt.label}
          type="button"
          onClick={() => {
            const { start, end } = computeQuickRange(opt, periodStart);
            onChange(start, end);
          }}
          className="px-2 py-1 rounded-md text-xs bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors"
        >
          {t(opt.label)}
        </button>
      ))}
    </div>
  );
}

function BulkPayrollSection({ employees }: { employees: EmployeeListDTO[] }) {
  const t = useT();
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
      setError(t("حدد بداية ونهاية الفترة أولًا"));
      return;
    }
    if (selected.size === 0) {
      setError(t("اختر موظف واحد على الأقل"));
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
        failed.push({ name: employee.name, message: result.message ?? t("حدث خطأ") });
      }
    }

    setPreviewing(false);
    setPreviews(results);

    if (failed.length > 0) {
      setError(t("فشلت معاينة {0} موظف: {1}", [failed.length, failed.map((f) => `${f.name} (${f.message})`).join(t("، "))]));
    }
  }

  async function handleDisburse() {
    if (!periodStart || !periodEnd) {
      setError(t("حدد بداية ونهاية الفترة أولًا"));
      return;
    }
    if (selected.size === 0) {
      setError(t("اختر موظف واحد على الأقل"));
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
        failed.push({ name: employee.name, message: result.message ?? t("حدث خطأ") });
      }
    }

    setRunning(false);

    if (succeeded.length > 0) {
      downloadWorkbook(t("صرف_رواتب_{0}_{1}", [periodStart, periodEnd]), [
        {
          name: t("صرف الرواتب"),
          columns: [
            { header: t("الموظف"), key: "employee" },
            { header: t("الأساسي"), key: "base" },
            { header: t("أجر أيام المأمورية الإضافي"), key: "missionDoubleUp" },
            { header: t("حوافز"), key: "bonus" },
            { header: t("خصومات"), key: "deductions" },
            { header: t("قسط سلفة"), key: "advanceInstallment" },
            { header: t("خصم تأمين"), key: "insurance" },
            { header: t("خصم مصر للتأمين"), key: "misrInsurance" },
            { header: t("الصافي"), key: "net" },
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
      setError(t("فشل صرف راتب {0} موظف: {1}", [failed.length, failed.map((f) => `${f.name} (${f.message})`).join(t("، "))]));
    }

    setSelected(new Set());
    setPreviews(null);
    router.refresh();
  }

  // تصدير بالشكل الأسبوعي اللي المحاسب متعود عليه: شيت منفصل لكل أسبوع (سبت-جمعة)، عمود "ورشة" للأيام العادية
  // وعمود "سفر" لأيام المأمورية، وباقي الأعمدة من بيانات الراتب الفعلية - بدون أي صرف فعلي، معاينة بس
  async function handleExportWeekly() {
    if (!periodStart || !periodEnd) {
      setError(t("حدد بداية ونهاية الفترة أولًا"));
      return;
    }
    if (selected.size === 0) {
      setError(t("اختر موظف واحد على الأقل"));
      return;
    }

    setExportingWeekly(true);
    setError(null);

    const weeks = splitIntoWeeks(periodStart, periodEnd);
    const failed: { name: string; message: string }[] = [];
    const sheets: StyledPayrollWeek[] = [];

    for (const week of weeks) {
      const rows: StyledPayrollWeek["rows"] = [];
      const periodLabel = t("الاجور من {0} حتى {1}", [longDateLabel(week.start), longDateLabel(week.end)]);
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
          failed.push({ name: `${employee.name} (${week.start})`, message: result.message ?? t("حدث خطأ") });
        }
      }
      sheets.push({ sheetName: t("من {0} حتى {1}", [shortDate(week.start), shortDate(week.end)]), periodLabel, rows });
    }

    if (sheets.some((s) => s.rows.length > 0)) {
      await downloadStyledWeeklyPayroll(t("الرواتب_الاسبوعي_{0}_{1}", [periodStart, periodEnd]), sheets);
    }

    setExportingWeekly(false);

    if (failed.length > 0) {
      setError(t("فشلت معاينة {0} سجل: {1}", [failed.length, failed.map((f) => `${f.name} (${f.message})`).join(t("، "))]));
    }
  }

  return (
    <Card>
      <p className="text-title-sm text-on-surface mb-stack-md">{t("صرف رواتب جماعي")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-stack-md mb-stack-sm">
        <FieldGroup label={t("بداية الفترة")}>
          <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
        </FieldGroup>
        <FieldGroup label={t("نهاية الفترة")}>
          <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
        </FieldGroup>
      </div>
      <div className="mb-stack-md">
        <QuickDateRangeActions
          periodStart={periodStart}
          onChange={(start, end) => {
            setPeriodStart(start);
            setPeriodEnd(end);
          }}
        />
      </div>

      {activeEmployees.length === 0 ? (
        <EmptyState icon="groups" title={t("لا يوجد موظفين نشطين")} />
      ) : (
        <Table className="min-w-0">
          <THead>
            <tr>
              <Th>
                <input type="checkbox" checked={selected.size === activeEmployees.length} onChange={toggleAll} />
              </Th>
              <Th>{t("الموظف")}</Th>
              <Th>{t("نوع الأجر")}</Th>
            </tr>
          </THead>
          <TBody>
            {activeEmployees.map((e) => (
              <Tr key={e.id}>
                <Td>
                  <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggle(e.id)} />
                </Td>
                <Td>{e.name}</Td>
                <Td>{e.wageType === 1 ? t("شهري") : t("يومي")}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}

      {error && <div className="mt-stack-md rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{t(error)}</div>}

      <div className="mt-stack-md flex items-center gap-stack-sm flex-wrap">
        <Button variant="secondary" onClick={handlePreviewAll} disabled={previewing || running || selected.size === 0}>
          {previewing ? t("جاري المعاينة...") : t("معاينة قبل الصرف ({0})", [selected.size])}
        </Button>
        <Button onClick={handleDisburse} disabled={running || previewing || selected.size === 0}>
          {running ? t("جاري الصرف...") : t("صرف رواتب المحددين ({0})", [selected.size])}
        </Button>
        <Button variant="secondary" onClick={handleExportWeekly} disabled={exportingWeekly || running || selected.size === 0}>
          <Icon name="download" size={18} />
          {exportingWeekly ? t("جاري التصدير...") : t("تصدير الشكل الأسبوعي")}
        </Button>
      </div>

      {previews && previews.length > 0 && (
        <div className="mt-stack-md">
          <p className="text-body-sm text-on-surface-variant mb-stack-sm">{t("معاينة المستحقات قبل الصرف الفعلي - راجع الأرقام ثم اضغط \"صرف رواتب المحددين\" لو كل شيء صحيح")}</p>
          <Table>
            <THead>
              <tr>
                <Th>{t("الموظف")}</Th>
                <Th>{t("أيام العمل")}</Th>
                <Th>{t("الأساسي")}</Th>
                <Th>{t("أجر أيام المأمورية الإضافي")}</Th>
                <Th>{t("حوافز")}</Th>
                <Th>{t("خصومات")}</Th>
                <Th>{t("قسط سلفة")}</Th>
                <Th>{t("خصم تأمين")}</Th>
                <Th>{t("خصم مصر للتأمين")}</Th>
                <Th>{t("الصافي")}</Th>
              </tr>
            </THead>
            <TBody>
              {previews.map((p) => (
                <Tr key={p.employeeId}>
                  <Td>{p.employeeName}</Td>
                  <TdMono>
                    {p.workshopDays + p.missionDays}
                    {p.excludedFridays > 0 && <div className="text-[11px] text-on-surface-variant font-sans">{t("من غير ")}{p.excludedFridays} {t(" جمعة")}</div>}
                  </TdMono>
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
  const t = useT();
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
    watch,
    setValue,
    formState: { errors },
  } = useForm<RunPayrollFormValues>({
    resolver: zodResolver(runPayrollSchema),
    defaultValues: { employeeId: 0, periodStart: "", periodEnd: "" },
  });

  const currentPeriodStart = watch("periodStart");

  const onPreview = handleSubmit(async (data) => {
    setPreviewLoading(true);
    setError(null);
    setPreview(null);
    const result = await previewPayroll(data);
    setPreviewLoading(false);
    if (!result.success || !result.data) {
      setError(result.message ?? t("حدث خطأ"));
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
      setError(result.message ?? t("حدث خطأ"));
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
            <FieldGroup label={t("بداية الفترة")} error={errors.periodStart?.message}>
              <Input type="date" {...register("periodStart")} />
            </FieldGroup>
            <FieldGroup label={t("نهاية الفترة")} error={errors.periodEnd?.message}>
              <Input type="date" {...register("periodEnd")} />
            </FieldGroup>
          </div>
          <QuickDateRangeActions
            periodStart={currentPeriodStart}
            onChange={(start, end) => {
              setValue("periodStart", start, { shouldValidate: true });
              setValue("periodEnd", end, { shouldValidate: true });
            }}
          />
          <div>
            <Button type="submit" variant="secondary" disabled={previewLoading}>
              {previewLoading ? t("جاري الحساب...") : t("معاينة المستحقات")}
            </Button>
          </div>
        </form>

        {error && <div className="mt-stack-md rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{t(error)}</div>}

        {preview && (
          <div className="mt-stack-lg flex flex-col gap-stack-md">
            <div className="grid grid-cols-2 sm:grid-cols-7 gap-stack-sm text-center">
              <PreviewStat label={t("الأساسي")} value={preview.baseAmount} />
              <PreviewStat label={t("أجر أيام المأمورية الإضافي")} value={preview.missionDoubleUpAmount} />
              <PreviewStat label={t("حوافز")} value={preview.bonusAmount} tone="text-success" />
              <PreviewStat label={t("خصومات")} value={-preview.deductionsAmount} tone="text-error" />
              <PreviewStat label={t("قسط سلفة")} value={-preview.advanceInstallmentAmount} tone="text-error" />
              <PreviewStat label={t("خصم تأمين")} value={-preview.insuranceAmount} tone="text-error" />
              <PreviewStat label={t("خصم مصر للتأمين")} value={-preview.misrInsuranceAmount} tone="text-error" />
            </div>
            {(preview.workshopDays > 0 || preview.missionDays > 0 || preview.excludedFridays > 0) && (
              <p className="text-xs text-on-surface-variant">
                {t("أيام ورشة: ")}<span dir="ltr" className="font-mono-data text-on-surface">{preview.workshopDays}</span>
                {preview.missionDays > 0 && (
                  <>
                    {" "}{t("· أيام مأمورية: ")}<span dir="ltr" className="font-mono-data text-on-surface">{preview.missionDays}</span>
                  </>
                )}
                {preview.excludedFridays > 0 && (
                  <>
                    {" "}{t("· أيام جمعة مستبعدة (إجازة):")}{" "}
                    <span dir="ltr" className="font-mono-data text-on-surface">{preview.excludedFridays}</span>
                  </>
                )}
              </p>
            )}
            <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-stack-md py-stack-sm">
              <span className="text-body-sm text-on-surface-variant">{t("صافي المستحق لـ ")}{preview.employeeName}</span>
              <span dir="ltr" className="text-title-sm text-mono-data text-success font-bold">
                {formatCurrency(preview.netPaid)}
              </span>
            </div>
            <div>
              <Button onClick={onRun} disabled={runLoading}>
                {runLoading ? t("جاري الصرف...") : t("اعتماد وصرف الراتب")}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div>
        <div className="flex items-center justify-between mb-stack-sm">
          <h3 className="text-title-sm text-on-surface">{t("آخر عمليات الصرف")}</h3>
          {history.length > 0 && (
            <ExportButton
              filename={t("سجل_الرواتب")}
              columns={[
                { header: t("الموظف"), key: "employee" },
                { header: t("بداية الفترة"), key: "start" },
                { header: t("نهاية الفترة"), key: "end" },
                { header: t("الصافي"), key: "net" },
                { header: t("تاريخ الصرف"), key: "paidDate" },
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
          <EmptyState icon="history" title={t("لا يوجد رواتب مصروفة بعد")} />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>{t("الموظف")}</Th>
                <Th>{t("الفترة")}</Th>
                <Th>{t("الصافي")}</Th>
                <Th>{t("تاريخ الصرف")}</Th>
                {canManage && <Th>{t("إجراءات")}</Th>}
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
                        <button className="text-on-surface-variant hover:text-on-surface" title={t("تعديل")} onClick={() => setEditingPayout(p)}>
                          <Icon name="edit" size={18} />
                        </button>
                        <button className="text-error hover:opacity-80" title={t("حذف")} onClick={() => setDeletingPayout(p)}>
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
        title={t("حذف الراتب المصروف")}
        message={t("هل أنت متأكد من حذف هذا الراتب؟ سيتم إلغاء أثره في الخزنة وإرجاع أي سلف أو تسويات استخدمها.")}
        onConfirm={() => deletePayrollPayout(deletingPayout!.id)}
        onConfirmed={() => router.refresh()}
      />
    </div>
  );
}

function EditPayrollPayoutDialog({ open, onClose, payout }: { open: boolean; onClose: () => void; payout: PayrollPayoutDTO | null }) {
  const t = useT();
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
      title={t("تعديل راتب {0}", [payout.employeeName])}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t("إلغاء")}</Button>
          <Button type="submit" form="edit-payout-form" disabled={loading}>
            {loading ? t("جاري الحفظ...") : t("حفظ")}
          </Button>
        </>
      }
    >
      <form id="edit-payout-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label={t("الأساسي")} error={errors.baseAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("baseAmount", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label={t("أجر أيام المأمورية الإضافي")} error={errors.missionDoubleUpAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("missionDoubleUpAmount", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label={t("حوافز")} error={errors.bonusAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("bonusAmount", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label={t("خصومات")} error={errors.deductionsAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("deductionsAmount", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label={t("قسط سلفة")} error={errors.advanceInstallmentAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("advanceInstallmentAmount", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label={t("خصم تأمين")} error={errors.insuranceAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("insuranceAmount", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label={t("خصم مصر للتأمين")} error={errors.misrInsuranceAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("misrInsuranceAmount", { valueAsNumber: true })} />
          </FieldGroup>
        </div>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{t(serverError)}</div>}
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
