"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { previewPayroll, runPayroll } from "@/actions/payroll";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Combobox } from "@/components/ui/Combobox";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExportButton } from "@/components/ui/ExportButton";
import { FieldGroup, Input } from "@/components/ui/Field";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { downloadWorkbook } from "@/lib/excel";
import { formatCurrency, formatDate } from "@/lib/utils";
import { runPayrollSchema, type RunPayrollFormValues } from "@/schema/payroll";
import type { EmployeeListDTO } from "@/types/employee";
import type { PayrollPayoutDTO, PayrollPreviewDTO } from "@/types/payroll";

function BulkPayrollSection({ employees }: { employees: EmployeeListDTO[] }) {
  const router = useRouter();
  const activeEmployees = employees.filter((e) => !e.suspended);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === activeEmployees.length ? new Set() : new Set(activeEmployees.map((e) => e.id))));
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
            { header: "مضاعفة المأمورية", key: "missionDoubleUp" },
            { header: "حوافز", key: "bonus" },
            { header: "خصومات", key: "deductions" },
            { header: "قسط سلفة", key: "advanceInstallment" },
            { header: "الصافي", key: "net" },
          ],
          rows: succeeded.map((p) => ({
            employee: p.employeeName,
            base: p.baseAmount,
            missionDoubleUp: p.missionDoubleUpAmount,
            bonus: p.bonusAmount,
            deductions: p.deductionsAmount,
            advanceInstallment: p.advanceInstallmentAmount,
            net: p.netPaid,
          })),
        },
      ]);
    }

    if (failed.length > 0) {
      setError(`فشل صرف راتب ${failed.length} موظف: ${failed.map((f) => `${f.name} (${f.message})`).join("، ")}`);
    }

    setSelected(new Set());
    router.refresh();
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

      <div className="mt-stack-md">
        <Button onClick={handleDisburse} disabled={running || selected.size === 0}>
          {running ? "جاري الصرف..." : `صرف رواتب المحددين (${selected.size})`}
        </Button>
      </div>
    </Card>
  );
}

export function RunPayrollSection({ employees, history }: { employees: EmployeeListDTO[]; history: PayrollPayoutDTO[] }) {
  const router = useRouter();
  const [preview, setPreview] = useState<PayrollPreviewDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);

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
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-stack-sm text-center">
              <PreviewStat label="الأساسي" value={preview.baseAmount} />
              <PreviewStat label="مضاعفة المأمورية" value={preview.missionDoubleUpAmount} />
              <PreviewStat label="حوافز" value={preview.bonusAmount} tone="text-success" />
              <PreviewStat label="خصومات" value={-preview.deductionsAmount} tone="text-error" />
              <PreviewStat label="قسط سلفة" value={-preview.advanceInstallmentAmount} tone="text-error" />
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
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
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
