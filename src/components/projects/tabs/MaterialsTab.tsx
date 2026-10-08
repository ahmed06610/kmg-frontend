"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { IssueReturnDialog } from "@/components/stock/IssueReturnDialog";
import { MovementActions, MovementDialogs } from "@/components/stock/MovementDialogs";
import { formatMaterialLabelWithPrice } from "@/lib/material-label";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTableState } from "@/lib/useTableState";
import { movementTypeLabels } from "@/types/enums";
import type { MaterialCategoryDTO, MaterialDTO, StockMovementDTO } from "@/types/stock";
import type { ProjectListDTO } from "@/types/project";
import { ProjectMaterialsSummary } from "../ProjectMaterialsSummary";

export function MaterialsTab({
  project,
  movements,
  totalMaterialsCost,
  materials,
  categories,
  canManage,
  canManageStock,
}: {
  project: ProjectListDTO;
  movements: StockMovementDTO[];
  totalMaterialsCost: number;
  materials: MaterialDTO[];
  categories: MaterialCategoryDTO[];
  canManage: boolean;
  canManageStock: boolean;
}) {
  const [issueOpen, setIssueOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<StockMovementDTO | null>(null);
  const [deletingMovement, setDeletingMovement] = useState<StockMovementDTO | null>(null);
  const projectAsList: ProjectListDTO[] = [project];

  const table = useTableState({
    rows: movements,
    pageSize: 10,
    searchPredicate: (m, term) => m.materialName.toLowerCase().includes(term),
  });

  // المرتجع بيقلل التكلفة، فإجمالي سطره بيظهر بالسالب عشان مجموع العمود يطابق إجمالي تكلفة الخامات
  const signedTotal = (m: StockMovementDTO) => (m.movementType === "ReturnFromProject" ? -1 : 1) * m.quantity * m.unitPriceAtTime;
  const filteredTotal = table.filteredRows.reduce((sum, m) => sum + signedTotal(m), 0);
  const isFiltered = table.filteredRows.length !== movements.length;

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex items-center justify-between flex-wrap gap-stack-sm">
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

      <ProjectMaterialsSummary movements={movements} materials={materials} categories={categories} totalMaterialsCost={totalMaterialsCost} />

      <p className="text-title-sm text-on-surface mt-stack-sm">سجل حركات الخامات</p>
      {movements.length > 0 && <SearchInput value={table.search} onChange={table.setSearch} placeholder="بحث بالخامة..." />}

      {movements.length === 0 ? (
        <EmptyState icon="inventory_2" title="لا توجد حركات مخزون على هذا المشروع بعد" />
      ) : table.totalCount === 0 ? (
        <EmptyState icon="search_off" title="لا توجد نتائج مطابقة" />
      ) : (
        <>
          <Table>
            <THead>
              <tr>
                <Th>النوع</Th>
                <Th>الخامة</Th>
                <Th>الكمية</Th>
                <Th>السعر وقتها</Th>
                <Th>الإجمالي</Th>
                <Th>التاريخ</Th>
                <Th>المستخدم</Th>
                {canManageStock && <Th>إجراءات</Th>}
              </tr>
            </THead>
            <TBody>
              {table.pageRows.map((m) => {
                const material = materials.find((x) => x.id === m.materialId);
                const label = material ? formatMaterialLabelWithPrice(material, categories, m.unitPriceAtTime) : m.materialName;
                const total = signedTotal(m);
                return (
                  <Tr key={m.id}>
                    <Td>{movementTypeLabels[m.movementType] ?? m.movementType}</Td>
                    <Td>{label}</Td>
                    <TdMono>{m.quantity}</TdMono>
                    <TdMono>{formatCurrency(m.unitPriceAtTime)}</TdMono>
                    <TdMono className={total < 0 ? "text-success" : "font-semibold"}>{formatCurrency(total)}</TdMono>
                    <Td>{formatDate(m.movementDate)}</Td>
                    <Td>{m.createdByEmployeeName}</Td>
                    {canManageStock && (
                      <Td>
                        <MovementActions movement={m} onEdit={setEditingMovement} onDelete={setDeletingMovement} />
                      </Td>
                    )}
                  </Tr>
                );
              })}
              <tr className="bg-surface-container-low font-semibold">
                <td colSpan={4} className="p-stack-md text-body-sm text-on-surface">
                  {isFiltered ? "إجمالي النتائج المعروضة" : "الإجمالي (صرف - مرتجع)"}
                </td>
                <td dir="ltr" className="p-stack-md text-mono-data text-primary text-right">
                  {formatCurrency(filteredTotal)}
                </td>
                <td colSpan={canManageStock ? 3 : 2} />
              </tr>
            </TBody>
          </Table>
          <Pagination page={table.page} pageSize={table.pageSize} totalCount={table.totalCount} onPageChange={table.setPage} />
        </>
      )}

      <IssueReturnDialog open={issueOpen} onClose={() => setIssueOpen(false)} mode="issue" materials={materials} projects={projectAsList} categories={categories} defaultProjectId={project.id} />
      <IssueReturnDialog open={returnOpen} onClose={() => setReturnOpen(false)} mode="return" materials={materials} projects={projectAsList} categories={categories} defaultProjectId={project.id} />
      <MovementDialogs
        editing={editingMovement}
        deleting={deletingMovement}
        onCloseEdit={() => setEditingMovement(null)}
        onCloseDelete={() => setDeletingMovement(null)}
        materials={materials}
        categories={categories}
        suppliers={[]}
        projects={projectAsList}
      />
    </div>
  );
}
