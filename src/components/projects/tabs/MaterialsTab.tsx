"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { IssueReturnDialog } from "@/components/stock/IssueReturnDialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { movementTypeLabels } from "@/types/enums";
import type { MaterialDTO, StockMovementDTO } from "@/types/stock";
import type { ProjectListDTO } from "@/types/project";

export function MaterialsTab({
  projectId,
  movements,
  totalMaterialsCost,
  materials,
  canManage,
}: {
  projectId: number;
  movements: StockMovementDTO[];
  totalMaterialsCost: number;
  materials: MaterialDTO[];
  canManage: boolean;
}) {
  const [issueOpen, setIssueOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const projectAsList: ProjectListDTO[] = [{ id: projectId } as ProjectListDTO];

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex items-center justify-between">
        <p className="text-body-sm text-on-surface-variant">
          إجمالي تكلفة الخامات: <span dir="ltr" className="font-mono-data text-on-surface font-semibold">{formatCurrency(totalMaterialsCost)}</span>
        </p>
        {canManage && (
          <div className="flex gap-stack-sm">
            <Button size="sm" variant="secondary" onClick={() => setReturnOpen(true)}>
              <Icon name="undo" size={18} />
              مرتجع
            </Button>
            <Button size="sm" onClick={() => setIssueOpen(true)}>
              <Icon name="output" size={18} />
              صرف خامة
            </Button>
          </div>
        )}
      </div>

      {movements.length === 0 ? (
        <EmptyState icon="inventory_2" title="لا توجد حركات مخزون على هذا المشروع بعد" />
      ) : (
        <Table>
          <THead>
            <tr>
              <Th>النوع</Th>
              <Th>الخامة</Th>
              <Th>الكمية</Th>
              <Th>السعر وقتها</Th>
              <Th>التاريخ</Th>
              <Th>المستخدم</Th>
            </tr>
          </THead>
          <TBody>
            {movements.map((m) => (
              <Tr key={m.id}>
                <Td>{movementTypeLabels[m.movementType] ?? m.movementType}</Td>
                <Td>{m.materialName}</Td>
                <TdMono>{m.quantity}</TdMono>
                <TdMono>{formatCurrency(m.unitPriceAtTime)}</TdMono>
                <Td>{formatDate(m.movementDate)}</Td>
                <Td>{m.createdByEmployeeName}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}

      <IssueReturnDialog open={issueOpen} onClose={() => setIssueOpen(false)} mode="issue" materials={materials} projects={projectAsList} defaultProjectId={projectId} />
      <IssueReturnDialog open={returnOpen} onClose={() => setReturnOpen(false)} mode="return" materials={materials} projects={projectAsList} defaultProjectId={projectId} />
    </div>
  );
}
