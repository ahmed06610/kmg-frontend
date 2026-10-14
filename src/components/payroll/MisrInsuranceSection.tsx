"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { payMisrInsurance } from "@/actions/misrInsurance";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldGroup, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { payMisrInsuranceSchema, type PayMisrInsuranceFormValues } from "@/schema/misrInsurance";
import type { EmployeeMisrInsuranceDTO, MisrInsurancePayoutDTO } from "@/types/misrInsurance";

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: formatDate(start), end: formatDate(end) };
}

export function MisrInsuranceSection({
  summary,
  history,
  canManage,
}: {
  summary: EmployeeMisrInsuranceDTO[];
  history: MisrInsurancePayoutDTO[];
  canManage: boolean;
}) {
  const defaultRange = currentMonthRange();
  const [periodStart, setPeriodStart] = useState(defaultRange.start);
  const [periodEnd, setPeriodEnd] = useState(defaultRange.end);
  const [payDialogOpen, setPayDialogOpen] = useState(false);

  const filteredSummary = summary; // قيمة مصر للتأمين ثابتة شهريًا لكل موظف - الفترة بتحدد إيصال الصرف بس
  const total = filteredSummary.reduce((sum, e) => sum + e.misrInsuranceAmount, 0);

  return (
    <div className="flex flex-col gap-stack-lg">
      <Card className="!p-stack-md">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-stack-sm items-end">
          <FieldGroup label="من تاريخ">
            <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
          </FieldGroup>
          <FieldGroup label="إلى تاريخ">
            <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
          </FieldGroup>
          <div className="sm:col-span-2 flex items-end justify-end">
            {canManage && (
              <Button onClick={() => setPayDialogOpen(true)} disabled={total <= 0}>
                <Icon name="payments" size={18} />
                صرف مصر للتأمين ({formatCurrency(total)})
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>مصر للتأمين للموظفين ({filteredSummary.length})</CardTitle>
        </CardHeader>
        {filteredSummary.length === 0 ? (
          <EmptyState icon="health_and_safety" title="لا يوجد موظفين لهم قيمة مصر للتأمين مسجلة" />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>الموظف</Th>
                <Th>قيمة مصر للتأمين الشهري</Th>
              </tr>
            </THead>
            <TBody>
              {filteredSummary.map((e) => (
                <Tr key={e.employeeId}>
                  <Td>{e.employeeName}</Td>
                  <TdMono>{formatCurrency(e.misrInsuranceAmount)}</TdMono>
                </Tr>
              ))}
              <Tr>
                <Td className="font-semibold">الإجمالي</Td>
                <TdMono className="font-semibold text-primary">{formatCurrency(total)}</TdMono>
              </Tr>
            </TBody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>سجل صرف مصر للتأمين ({history.length})</CardTitle>
        </CardHeader>
        {history.length === 0 ? (
          <EmptyState icon="history" title="لا يوجد مصر للتأمين مصروف بعد" />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>الفترة</Th>
                <Th>الإجمالي</Th>
                <Th>تاريخ الصرف</Th>
                <Th>بواسطة</Th>
                <Th>ملاحظات</Th>
              </tr>
            </THead>
            <TBody>
              {history.map((p) => (
                <Tr key={p.id}>
                  <Td>
                    {formatDate(p.periodStart)} - {formatDate(p.periodEnd)}
                  </Td>
                  <TdMono>{formatCurrency(p.totalAmount)}</TdMono>
                  <Td>{formatDate(p.paidDate)}</Td>
                  <Td>{p.createdByEmployeeName}</Td>
                  <Td>{p.notes ?? "-"}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <PayMisrInsuranceDialog
        open={payDialogOpen}
        onClose={() => setPayDialogOpen(false)}
        periodStart={periodStart}
        periodEnd={periodEnd}
        total={total}
      />
    </div>
  );
}

function PayMisrInsuranceDialog({
  open,
  onClose,
  periodStart,
  periodEnd,
  total,
}: {
  open: boolean;
  onClose: () => void;
  periodStart: string;
  periodEnd: string;
  total: number;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PayMisrInsuranceFormValues>({
    resolver: zodResolver(payMisrInsuranceSchema),
    values: { periodStart, periodEnd, notes: "" },
  });

  const onSubmit = async (data: PayMisrInsuranceFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await payMisrInsurance({ ...data, notes: data.notes || null });
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
      title="صرف مصر للتأمين للموظفين"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="pay-misr-insurance-form" disabled={loading}>
            {loading ? "جاري الصرف..." : "تأكيد الصرف"}
          </Button>
        </>
      }
    >
      <p className="text-body-sm text-on-surface-variant">
        هيتم صرف <span dir="ltr" className="font-mono-data text-on-surface">{formatCurrency(total)}</span> من الخزنة كمصروف مصر للتأمين للموظفين.
      </p>
      <form id="pay-misr-insurance-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label="بداية الفترة" error={errors.periodStart?.message}>
            <Input type="date" {...register("periodStart")} />
          </FieldGroup>
          <FieldGroup label="نهاية الفترة" error={errors.periodEnd?.message}>
            <Input type="date" {...register("periodEnd")} />
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
