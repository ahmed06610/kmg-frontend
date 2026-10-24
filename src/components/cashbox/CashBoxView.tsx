"use client";

import { useT } from "@/lib/i18n/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteMiscExpense } from "@/actions/cashbox";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExportButton } from "@/components/ui/ExportButton";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Field";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { Tabs } from "@/components/ui/Tabs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransactionType, transactionTypeLabels } from "@/types/enums";
import type { CashBoxTransactionDTO, CashBoxTransactionFilter, CashBoxTransactionsResultDTO } from "@/types/cashbox";
import type { CustodyDTO } from "@/types/custody";
import type { EmployeeListDTO } from "@/types/employee";
import type { ProjectListDTO } from "@/types/project";
import { AdjustCashBoxDialog } from "./AdjustCashBoxDialog";
import { CustodyTab } from "./CustodyTab";
import { MiscExpenseDialog } from "./MiscExpenseDialog";

interface Props {
  totals: { totalCash: number; totalCredit: number; totalBalance: number };
  transactions: CashBoxTransactionsResultDTO;
  filter: CashBoxTransactionFilter;
  custodies: CustodyDTO[];
  employees: EmployeeListDTO[];
  projects: ProjectListDTO[];
  tab: "transactions" | "custody";
  canManage: boolean;
}

