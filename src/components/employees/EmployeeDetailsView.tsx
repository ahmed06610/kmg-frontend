"use client";

import { useT } from "@/lib/i18n/client";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { advanceStatusTone } from "@/lib/status-tone";
import { formatCurrency, formatDate } from "@/lib/utils";
import { adjustmentTypeLabels, employeeTypeLabels, wageTypeLabels } from "@/types/enums";
import type { EmployeeListDTO } from "@/types/employee";
import type { AdvanceDTO, PayrollAdjustmentDTO, PayrollPayoutDTO } from "@/types/payroll";

export function EmployeeDetailsView({
  employee,
  advances,
  adjustments,
  payoutHistory,
}: {
  employee: EmployeeListDTO;
  advances: AdvanceDTO[];
  adjustments: PayrollAdjustmentDTO[];
  payoutHistory: PayrollPayoutDTO[];
}) {
  const t = useT();
  return (
    <div className="flex flex-col gap-stack-lg">
      <div>
        <h1 className="text-headline-md text-on-surface">{employee.name}</h1>
        <p className="text-body-sm text-on-surface-variant">
          {employee.employeeType === 1 ? employeeTypeLabels.Admin : employeeTypeLabels.Worker} ·{" "}
          {employee.wageType === 1 ? wageTypeLabels.Monthly : wageTypeLabels.Daily} ·{" "}
          <span dir="ltr" className="font-mono-data">
            {formatCurrency(employee.wageAmount)}
          </span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("السلف (")}{advances.length})</CardTitle>
        </CardHeader>
        {advances.length === 0 ? (
          <EmptyState icon="account_balance" title={t("لا توجد سلف مسجلة")} />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>{t("المبلغ الكلي")}</Th>
                <Th>{t("القسط")}</Th>
                <Th>{t("المتبقي")}</Th>
                <Th>{t("التاريخ")}</Th>
                <Th>{t("الحالة")}</Th>
              </tr>
            </THead>
            <TBody>
              {advances.map((a) => (
                <Tr key={a.id}>
                  <TdMono>{formatCurrency(a.totalAmount)}</TdMono>
                  <TdMono>{formatCurrency(a.installmentAmount)}</TdMono>
                  <TdMono>{formatCurrency(a.remainingAmount)}</TdMono>
                  <Td>{formatDate(a.issueDate)}</Td>
                  <Td>
                    <Badge tone={advanceStatusTone(a.status)}>{a.status === "Settled" ? t("مسددة") : t("نشطة")}</Badge>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("الخصومات والحوافز (")}{adjustments.length})</CardTitle>
        </CardHeader>
        {adjustments.length === 0 ? (
          <EmptyState icon="tune" title={t("لا توجد خصومات أو حوافز مسجلة")} />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>{t("النوع")}</Th>
                <Th>{t("القيمة")}</Th>
                <Th>{t("السبب")}</Th>
                <Th>{t("التاريخ")}</Th>
                <Th>{t("مُطبَّق")}</Th>
              </tr>
            </THead>
            <TBody>
              {adjustments.map((a) => (
                <Tr key={a.id}>
                  <Td>
                    <Badge tone={a.type === "Bonus" ? "success" : "error"}>{t(adjustmentTypeLabels[a.type] ?? a.type)}</Badge>
                  </Td>
                  <TdMono>{formatCurrency(a.amount)}</TdMono>
                  <Td>{a.reason}</Td>
                  <Td>{formatDate(a.date)}</Td>
                  <Td>{a.applied ? t("نعم") : t("لا")}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("سجل الرواتب المصروفة (")}{payoutHistory.length})</CardTitle>
        </CardHeader>
        {payoutHistory.length === 0 ? (
          <EmptyState icon="payments" title={t("لا يوجد راتب مصروف بعد")} />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>{t("الفترة")}</Th>
                <Th>{t("الأساسي")}</Th>
                <Th>{t("أجر أيام المأمورية الإضافي")}</Th>
                <Th>{t("خصومات")}</Th>
                <Th>{t("حوافز")}</Th>
                <Th>{t("قسط سلفة")}</Th>
                <Th>{t("الصافي")}</Th>
              </tr>
            </THead>
            <TBody>
              {payoutHistory.map((p) => (
                <Tr key={p.id}>
                  <Td>
                    {formatDate(p.periodStart)} - {formatDate(p.periodEnd)}
                  </Td>
                  <TdMono>{formatCurrency(p.baseAmount)}</TdMono>
                  <TdMono>{formatCurrency(p.missionDoubleUpAmount)}</TdMono>
                  <TdMono>{formatCurrency(p.deductionsAmount)}</TdMono>
                  <TdMono>{formatCurrency(p.bonusAmount)}</TdMono>
                  <TdMono>{formatCurrency(p.advanceInstallmentAmount)}</TdMono>
                  <TdMono className="font-semibold text-success">{formatCurrency(p.netPaid)}</TdMono>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
