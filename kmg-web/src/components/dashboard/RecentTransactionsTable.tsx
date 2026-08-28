import { Icon } from "@/components/ui/Icon";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { RecentActivityDTO } from "@/types/dashboard";

export function RecentTransactionsTable({ activity }: { activity: RecentActivityDTO[] }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl elevation-1 shadow-[var(--shadow-soft)] border border-outline-variant overflow-hidden flex flex-col h-full">
      <div className="p-stack-lg border-b border-outline-variant">
        <h3 className="text-title-sm text-on-surface font-bold">أحدث حركات الخزنة</h3>
      </div>
      {activity.length === 0 ? (
        <div className="p-stack-lg">
          <EmptyState icon="account_balance_wallet" title="لا توجد حركات مسجلة بعد" />
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <Table>
            <THead>
              <tr>
                <Th>البيان</Th>
                <Th>النوع</Th>
                <Th className="text-left">المبلغ (ج.م)</Th>
                <Th>التاريخ</Th>
              </tr>
            </THead>
            <TBody>
              {activity.map((t, i) => (
                <Tr key={i}>
                  <Td className="font-medium">{t.description}</Td>
                  <Td>
                    <span
                      className={`px-2 py-1 rounded text-xs inline-flex items-center gap-1 ${
                        t.amount >= 0 ? "bg-success-container text-on-success-container" : "bg-error-container text-on-error-container"
                      }`}
                    >
                      <Icon name={t.amount >= 0 ? "south_west" : "north_east"} size={14} />
                      {t.amount >= 0 ? "إيداع" : "صرف"}
                    </span>
                  </Td>
                  <TdMono className={t.amount >= 0 ? "text-success font-semibold" : "text-error font-semibold"}>
                    {t.amount >= 0 ? "+" : ""}
                    {formatCurrency(t.amount)}
                  </TdMono>
                  <Td>{formatDate(t.date)}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </div>
  );
}
