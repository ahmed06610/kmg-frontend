"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency } from "@/lib/utils";
import type { ClientListDTO } from "@/types/client";
import { ClientFormDialog } from "./ClientFormDialog";

export function ClientsView({ clients, canManage }: { clients: ClientListDTO[]; canManage: boolean }) {
  const [dialogOpen, setDialogOpen] = useState(false);

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

      {clients.length === 0 ? (
        <EmptyState icon="groups" title="لا يوجد عملاء بعد" description="ابدأ بإضافة أول عميل للشركة" />
      ) : (
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
            {clients.map((c) => (
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
      )}

      <ClientFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
