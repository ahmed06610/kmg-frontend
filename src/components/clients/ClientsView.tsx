"use client";

import { useT } from "@/lib/i18n/client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExportButton } from "@/components/ui/ExportButton";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency } from "@/lib/utils";
import { useTableState } from "@/lib/useTableState";
import type { ClientListDTO } from "@/types/client";
import { ClientFormDialog } from "./ClientFormDialog";

export function ClientsView({ clients, canManage }: { clients: ClientListDTO[]; canManage: boolean }) {
  const t = useT();
  const [dialogOpen, setDialogOpen] = useState(false);
  const table = useTableState({
    rows: clients,
    pageSize: 10,
    searchPredicate: (c, term) => c.name.toLowerCase().includes(term) || (c.phone ?? "").includes(term),
  });

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface">{t("العملاء")}</h1>
          <p className="text-body-sm text-on-surface-variant">{t("{0} عميل", [clients.length])}</p>
        </div>
        {canManage && (
          <Button onClick={() => setDialogOpen(true)}>
            <Icon name="add" />
            {t("عميل جديد")}</Button>
        )}
      </div>

      {clients.length > 0 && (
        <div className="flex items-center justify-between gap-stack-sm flex-wrap">
          <SearchInput value={table.search} onChange={table.setSearch} placeholder={t("بحث بالاسم أو الهاتف...")} />
          <ExportButton
            filename={t("العملاء")}
            columns={[
              { header: t("اسم العميل"), key: "name" },
              { header: t("الهاتف"), key: "phone" },
              { header: t("عدد المشاريع"), key: "projectsCount" },
              { header: t("إجمالي التعاقدات"), key: "totalContractValue" },
              { header: t("المحصَّل"), key: "totalCollected" },
              { header: t("المتبقي"), key: "totalRemaining" },
            ]}
            rows={table.filteredRows.map((c) => ({
              name: c.name,
              phone: c.phone ?? "-",
              projectsCount: c.projectsCount,
              totalContractValue: c.totalContractValue,
              totalCollected: c.totalCollected,
              totalRemaining: c.totalRemaining,
            }))}
          />
        </div>
      )}

      {clients.length === 0 ? (
        <EmptyState icon="groups" title={t("لا يوجد عملاء بعد")} description={t("ابدأ بإضافة أول عميل للشركة")} />
      ) : table.totalCount === 0 ? (
        <EmptyState icon="search_off" title={t("لا يوجد عملاء مطابقين للبحث")} />
      ) : (
        <>
          <Table>
            <THead>
              <tr>
                <Th>{t("اسم العميل")}</Th>
                <Th>{t("الهاتف")}</Th>
                <Th>{t("عدد المشاريع")}</Th>
                <Th>{t("إجمالي التعاقدات")}</Th>
                <Th>{t("المحصَّل")}</Th>
                <Th>{t("المتبقي")}</Th>
              </tr>
            </THead>
            <TBody>
              {table.pageRows.map((c) => (
                <Tr key={c.id}>
                  <Td>
                    <Link href={`/clients/${c.id}`} className="text-primary font-semibold hover:underline">
                      {c.name}
                    </Link>
                  </Td>
                  <Td dir="ltr" className="text-page-start">
                    {c.phone ?? "-"}
                  </Td>
                  <Td>{c.projectsCount}</Td>
                  <TdMono>{formatCurrency(c.totalContractValue)}</TdMono>
                  <TdMono>{formatCurrency(c.totalCollected)}</TdMono>
                  <TdMono>{formatCurrency(c.totalRemaining)}</TdMono>
                </Tr>
              ))}
            </TBody>
          </Table>
          <Pagination page={table.page} pageSize={table.pageSize} totalCount={table.totalCount} onPageChange={table.setPage} />
        </>
      )}

      <ClientFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
