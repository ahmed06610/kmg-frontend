"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { movementTypeLabels } from "@/types/enums";
import type { MaterialDTO, StockMovementDTO } from "@/types/stock";
import type { SupplierListDTO } from "@/types/supplier";
import type { ProjectListDTO } from "@/types/project";
import { MaterialFormDialog } from "./MaterialFormDialog";
import { PurchaseDialog } from "./PurchaseDialog";
import { IssueReturnDialog } from "./IssueReturnDialog";

export function MaterialDetailsView({
  material,
  movements,
  suppliers,
  projects,
  canManage,
}: {
  material: MaterialDTO;
  movements: StockMovementDTO[];
  suppliers: SupplierListDTO[];
  projects: ProjectListDTO[];
  canManage: boolean;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="flex items-start justify-between flex-wrap gap-stack-sm">
        <div>
          <h1 className="text-headline-md text-on-surface">{material.name}</h1>
          <p className="text-body-sm text-on-surface-variant">
            {material.unit} · {material.isLowStock ? <Badge tone="error">نقص مخزون</Badge> : <Badge tone="success">متاح</Badge>}
          </p>
        </div>
        {canManage && (
          <div className="flex flex-wrap gap-stack-sm">
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Icon name="edit" size={18} />
              تعديل
            </Button>
            <Button variant="secondary" onClick={() => setReturnOpen(true)}>
              <Icon name="undo" size={18} />
              مرتجع
            </Button>
            <Button variant="secondary" onClick={() => setIssueOpen(true)}>
              <Icon name="output" size={18} />
              صرف
            </Button>
            <Button onClick={() => setPurchaseOpen(true)}>
              <Icon name="shopping_cart" size={18} />
              شراء
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
        <Card>
          <p className="text-body-sm text-on-surface-variant">الكمية المتاحة</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-on-surface mt-1 text-right">
            {material.quantity} {material.unit}
          </p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">سعر الوحدة</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-on-surface mt-1 text-right">
            {formatCurrency(material.unitPrice)}
          </p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">الحد الأدنى</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-on-surface mt-1 text-right">
            {material.minimumThreshold}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سجل الحركات ({movements.length})</CardTitle>
        </CardHeader>
        {movements.length === 0 ? (
          <EmptyState icon="history" title="لا توجد حركات مسجلة بعد" />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>النوع</Th>
                <Th>الكمية</Th>
                <Th>السعر وقت الحركة</Th>
                <Th>المشروع / المورد</Th>
                <Th>التاريخ</Th>
                <Th>المستخدم</Th>
              </tr>
            </THead>
            <TBody>
              {movements.map((m) => (
                <Tr key={m.id}>
                  <Td>{movementTypeLabels[m.movementType] ?? m.movementType}</Td>
                  <TdMono>{m.quantity}</TdMono>
                  <TdMono>{formatCurrency(m.unitPriceAtTime)}</TdMono>
                  <Td>{m.projectCode ?? m.supplierName ?? "-"}</Td>
                  <Td>{formatDate(m.movementDate)}</Td>
                  <Td>{m.createdByEmployeeName}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <MaterialFormDialog open={editOpen} onClose={() => setEditOpen(false)} material={material} />
      <PurchaseDialog open={purchaseOpen} onClose={() => setPurchaseOpen(false)} materials={[material]} suppliers={suppliers} defaultMaterialId={material.id} />
      <IssueReturnDialog open={issueOpen} onClose={() => setIssueOpen(false)} mode="issue" materials={[material]} projects={projects} defaultMaterialId={material.id} />
      <IssueReturnDialog open={returnOpen} onClose={() => setReturnOpen(false)} mode="return" materials={[material]} projects={projects} defaultMaterialId={material.id} />
    </div>
  );
}
