import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExportButton } from "@/components/ui/ExportButton";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { transactionTypeLabels } from "@/types/enums";
import type { CashBoxDetailsDTO } from "@/types/cashbox";

export function CashBoxView({ cashbox }: { cashbox: CashBoxDetailsDTO }) {
  return (
    <div className="flex flex-col gap-stack-lg">
      <div>
        <h1 className="text-headline-md text-on-surface">الخزنة</h1>
        <p className="text-body-sm text-on-surface-variant">كل حركة مالية في النظام مربوطة تلقائيًا بمصدرها</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
        <Card>
          <p className="text-body-sm text-on-surface-variant">الرصيد الكاش</p>
          <p dir="ltr" className="text-headline-md text-mono-data text-on-surface mt-1 text-right">
            {formatCurrency(cashbox.totalCash)}
          </p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">الرصيد الكريديت</p>
          <p dir="ltr" className="text-headline-md text-mono-data text-on-surface mt-1 text-right">
            {formatCurrency(cashbox.totalCredit)}
          </p>
        </Card>
        <Card className="bg-primary text-on-primary">
          <p className="text-body-sm opacity-80">الرصيد الإجمالي</p>
          <p dir="ltr" className="text-headline-md text-mono-data mt-1 text-right">
            {formatCurrency(cashbox.totalBalance)}
          </p>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-stack-sm">
          <h3 className="text-title-sm text-on-surface">آخر الحركات</h3>
          {cashbox.recentTransactions.length > 0 && (
            <ExportButton
              filename="حركات_الخزنة"
              columns={[
                { header: "النوع", key: "type" },
                { header: "الوصف", key: "description" },
                { header: "كاش", key: "cash" },
                { header: "كريديت", key: "credit" },
                { header: "المصدر", key: "source" },
                { header: "التاريخ", key: "date" },
                { header: "المستخدم", key: "user" },
              ]}
              rows={cashbox.recentTransactions.map((t) => ({
                type: transactionTypeLabels[t.transactionType] ?? t.transactionType,
                description: t.description,
                cash: t.amountCash,
                credit: t.amountCredit,
                source: t.projectCode ?? t.supplierName ?? "-",
                date: formatDate(t.transactionDate),
                user: t.createdByEmployeeName,
              }))}
            />
          )}
        </div>
        {cashbox.recentTransactions.length === 0 ? (
          <EmptyState icon="account_balance_wallet" title="لا توجد حركات مسجلة بعد" />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>النوع</Th>
                <Th>الوصف</Th>
                <Th>كاش</Th>
                <Th>كريديت</Th>
                <Th>المصدر</Th>
                <Th>التاريخ</Th>
                <Th>المستخدم</Th>
              </tr>
            </THead>
            <TBody>
              {cashbox.recentTransactions.map((t) => (
                <Tr key={t.id}>
                  <Td>{transactionTypeLabels[t.transactionType] ?? t.transactionType}</Td>
                  <Td>{t.description}</Td>
                  <TdMono className={t.amountCash >= 0 ? "text-success" : "text-error"}>{formatCurrency(t.amountCash)}</TdMono>
                  <TdMono className={t.amountCredit >= 0 ? "text-success" : "text-error"}>{formatCurrency(t.amountCredit)}</TdMono>
                  <Td>{t.projectCode ?? t.supplierName ?? "-"}</Td>
                  <Td>{formatDate(t.transactionDate)}</Td>
                  <Td>{t.createdByEmployeeName}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
}
