"use client";

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
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransactionType, transactionTypeLabels } from "@/types/enums";
import type { CashBoxTransactionDTO, CashBoxTransactionFilter, PagedResultDTO } from "@/types/cashbox";
import { MiscExpenseDialog } from "./MiscExpenseDialog";

interface Props {
  totals: { totalCash: number; totalCredit: number; totalBalance: number };
  transactions: PagedResultDTO<CashBoxTransactionDTO>;
  filter: CashBoxTransactionFilter;
  canManage: boolean;
}

export function CashBoxView({ totals, transactions, filter, canManage }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(filter.search ?? "");
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<CashBoxTransactionDTO | undefined>(undefined);
  const [deletingTransaction, setDeletingTransaction] = useState<CashBoxTransactionDTO | null>(null);

  function pushFilter(next: Partial<CashBoxTransactionFilter>) {
    const merged = { ...filter, ...next, page: next.page ?? 1 };
    const params = new URLSearchParams();
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
          <h1 className="text-headline-md text-on-surface">الخزنة</h1>
          <p className="text-body-sm text-on-surface-variant">كل حركة مالية في النظام مربوطة تلقائيًا بمصدرها</p>
        </div>
        {canManage && (
          <Button
            onClick={() => {
              setEditingTransaction(undefined);
              setExpenseDialogOpen(true);
            }}
          >
            <Icon name="add" size={18} />
            مصروف نثري
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
        <Card>
          <p className="text-body-sm text-on-surface-variant">الرصيد الكاش</p>
          <p dir="ltr" className="text-headline-md text-mono-data text-on-surface mt-1 text-right">
            {formatCurrency(totals.totalCash)}
          </p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">الرصيد الكريديت</p>
          <p dir="ltr" className="text-headline-md text-mono-data text-on-surface mt-1 text-right">
            {formatCurrency(totals.totalCredit)}
          </p>
        </Card>
        <Card className="bg-primary text-on-primary">
          <p className="text-body-sm opacity-80">الرصيد الإجمالي</p>
          <p dir="ltr" className="text-headline-md text-mono-data mt-1 text-right">
            {formatCurrency(totals.totalBalance)}
          </p>
        </Card>
      </div>

      <Card className="!p-stack-md">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-stack-sm items-end">
          <div className="flex flex-col gap-1">
            <label className="text-label-caps text-on-surface-variant">من تاريخ</label>
            <input
              type="date"
              className="rounded bg-surface-container-lowest border border-outline-variant p-2 text-body-sm"
              defaultValue={filter.dateFrom ?? ""}
              onChange={(e) => pushFilter({ dateFrom: e.target.value || undefined })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps text-on-surface-variant">إلى تاريخ</label>
            <input
              type="date"
              className="rounded bg-surface-container-lowest border border-outline-variant p-2 text-body-sm"
              defaultValue={filter.dateTo ?? ""}
              onChange={(e) => pushFilter({ dateTo: e.target.value || undefined })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps text-on-surface-variant">النوع</label>
            <Select
              defaultValue={filter.type ?? 0}
              onChange={(e) => pushFilter({ type: Number(e.target.value) || undefined })}
            >
              <option value={0}>الكل</option>
              {Object.entries(TransactionType).map(([key, value]) => (
                <option key={key} value={value}>
                  {transactionTypeLabels[key] ?? key}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps text-on-surface-variant">الاتجاه</label>
            <Select
              defaultValue={filter.isIn === undefined ? "" : String(filter.isIn)}
              onChange={(e) => pushFilter({ isIn: e.target.value === "" ? undefined : e.target.value === "true" })}
            >
              <option value="">الكل</option>
              <option value="true">داخل</option>
              <option value="false">خارج</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps text-on-surface-variant">بحث</label>
            <input
              type="text"
              placeholder="الوصف، المشروع، المورد..."
              className="rounded bg-surface-container-lowest border border-outline-variant p-2 text-body-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-stack-sm">
          <h3 className="text-title-sm text-on-surface">الحركات ({transactions.totalCount})</h3>
          {transactions.items.length > 0 && (
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
              rows={transactions.items.map((t) => ({
                type: transactionTypeLabels[t.transactionType] ?? t.transactionType,
                description: t.description,
                cash: t.amountCash,
                credit: t.amountCredit,
                source: t.projectName ?? t.supplierName ?? "-",
                date: formatDate(t.transactionDate),
                user: t.createdByEmployeeName,
              }))}
            />
          )}
        </div>
        {transactions.items.length === 0 ? (
          <EmptyState icon="account_balance_wallet" title="لا توجد حركات مطابقة" />
        ) : (
          <>
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
                  {canManage && <Th>إجراءات</Th>}
                </tr>
              </THead>
              <TBody>
                {transactions.items.map((t) => (
                  <Tr key={t.id}>
                    <Td>{transactionTypeLabels[t.transactionType] ?? t.transactionType}</Td>
                    <Td>{t.description}</Td>
                    <TdMono className={t.amountCash >= 0 ? "text-success" : "text-error"}>{formatCurrency(t.amountCash)}</TdMono>
                    <TdMono className={t.amountCredit >= 0 ? "text-success" : "text-error"}>{formatCurrency(t.amountCredit)}</TdMono>
                    <Td>{t.projectName ?? t.supplierName ?? "-"}</Td>
                    <Td>{formatDate(t.transactionDate)}</Td>
                    <Td>{t.createdByEmployeeName}</Td>
                    {canManage && (
                      <Td>
                        {t.miscExpenseId ? (
                          <div className="flex items-center gap-1">
                            <button
                              className="text-on-surface-variant hover:text-on-surface"
                              title="تعديل"
                              onClick={() => {
                                setEditingTransaction(t);
                                setExpenseDialogOpen(true);
                              }}
                            >
                              <Icon name="edit" size={18} />
                            </button>
                            <button className="text-error hover:opacity-80" title="حذف" onClick={() => setDeletingTransaction(t)}>
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

      <MiscExpenseDialog
        open={expenseDialogOpen}
        onClose={() => {
          setExpenseDialogOpen(false);
          setEditingTransaction(undefined);
        }}
        transaction={editingTransaction}
      />
      <ConfirmDialog
        open={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        title="حذف المصروف النثري"
        message="هل أنت متأكد من حذف هذا المصروف؟ سيتم إلغاء أثره في الخزنة."
        onConfirm={() => deleteMiscExpense(deletingTransaction!.miscExpenseId!)}
        onConfirmed={() => router.refresh()}
      />
    </div>
  );
}
