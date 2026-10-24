"use client";

import { useT } from "@/lib/i18n/client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSupplier } from "@/actions/suppliers";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExportButton } from "@/components/ui/ExportButton";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTableState } from "@/lib/useTableState";
import type { SupplierListDTO, SupplierPaymentDTO } from "@/types/supplier";
import { ResolveCheckDialog } from "./ResolveCheckDialog";
import { SupplierFormDialog } from "./SupplierFormDialog";

export function SuppliersView({
  suppliers,
  canManage,
  pendingChecks,
}: {
  suppliers: SupplierListDTO[];
  canManage: boolean;
  pendingChecks: SupplierPaymentDTO[];
}) {
  const t = useT();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState<SupplierListDTO | null>(null);
  const [resolvingPayment, setResolvingPayment] = useState<SupplierPaymentDTO | null>(null);

  const today = formatDate(new Date());
  const dueChecks = pendingChecks.filter((c) => (c.checkDueDate ?? "").slice(0, 10) <= today);
  const [alertOpen, setAlertOpen] = useState(dueChecks.length > 0);

  const table = useTableState({
    rows: suppliers,
    pageSize: 10,
    searchPredicate: (s, term) => s.name.toLowerCase().includes(term) || (s.phone ?? "").includes(term),
  });

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface">{t("الموردين")}</h1>
          <p className="text-body-sm text-on-surface-variant">{t("{0} مورد", [suppliers.length])}</p>
        </div>
        {canManage && (
          <Button onClick={() => setDialogOpen(true)}>
            <Icon name="add" />
            {t("مورد جديد")}</Button>
        )}
      </div>

      {dueChecks.length > 0 && (
        <button
          onClick={() => setAlertOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-warning-container text-on-warning-container px-stack-md py-2.5 text-body-sm text-start"
        >
          <Icon name="warning" size={18} />
          {t("فيه ")}{dueChecks.length} {t(" شيك مستحق محتاج تسوية - اضغط للمراجعة")}</button>
      )}

      {suppliers.length > 0 && (
        <div className="flex items-center justify-between gap-stack-sm flex-wrap">
          <SearchInput value={table.search} onChange={table.setSearch} placeholder={t("بحث بالاسم أو الهاتف...")} />
          <ExportButton
            filename={t("الموردين")}
            columns={[
              { header: t("اسم المورد"), key: "name" },
              { header: t("الهاتف"), key: "phone" },
              { header: t("إجمالي المشتريات"), key: "totalPurchases" },
              { header: t("المدفوع"), key: "totalPaid" },
              { header: t("المتبقي"), key: "totalRemaining" },
            ]}
            rows={table.filteredRows.map((s) => ({
              name: s.name,
              phone: s.phone ?? "-",
              totalPurchases: s.totalPurchases,
              totalPaid: s.totalPaid,
              totalRemaining: s.totalRemaining,
            }))}
          />
        </div>
      )}

      {suppliers.length === 0 ? (
        <EmptyState icon="local_shipping" title={t("لا يوجد موردين بعد")} />
      ) : table.totalCount === 0 ? (
        <EmptyState icon="search_off" title={t("لا يوجد موردين مطابقين للبحث")} />
      ) : (
        <>
          <Table>
            <THead>
              <tr>
                <Th>{t("اسم المورد")}</Th>
                <Th>{t("الهاتف")}</Th>
                <Th>{t("إجمالي المشتريات")}</Th>
                <Th>{t("المدفوع")}</Th>
                <Th>{t("المتبقي")}</Th>
                {canManage && <Th>{t("إجراءات")}</Th>}
              </tr>
            </THead>
            <TBody>
              {table.pageRows.map((s) => (
                <Tr key={s.id}>
                  <Td>
                    <Link href={`/suppliers/${s.id}`} className="text-primary font-semibold hover:underline">
                      {s.name}
                    </Link>
                  </Td>
                  <Td dir="ltr" className="text-page-start">
                    {s.phone ?? "-"}
                  </Td>
                  <TdMono>{formatCurrency(s.totalPurchases)}</TdMono>
                  <TdMono>{formatCurrency(s.totalPaid)}</TdMono>
                  <TdMono className={s.totalRemaining > 0 ? "text-error" : undefined}>{formatCurrency(s.totalRemaining)}</TdMono>
                  {canManage && (
                    <Td>
                      <button className="text-error hover:opacity-80" title={t("حذف")} onClick={() => setDeletingSupplier(s)}>
                        <Icon name="delete" size={18} />
                      </button>
                    </Td>
                  )}
                </Tr>
              ))}
            </TBody>
          </Table>
          <Pagination page={table.page} pageSize={table.pageSize} totalCount={table.totalCount} onPageChange={table.setPage} />
        </>
      )}

      <SupplierFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />

      <ConfirmDialog
        open={!!deletingSupplier}
        onClose={() => setDeletingSupplier(null)}
        title={t("حذف المورد")}
        message={t("هل أنت متأكد من حذف المورد \"{0}\"؟", [deletingSupplier?.name])}
        onConfirm={() => deleteSupplier(deletingSupplier!.id)}
        onConfirmed={() => router.refresh()}
      />

      <Dialog open={alertOpen} onClose={() => setAlertOpen(false)} title={t("شيكات مستحقة")}>
        <div className="flex flex-col gap-stack-md">
          {dueChecks.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-outline-variant p-stack-md">
              <div>
                <p className="text-body-sm text-on-surface font-semibold">{c.supplierName}</p>
                <p className="text-xs text-on-surface-variant">
                  <span dir="ltr">{formatCurrency(c.amountCash)}</span> {t(" - مستحق ")}{formatDate(c.checkDueDate ?? c.paymentDate)}
                </p>
              </div>
              <Button size="sm" onClick={() => setResolvingPayment(c)}>
                {t("تسوية")}</Button>
            </div>
          ))}
        </div>
      </Dialog>

      <ResolveCheckDialog open={!!resolvingPayment} onClose={() => setResolvingPayment(null)} payment={resolvingPayment} />
    </div>
  );
}
