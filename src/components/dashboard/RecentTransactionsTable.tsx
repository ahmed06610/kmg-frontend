"use client";

import { useT } from "@/lib/i18n/client";
import { Icon } from "@/components/ui/Icon";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { RecentActivityDTO } from "@/types/dashboard";

export function RecentTransactionsTable({ activity }: { activity: RecentActivityDTO[] }) {
  const t = useT();
  return (
    <div className="bg-surface-container-lowest rounded-xl elevation-1 shadow-[var(--shadow-soft)] border border-outline-variant overflow-hidden flex flex-col h-full">
      <div className="p-stack-lg border-b border-outline-variant">
        <h3 className="text-title-sm text-on-surface font-bold">{t("أحدث حركات الخزنة")}</h3>
      </div>
      {activity.length === 0 ? (
        <div className="p-stack-lg">
          <EmptyState icon="account_balance_wallet" title={t("لا توجد حركات مسجلة بعد")} />
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <Table>
            <THead>
              <tr>
                <Th>{t("البيان")}</Th>
                <Th>{t("النوع")}</Th>
                <Th className="text-end">{t("المبلغ (ج.م)")}</Th>
                <Th>{t("التاريخ")}</Th>
              </tr>
            </THead>
            <TBody>
              {activity.map((tx, i) => (
                <Tr key={i}>
                  <Td className="font-medium">{tx.description}</Td>
                  <Td>
                    <span
                      className={`px-2 py-1 rounded text-xs inline-flex items-center gap-1 ${
                        tx.amount >= 0 ? "bg-success-container text-on-success-container" : "bg-error-container text-on-error-container"
                      }`}
                    >
                      <Icon name={tx.amount >= 0 ? "south_west" : "north_east"} size={14} />
                      {tx.amount >= 0 ? t("إيداع") : t("صرف")}
                    </span>
                  </Td>
                  <TdMono className={tx.amount >= 0 ? "text-success font-semibold" : "text-error font-semibold"}>
                    {tx.amount >= 0 ? "+" : ""}
                    {formatCurrency(tx.amount)}
                  </TdMono>
                  <Td>{formatDate(tx.date)}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </div>
  );
}
