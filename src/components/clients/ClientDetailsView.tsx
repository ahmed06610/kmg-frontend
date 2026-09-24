"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteClient } from "@/actions/clients";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency } from "@/lib/utils";
import { useTableState } from "@/lib/useTableState";
import { projectStatusLabels, projectTypeLabels } from "@/types/enums";
import { projectStatusTone } from "@/lib/status-tone";
import type { ClientDetailsDTO } from "@/types/client";
import { ClientFormDialog } from "./ClientFormDialog";

export function ClientDetailsView({ client, canManage }: { client: ClientDetailsDTO; canManage: boolean }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const table = useTableState({
    rows: client.projects,
    pageSize: 10,
    searchPredicate: (p, term) => p.name.toLowerCase().includes(term) || p.projectCode.toLowerCase().includes(term),
  });

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface">{client.name}</h1>
          <p className="text-body-sm text-on-surface-variant">
            {client.phone ?? "بدون هاتف"} {client.email ? `· ${client.email}` : ""}
          </p>
          {client.address && <p className="text-body-sm text-on-surface-variant">{client.address}</p>}
        </div>
        {canManage && (
          <div className="flex gap-stack-sm">
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Icon name="edit" size={18} />
              تعديل
            </Button>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              <Icon name="delete" size={18} />
              حذف
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
        <Card>
          <p className="text-body-sm text-on-surface-variant">إجمالي التعاقدات</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-on-surface mt-1 text-right">
            {formatCurrency(client.totalContractValue)}
          </p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">إجمالي المحصَّل</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-success mt-1 text-right">
            {formatCurrency(client.totalCollected)}
          </p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">إجمالي المتبقي</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-error mt-1 text-right">
            {formatCurrency(client.totalRemaining)}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between flex-wrap gap-stack-sm">
          <CardTitle>المشاريع ({client.projects.length})</CardTitle>
          {client.projects.length > 0 && (
            <SearchInput value={table.search} onChange={table.setSearch} placeholder="بحث بالاسم أو الكود..." className="sm:w-64" />
          )}
        </CardHeader>
        {client.projects.length === 0 ? (
          <EmptyState icon="account_tree" title="لا توجد مشاريع لهذا العميل بعد" />
        ) : table.totalCount === 0 ? (
          <EmptyState icon="search_off" title="لا توجد نتائج مطابقة" />
        ) : (
          <>
            <Table>
              <THead>
                <tr>
                  <Th>المشروع</Th>
                  <Th>النوع</Th>
                  <Th>الحالة</Th>
                  <Th>القيمة</Th>
                  <Th>المتبقي</Th>
                </tr>
              </THead>
              <TBody>
                {table.pageRows.map((p) => (
                  <Tr key={p.id}>
                    <Td>
                      <Link href={`/projects/${p.id}`} className="text-primary font-semibold hover:underline">
                        {p.name}
                      </Link>
                    </Td>
                    <Td>{projectTypeLabels[p.projectType] ?? p.projectType}</Td>
                    <Td>
                      <Badge tone={projectStatusTone(p.status)}>{projectStatusLabels[p.status] ?? p.status}</Badge>
                    </Td>
                    <TdMono>{formatCurrency(p.contractValue)}</TdMono>
                    <TdMono>{formatCurrency(p.remainingBalance)}</TdMono>
                  </Tr>
                ))}
              </TBody>
            </Table>
            <div className="mt-stack-sm">
              <Pagination page={table.page} pageSize={table.pageSize} totalCount={table.totalCount} onPageChange={table.setPage} />
            </div>
          </>
        )}
      </Card>

      <ClientFormDialog open={editOpen} onClose={() => setEditOpen(false)} client={client} />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="حذف العميل"
        message={`هل أنت متأكد من حذف العميل "${client.name}"؟`}
        onConfirm={() => deleteClient(client.id)}
        onConfirmed={() => router.push("/clients")}
      />
    </div>
  );
}
