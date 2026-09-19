"use client";

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
          <h1 className="text-headline-md text-on-surface">العملاء</h1>
          <p className="text-body-sm text-on-surface-variant">{clients.length} عميل</p>
        </div>
        {canManage && (
          <Button onClick={() => setDialogOpen(true)}>
            <Icon name="add" />
            عميل جديد
          </Button>
        )}
      </div>

      {clients.length > 0 && (
        <div className="flex items-center justify-between gap-stack-sm flex-wrap">
          <SearchInput value={table.search} onChange={table.setSearch} placeholder="بحث بالاسم أو الهاتف..." />
          <ExportButton
            filename="العملاء"
            columns={[
              { header: "اسم العميل", key: "name" },
              { header: "الهاتف", key: "phone" },
              { header: "عدد المشاريع", key: "projectsCount" },
              { header: "إجمالي التعاقدات", key: "totalContractValue" },
              { header: "المحصَّل", key: "totalCollected" },
              { header: "المتبقي", key: "totalRemaining" },
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
        <EmptyState icon="groups" title="لا يوجد عملاء بعد" description="ابدأ بإضافة أول عميل للشركة" />
      ) : table.totalCount === 0 ? (
        <EmptyState icon="search_off" title="لا يوجد عملاء مطابقين للبحث" />
      ) : (
        <>
          <Table>
            <THead>
              <tr>
                <Th>اسم العميل</Th>
                <Th>الهاتف</Th>
                <Th>عدد المشاريع</Th>
                <Th>إجمالي التعاقدات</Th>
                <Th>المحصَّل</Th>
                <Th>المتبقي</Th>
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
                  <Td dir="ltr" className="text-right">
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
