"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { previewPayroll, runPayroll } from "@/actions/payroll";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldGroup, Input, Select } from "@/components/ui/Field";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { runPayrollSchema, type RunPayrollFormValues } from "@/schema/payroll";
import type { EmployeeListDTO } from "@/types/employee";
import type { PayrollPayoutDTO, PayrollPreviewDTO } from "@/types/payroll";

export function RunPayrollSection({ employees, history }: { employees: EmployeeListDTO[]; history: PayrollPayoutDTO[] }) {
  const router = useRouter();
  const [preview, setPreview] = useState<PayrollPreviewDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);

  const {
    register,
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
      <Card>
        <form onSubmit={onPreview} className="flex flex-col gap-stack-md">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-stack-md">
            <FieldGroup label="الموظف" error={errors.employeeId?.message}>
              <Select {...register("employeeId", { valueAsNumber: true })}>
                <option value={0}>اختر موظف</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </Select>
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
        <h3 className="text-title-sm text-on-surface mb-stack-sm">آخر عمليات الصرف</h3>
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
