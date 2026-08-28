"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExportButton } from "@/components/ui/ExportButton";
import { Icon } from "@/components/ui/Icon";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency } from "@/lib/utils";
import type { SupplierListDTO } from "@/types/supplier";
import { SupplierFormDialog } from "./SupplierFormDialog";

export function SuppliersView({ suppliers, canManage }: { suppliers: SupplierListDTO[]; canManage: boolean }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface">الموردين</h1>
          <p className="text-body-sm text-on-surface-variant">{suppliers.length} مورد</p>
        </div>
        {canManage && (
          <Button onClick={() => setDialogOpen(true)}>
            <Icon name="add" />
            مورد جديد
          </Button>
        )}
      </div>

      {suppliers.length > 0 && (
        <div className="flex justify-end">
          <ExportButton
            filename="الموردين"
            columns={[
              { header: "اسم المورد", key: "name" },
              { header: "الهاتف", key: "phone" },
              { header: "إجمالي المشتريات", key: "totalPurchases" },
              { header: "المدفوع", key: "totalPaid" },
              { header: "المتبقي", key: "totalRemaining" },
            ]}
            rows={suppliers.map((s) => ({
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
        <EmptyState icon="local_shipping" title="لا يوجد موردين بعد" />
      ) : (
        <Table>
          <THead>
            <tr>
              <Th>اسم المورد</Th>
              <Th>الهاتف</Th>
              <Th>إجمالي المشتريات</Th>
              <Th>المدفوع</Th>
              <Th>المتبقي</Th>
            </tr>
          </THead>
          <TBody>
            {suppliers.map((s) => (
              <Tr key={s.id}>
                <Td>
                  <Link href={`/suppliers/${s.id}`} className="text-primary font-semibold hover:underline">
                    {s.name}
                  </Link>
                </Td>
                <Td dir="ltr" className="text-right">
                  {s.phone ?? "-"}
                </Td>
                <TdMono>{formatCurrency(s.totalPurchases)}</TdMono>
                <TdMono>{formatCurrency(s.totalPaid)}</TdMono>
                <TdMono className={s.totalRemaining > 0 ? "text-error" : undefined}>{formatCurrency(s.totalRemaining)}</TdMono>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}

      <SupplierFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