export function CashBoxView({ totals, transactions, filter, custodies, employees, projects, tab, canManage }: Props) {
  const t = useT();
  const router = useRouter();
  const [search, setSearch] = useState(filter.search ?? "");
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<CashBoxTransactionDTO | undefined>(undefined);
  const [deletingTransaction, setDeletingTransaction] = useState<CashBoxTransactionDTO | null>(null);

  function pushFilter(next: Partial<CashBoxTransactionFilter> & { tab?: string }) {
    const merged = { ...filter, ...next, page: next.page ?? 1 };
    const params = new URLSearchParams();
    params.set("tab", next.tab ?? tab);
    if (merged.dateFrom) params.set("dateFrom", merged.dateFrom);
    if (merged.dateTo) params.set("dateTo", merged.dateTo);
    if (merged.type) params.set("type", String(merged.type));
    if (merged.isIn !== undefined) params.set("isIn", String(merged.isIn));
    if (merged.search) params.set("search", merged.search);
    if (merged.page && merged.page > 1) params.set("page", String(merged.page));
    router.push(`/cashbox?${params.toString()}`);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search !== (filter.search ?? "")) pushFilter({ search: search || undefined });
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="flex items-center justify-between flex-wrap gap-stack-sm">
        <div>
          <h1 className="text-headline-md text-on-surface">{t("الخزنة")}</h1>
          <p className="text-body-sm text-on-surface-variant">{t("كل حركة مالية في النظام مربوطة تلقائيًا بمصدرها")}</p>
        </div>
        {canManage && tab === "transactions" && (
          <div className="flex flex-wrap items-center gap-stack-sm">
            <Button variant="secondary" onClick={() => setAdjustDialogOpen(true)}>
              <Icon name="tune" size={18} />
              {t("تعديل رصيد الخزنة")}</Button>
            <Button
              onClick={() => {
                setEditingTransaction(undefined);
                setExpenseDialogOpen(true);
              }}
            >
              <Icon name="add" size={18} />
              {t("مصروف نثري")}</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
        <Card>
          <p className="text-body-sm text-on-surface-variant">{t("الرصيد الكاش")}</p>
          <p dir="ltr" className="text-headline-md text-mono-data text-on-surface mt-1 text-page-start">
            {formatCurrency(totals.totalCash)}
          </p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">{t("الرصيد الكريديت")}</p>
          <p dir="ltr" className="text-headline-md text-mono-data text-on-surface mt-1 text-page-start">
            {formatCurrency(totals.totalCredit)}
          </p>
        </Card>
        <Card className="bg-primary text-on-primary">
          <p className="text-body-sm opacity-80">{t("الرصيد الإجمالي")}</p>
          <p dir="ltr" className="text-headline-md text-mono-data mt-1 text-page-start">
            {formatCurrency(totals.totalBalance)}
          </p>
        </Card>
      </div>

      <Tabs
        items={[
          { key: "transactions", label: t("الحركات") },
          { key: "custody", label: t("عهد"), badge: custodies.filter((c) => c.status === "Active").length },
        ]}
        active={tab}
        onChange={(key) => pushFilter({ tab: key })}
      />

      {tab === "custody" ? (
        <CustodyTab custodies={custodies} employees={employees} projects={projects} canManage={canManage} />
      ) : (
        <>
      <Card className="!p-stack-md">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-stack-sm items-end">
          <div className="flex flex-col gap-1">
            <label className="text-label-caps text-on-surface-variant">{t("من تاريخ")}</label>
            <input
              type="date"
              className="rounded bg-surface-container-lowest border border-outline-variant p-2 text-body-sm"
              defaultValue={filter.dateFrom ?? ""}
              onChange={(e) => pushFilter({ dateFrom: e.target.value || undefined })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps text-on-surface-variant">{t("إلى تاريخ")}</label>
            <input
              type="date"
              className="rounded bg-surface-container-lowest border border-outline-variant p-2 text-body-sm"
              defaultValue={filter.dateTo ?? ""}
              onChange={(e) => pushFilter({ dateTo: e.target.value || undefined })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps text-on-surface-variant">{t("النوع")}</label>
            <Select
              defaultValue={filter.type ?? 0}
              onChange={(e) => pushFilter({ type: Number(e.target.value) || undefined })}
            >
              <option value={0}>{t("الكل")}</option>
              {Object.entries(TransactionType).map(([key, value]) => (
                <option key={key} value={value}>
                  {t(transactionTypeLabels[key] ?? key)}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps text-on-surface-variant">{t("الاتجاه")}</label>
            <Select
              defaultValue={filter.isIn === undefined ? "" : String(filter.isIn)}
              onChange={(e) => pushFilter({ isIn: e.target.value === "" ? undefined : e.target.value === "true" })}
            >
              <option value="">{t("الكل")}</option>
              <option value="true">{t("داخل")}</option>
              <option value="false">{t("خارج")}</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps text-on-surface-variant">{t("بحث")}</label>
            <input
              type="text"
              placeholder={t("الوصف، المشروع، المورد...")}
              className="rounded bg-surface-container-lowest border border-outline-variant p-2 text-body-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-stack-sm">
          <h3 className="text-title-sm text-on-surface">{t("الحركات (")}{transactions.totalCount})</h3>
          {transactions.items.length > 0 && (
            <ExportButton
              filename={t("حركات_الخزنة")}
              columns={[
                { header: t("النوع"), key: "type" },
                { header: t("الوصف"), key: "description" },
                { header: t("كاش"), key: "cash" },
                { header: t("كريديت"), key: "credit" },
                { header: t("المصدر"), key: "source" },
                { header: t("التاريخ"), key: "date" },
                { header: t("المستخدم"), key: "user" },
              ]}
              rows={transactions.items.map((tx) => ({
                type: t(transactionTypeLabels[tx.transactionType] ?? tx.transactionType),
                description: tx.description,
                cash: tx.amountCash,
                credit: tx.amountCredit,
                source: tx.projectName ?? tx.supplierName ?? "-",
                date: formatDate(tx.transactionDate),
                user: tx.createdByEmployeeName,
              }))}
            />
          )}
        </div>
        {transactions.items.length === 0 ? (
          <EmptyState icon="account_balance_wallet" title={t("لا توجد حركات مطابقة")} />
        ) : (
          <>
            <Table>
              <THead>
                <tr>
                  <Th>{t("النوع")}</Th>
                  <Th>{t("الوصف")}</Th>
                  <Th>{t("كاش")}</Th>
                  <Th>{t("كريديت")}</Th>
                  <Th>{t("المصدر")}</Th>
                  <Th>{t("التاريخ")}</Th>
                  <Th>{t("المستخدم")}</Th>
                  {canManage && <Th>{t("إجراءات")}</Th>}
                </tr>
              </THead>
              <TBody>
                {transactions.items.map((tx) => (
                  <Tr key={tx.id}>
                    <Td>{t(transactionTypeLabels[tx.transactionType] ?? tx.transactionType)}</Td>
                    <Td>{tx.description}</Td>
                    <TdMono className={tx.amountCash >= 0 ? "text-success" : "text-error"}>{formatCurrency(tx.amountCash)}</TdMono>
                    <TdMono className={tx.amountCredit >= 0 ? "text-success" : "text-error"}>{formatCurrency(tx.amountCredit)}</TdMono>
                    <Td>{tx.projectName ?? tx.supplierName ?? "-"}</Td>
                    <Td>{formatDate(tx.transactionDate)}</Td>
                    <Td>{tx.createdByEmployeeName}</Td>
                    {canManage && (
                      <Td>
                        {tx.miscExpenseId ? (
                          <div className="flex items-center gap-1">
                            <button
                              className="text-on-surface-variant hover:text-on-surface"
                              title={t("تعديل")}
                              onClick={() => {
                                setEditingTransaction(tx);
                                setExpenseDialogOpen(true);
                              }}
                            >
                              <Icon name="edit" size={18} />
                            </button>
                            <button className="text-error hover:opacity-80" title={t("حذف")} onClick={() => setDeletingTransaction(tx)}>
                              <Icon name="delete" size={18} />
                            </button>
                          </div>
                        ) : (
                          "-"
                        )}
                      </Td>
                    )}
                  </Tr>
                ))}
              </TBody>
            </Table>
            <div className="mt-stack-md">
              <Pagination page={transactions.page} pageSize={transactions.pageSize} totalCount={transactions.totalCount} onPageChange={(p) => pushFilter({ page: p })} />
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
        <Card>
          <p className="text-body-sm text-on-surface-variant">{t("إجمالي الكاش (حسب الفلتر الحالي)")}</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-on-surface mt-1 text-page-start">
            {formatCurrency(transactions.filteredTotalCash)}
          </p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">{t("إجمالي الكريديت (حسب الفلتر الحالي)")}</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-on-surface mt-1 text-page-start">
            {formatCurrency(transactions.filteredTotalCredit)}
          </p>
        </Card>
      </div>

      <MiscExpenseDialog
        open={expenseDialogOpen}
        onClose={() => {
          setExpenseDialogOpen(false);
          setEditingTransaction(undefined);
        }}
        transaction={editingTransaction}
      />
      <AdjustCashBoxDialog
        open={adjustDialogOpen}
        onClose={() => setAdjustDialogOpen(false)}
        currentCash={totals.totalCash}
        currentCredit={totals.totalCredit}
      />
      <ConfirmDialog
        open={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        title={t("حذف المصروف النثري")}
        message={t("هل أنت متأكد من حذف هذا المصروف؟ سيتم إلغاء أثره في الخزنة.")}
        onConfirm={() => deleteMiscExpense(deletingTransaction!.miscExpenseId!)}
        onConfirmed={() => router.refresh()}
      />
      </>
      )}
    </div>
  );
}
