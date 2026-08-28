"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExportButton } from "@/components/ui/ExportButton";
import { Icon } from "@/components/ui/Icon";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency } from "@/lib/utils";
import type { MaterialDTO } from "@/types/stock";
import type { SupplierListDTO } from "@/types/supplier";
import type { ProjectListDTO } from "@/types/project";
import { MaterialFormDialog } from "./MaterialFormDialog";
import { PurchaseDialog } from "./PurchaseDialog";
import { IssueReturnDialog } from "./IssueReturnDialog";

export function StockView({
  materials,
  suppliers,
  projects,
  canManage,
}: {
  materials: MaterialDTO[];
  suppliers: SupplierListDTO[];
  projects: ProjectListDTO[];
  canManage: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="flex items-center justify-between flex-wrap gap-stack-sm">
        <div>
          <h1 className="text-headline-md text-on-surface">المخزون</h1>
          <p className="text-body-sm text-on-surface-variant">{materials.length} خامة</p>
        </div>
        {canManage && (
          <div className="flex flex-wrap gap-stack-sm">
            <Button variant="secondary" onClick={() => setReturnOpen(true)}>
              <Icon name="undo" size={18} />
              مرتجع
            </Button>
            <Button variant="secondary" onClick={() => setIssueOpen(true)}>
              <Icon name="output" size={18} />
              صرف لمشروع
            </Button>
            <Button variant="secondary" onClick={() => setPurchaseOpen(true)}>
              <Icon name="shopping_cart" size={18} />
              شراء
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Icon name="add" />
              خامة جديدة
            </Button>
          </div>
        )}
      </div>

      {materials.length > 0 && (
        <div className="flex justify-end">
          <ExportButton
            filename="المخزون"
            columns={[
              { header: "الخامة", key: "name" },
              { header: "الوحدة", key: "unit" },
              { header: "الكمية المتاحة", key: "quantity" },
              { header: "سعر الوحدة", key: "unitPrice" },
              { header: "الحد الأدنى", key: "minimumThreshold" },
              { header: "الحالة", key: "status" },
            ]}
            rows={materials.map((m) => ({
              name: m.name,
              unit: m.unit,
              quantity: m.quantity,
              unitPrice: m.unitPrice,
              minimumThreshold: m.minimumThreshold,
              status: m.isLowStock ? "نقص مخزون" : "متاح",
            }))}
          />
        </div>
      )}

      {materials.length === 0 ? (
        <EmptyState icon="inventory_2" title="لا توجد خامات بعد" />
      ) : (
        <Table>
          <THead>
            <tr>
              <Th>الخامة</Th>
              <Th>الوحدة</Th>
              <Th>الكمية المتاحة</Th>
              <Th>سعر الوحدة</Th>
              <Th>الحد الأدنى</Th>
              <Th>الحالة</Th>
            </tr>
          </THead>
          <TBody>
            {materials.map((m) => (
              <Tr key={m.id}>
                <Td>
                  <Link href={`/stock/${m.id}`} className="text-primary font-semibold hover:underline">
                    {m.name}
                  </Link>
                </Td>
                <Td>{m.unit}</Td>
                <TdMono>{m.quantity}</TdMono>
                <TdMono>{formatCurrency(m.unitPrice)}</TdMono>
                <TdMono>{m.minimumThreshold}</TdMono>
                <Td>
                  {m.isLowStock ? <Badge tone="error">نقص مخزون</Badge> : <Badge tone="success">متاح</Badge>}
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}

      <MaterialFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <PurchaseDialog open={purchaseOpen} onClose={() => setPurchaseOpen(false)} materials={materials} suppliers={suppliers} />
      <IssueReturnDialog open={issueOpen} onClose={() => setIssueOpen(false)} mode="issue" materials={materials} projects={projects} />
      <IssueReturnDialog open={returnOpen} onClose={() => setReturnOpen(false)} mode="return" materials={materials} projects={projects} />
    </div>
  );
}
