"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteMaterial } from "@/actions/stock";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTableState } from "@/lib/useTableState";
import { movementTypeLabels } from "@/types/enums";
import type { MaterialCategoryDTO, MaterialDTO, StockMovementDTO } from "@/types/stock";
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
  categories,
  canManage,
}: {
  material: MaterialDTO;
  movements: StockMovementDTO[];
  suppliers: SupplierListDTO[];
  projects: ProjectListDTO[];
  categories: MaterialCategoryDTO[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const movementsTable = useTableState({
    rows: movements,
    pageSize: 10,
    searchPredicate: (m, term) =>
      (m.projectName ?? "").toLowerCase().includes(term) ||
      (m.supplierName ?? "").toLowerCase().includes(term) ||
      (m.notes ?? "").toLowerCase().includes(term),
  });

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
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              <Icon name="delete" size={18} />
              حذف
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-gutter">
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
          <p className="text-body-sm text-on-surface-variant">الإجمالي</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-on-surface mt-1 text-right">
            {formatCurrency(material.totalPrice)}
          </p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">الحد الأدنى</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-on-surface mt-1 text-right">
            {material.minimumThreshold}
          </p>
        </Card>
      </div>

      {(material.categoryName || Object.keys(material.extraFieldValues).length > 0) && (
        <Card>
          <p className="text-body-sm text-on-surface-variant mb-2">بيانات النوع</p>
          <div className="flex flex-wrap gap-gutter text-body-sm">
            {material.categoryName && (
              <div>
                <span className="text-on-surface-variant">النوع: </span>
                <span className="text-on-surface font-semibold">{material.categoryName}</span>
              </div>
            )}
            {Object.entries(material.extraFieldValues).map(([key, value]) => {
              const category = categories.find((c) => c.id === material.categoryId);
              const label = category?.extraFieldDefinitions.find((f) => f.key === key)?.label ?? key;
              return (
                <div key={key}>
                  <span className="text-on-surface-variant">{label}: </span>
                  <span className="text-on-surface font-semibold">{value}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader className="flex items-center justify-between flex-wrap gap-stack-sm">
          <CardTitle>سجل الحركات ({movements.length})</CardTitle>
          {movements.length > 0 && (
            <SearchInput value={movementsTable.search} onChange={movementsTable.setSearch} placeholder="بحث بالمشروع أو المورد..." className="sm:w-64" />
          )}
        </CardHeader>
        {movements.length === 0 ? (
          <EmptyState icon="history" title="لا توجد حركات مسجلة بعد" />
        ) : movementsTable.totalCount === 0 ? (
          <EmptyState icon="search_off" title="لا توجد نتائج مطابقة" />
        ) : (
          <>
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
                {movementsTable.pageRows.map((m) => (
                  <Tr key={m.id}>
                    <Td>{movementTypeLabels[m.movementType] ?? m.movementType}</Td>
                    <TdMono>{m.quantity}</TdMono>
                    <TdMono>{formatCurrency(m.unitPriceAtTime)}</TdMono>
                    <Td>{m.projectName ?? m.supplierName ?? "-"}</Td>
                    <Td>{formatDate(m.movementDate)}</Td>
                    <Td>{m.createdByEmployeeName}</Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
            <div className="mt-stack-sm">
              <Pagination page={movementsTable.page} pageSize={movementsTable.pageSize} totalCount={movementsTable.totalCount} onPageChange={movementsTable.setPage} />
            </div>
          </>
        )}
      </Card>

      <MaterialFormDialog open={editOpen} onClose={() => setEditOpen(false)} material={material} categories={categories} />
      <PurchaseDialog open={purchaseOpen} onClose={() => setPurchaseOpen(false)} materials={[material]} suppliers={suppliers} defaultMaterialId={material.id} />
      <IssueReturnDialog open={issueOpen} onClose={() => setIssueOpen(false)} mode="issue" materials={[material]} projects={projects} defaultMaterialId={material.id} />
      <IssueReturnDialog open={returnOpen} onClose={() => setReturnOpen(false)} mode="return" materials={[material]} projects={projects} defaultMaterialId={material.id} />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="حذف الخامة"
        message={`هل أنت متأكد من حذف خامة "${material.name}"؟`}
        onConfirm={() => deleteMaterial(material.id)}
        onConfirmed={() => router.push("/stock")}
      />
    </div>
  );
}
