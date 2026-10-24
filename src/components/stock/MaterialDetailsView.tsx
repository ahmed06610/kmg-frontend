"use client";

import { useT } from "@/lib/i18n/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatMaterialLabel } from "@/lib/material-label";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTableState } from "@/lib/useTableState";
import { movementTypeLabels } from "@/types/enums";
import type { MaterialCategoryDTO, MaterialDTO, StockMovementDTO } from "@/types/stock";
import type { SupplierListDTO } from "@/types/supplier";
import type { ProjectListDTO } from "@/types/project";
import { MaterialFormDialog } from "./MaterialFormDialog";
import { PurchaseDialog } from "./PurchaseDialog";
import { IssueReturnDialog } from "./IssueReturnDialog";
import { MovementActions, MovementDialogs } from "./MovementDialogs";
import { DeleteMaterialDialog, MergeMaterialDialog, StockAdjustmentDialog } from "./MaterialToolsDialogs";

/** أثر الحركة على رصيد المخزن: الصرف بالسالب، وتسوية الجرد كميتها أصلًا بالإشارة */
function signedQuantity(m: StockMovementDTO) {
  return m.movementType === "IssueToProject" ? -m.quantity : m.quantity;
}

export function MaterialDetailsView({
  material,
  allMaterials,
  movements,
  suppliers,
  projects,
  categories,
  canManage,
}: {
  material: MaterialDTO;
  allMaterials: MaterialDTO[];
  movements: StockMovementDTO[];
  suppliers: SupplierListDTO[];
  projects: ProjectListDTO[];
  categories: MaterialCategoryDTO[];
  canManage: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<StockMovementDTO | null>(null);
  const [deletingMovement, setDeletingMovement] = useState<StockMovementDTO | null>(null);

  const movementsTable = useTableState({
    rows: movements,
    pageSize: 10,
    searchPredicate: (m, term) =>
      (m.projectName ?? "").toLowerCase().includes(term) ||
      (m.supplierName ?? "").toLowerCase().includes(term) ||
      (m.notes ?? "").toLowerCase().includes(term),
  });

  const purchases = movements.filter((m) => m.movementType === "Purchase");
  const purchasesTable = useTableState({ rows: purchases, pageSize: 10 });
  const purchasesTotal = purchases.reduce((sum, m) => sum + m.quantity * m.unitPriceAtTime, 0);
  const purchasesTransport = purchases.reduce((sum, m) => sum + m.transportCost, 0);

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="flex items-start justify-between flex-wrap gap-stack-sm">
        <div>
          <h1 className="text-headline-md text-on-surface">{formatMaterialLabel(material, categories)}</h1>
          <p className="text-body-sm text-on-surface-variant">
            {material.unit} · {material.isLowStock ? <Badge tone="error">{t("نقص مخزون")}</Badge> : <Badge tone="success">{t("متاح")}</Badge>}
          </p>
        </div>
        {canManage && (
          <div className="flex flex-wrap gap-stack-sm">
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Icon name="edit" size={18} />
              {t("تعديل البيانات")}</Button>
            <Button variant="secondary" onClick={() => setAdjustOpen(true)}>
              <Icon name="fact_check" size={18} />
              {t("تسوية جرد")}</Button>
            <Button variant="secondary" onClick={() => setMergeOpen(true)}>
              <Icon name="merge" size={18} />
              {t("دمج")}</Button>
            <Button variant="secondary" onClick={() => setReturnOpen(true)}>
              <Icon name="undo" size={18} />
              {t("مرتجع")}</Button>
            <Button variant="secondary" onClick={() => setIssueOpen(true)}>
              <Icon name="output" size={18} />
              {t("صرف")}</Button>
            <Button onClick={() => setPurchaseOpen(true)}>
              <Icon name="shopping_cart" size={18} />
              {t("شراء")}</Button>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              <Icon name="delete" size={18} />
              {t("حذف")}</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-gutter">
        <Card>
          <p className="text-body-sm text-on-surface-variant">{t("الكمية المتاحة")}</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-on-surface mt-1 text-page-start">
            {material.quantity} {material.unit}
          </p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">{t("سعر الوحدة")}</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-on-surface mt-1 text-page-start">
            {formatCurrency(material.unitPrice)}
          </p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">{t("الإجمالي")}</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-on-surface mt-1 text-page-start">
            {formatCurrency(material.totalPrice)}
          </p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">{t("الحد الأدنى")}</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-on-surface mt-1 text-page-start">
            {material.minimumThreshold}
          </p>
        </Card>
      </div>

      {(material.categoryName || Object.keys(material.extraFieldValues).length > 0) && (
        <Card>
          <p className="text-body-sm text-on-surface-variant mb-2">{t("بيانات النوع")}</p>
          <div className="flex flex-wrap gap-gutter text-body-sm">
            {material.categoryName && (
              <div>
                <span className="text-on-surface-variant">{t("النوع: ")}</span>
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

      {canManage && (
        <div className="rounded-lg border border-outline-variant bg-surface-container-low px-stack-md py-stack-sm text-xs text-on-surface-variant flex items-start gap-2">
          <Icon name="lightbulb" size={16} className="text-primary mt-0.5 shrink-0" />
          <span>
            {t("أي حركة متسجلة غلط (شراء / صرف / مرتجع / رصيد افتتاحي / تسوية جرد) تقدر تعدلها أو تحذفها من زراير الإجراءات في الجداول تحت. الرصيد وتكلفة المشاريع ومستحقات الموردين بيتعاد حسابهم تلقائيًا، والخزنة مش بتتأثر (بتتأثر بس بدفعات الموردين).")}</span>
        </div>
      )}

      {purchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("سجل المشتريات (")}{purchases.length})</CardTitle>
          </CardHeader>
          <Table>
            <THead>
              <tr>
                <Th>{t("التاريخ")}</Th>
                <Th>{t("السعر")}</Th>
                <Th>{t("الكمية")}</Th>
                <Th>{t("الإجمالي")}</Th>
                <Th>{t("النقل")}</Th>
                <Th>{t("الإجمالي بالنقل")}</Th>
                <Th>{t("تكلفة الوحدة بالنقل")}</Th>
                <Th>{t("المورد")}</Th>
                {canManage && <Th>{t("إجراءات")}</Th>}
              </tr>
            </THead>
            <TBody>
              {purchasesTable.pageRows.map((m) => (
                <Tr key={m.id}>
                  <Td>{formatDate(m.movementDate)}</Td>
                  <TdMono>{formatCurrency(m.unitPriceAtTime)}</TdMono>
                  <TdMono>{m.quantity}</TdMono>
                  <TdMono className="font-semibold">{formatCurrency(m.quantity * m.unitPriceAtTime)}</TdMono>
                  <TdMono>{m.transportCost > 0 ? formatCurrency(m.transportCost) : "-"}</TdMono>
                  <TdMono className="font-semibold">{formatCurrency(m.quantity * m.unitPriceAtTime + m.transportCost)}</TdMono>
                  <TdMono>{formatCurrency(m.unitPriceAtTime + (m.quantity > 0 ? m.transportCost / m.quantity : 0))}</TdMono>
                  <Td>{m.supplierName ?? "-"}</Td>
                  {canManage && (
                    <Td>
                      <MovementActions movement={m} onEdit={setEditingMovement} onDelete={setDeletingMovement} />
                    </Td>
                  )}
                </Tr>
              ))}
              <tr className="bg-surface-container-low font-semibold">
                <td colSpan={3} className="p-stack-md text-body-sm text-on-surface">
                  {t("إجمالي المشتريات")}</td>
                <td dir="ltr" className="p-stack-md text-mono-data text-primary text-page-start">
                  {formatCurrency(purchasesTotal)}
                </td>
                <td dir="ltr" className="p-stack-md text-mono-data text-on-surface text-page-start">
                  {purchasesTransport > 0 ? formatCurrency(purchasesTransport) : "-"}
                </td>
                <td dir="ltr" className="p-stack-md text-mono-data text-primary text-page-start">
                  {formatCurrency(purchasesTotal + purchasesTransport)}
                </td>
                <td />
                <td colSpan={canManage ? 2 : 1} />
              </tr>
            </TBody>
          </Table>
          {purchases.length > purchasesTable.pageSize && (
            <div className="mt-stack-sm">
              <Pagination page={purchasesTable.page} pageSize={purchasesTable.pageSize} totalCount={purchasesTable.totalCount} onPageChange={purchasesTable.setPage} />
            </div>
          )}
        </Card>
      )}

      <Card>
        <CardHeader className="flex items-center justify-between flex-wrap gap-stack-sm">
          <CardTitle>{t("سجل الحركات (")}{movements.length})</CardTitle>
          {movements.length > 0 && (
            <SearchInput value={movementsTable.search} onChange={movementsTable.setSearch} placeholder={t("بحث بالمشروع أو المورد...")} className="sm:w-64" />
          )}
        </CardHeader>
        {movements.length === 0 ? (
          <EmptyState icon="history" title={t("لا توجد حركات مسجلة بعد")} />
        ) : movementsTable.totalCount === 0 ? (
          <EmptyState icon="search_off" title={t("لا توجد نتائج مطابقة")} />
        ) : (
          <>
            <Table>
              <THead>
                <tr>
                  <Th>{t("النوع")}</Th>
                  <Th>{t("الكمية")}</Th>
                  <Th>{t("السعر وقت الحركة")}</Th>
                  <Th>{t("الإجمالي")}</Th>
                  <Th>{t("المشروع / المورد")}</Th>
                  <Th>{t("التاريخ")}</Th>
                  <Th>{t("المستخدم")}</Th>
                  {canManage && <Th>{t("إجراءات")}</Th>}
                </tr>
              </THead>
              <TBody>
                {movementsTable.pageRows.map((m) => {
                  const signed = signedQuantity(m);
                  return (
                    <Tr key={m.id}>
                      <Td>{t(movementTypeLabels[m.movementType] ?? m.movementType)}</Td>
                      <TdMono className={signed < 0 ? "text-error" : "text-success"}>
                        {signed > 0 ? "+" : ""}
                        {signed}
                      </TdMono>
                      <TdMono>{formatCurrency(m.unitPriceAtTime)}</TdMono>
                      <TdMono>{formatCurrency(m.quantity * m.unitPriceAtTime)}</TdMono>
                      <Td>{m.projectName ?? m.supplierName ?? (m.notes || "-")}</Td>
                      <Td>{formatDate(m.movementDate)}</Td>
                      <Td>{m.createdByEmployeeName}</Td>
                      {canManage && (
                        <Td>
                          <MovementActions movement={m} onEdit={setEditingMovement} onDelete={setDeletingMovement} />
                        </Td>
                      )}
                    </Tr>
                  );
                })}
              </TBody>
            </Table>
            <div className="mt-stack-sm">
              <Pagination page={movementsTable.page} pageSize={movementsTable.pageSize} totalCount={movementsTable.totalCount} onPageChange={movementsTable.setPage} />
            </div>
          </>
        )}
      </Card>

      <MaterialFormDialog open={editOpen} onClose={() => setEditOpen(false)} material={material} categories={categories} />
      <PurchaseDialog open={purchaseOpen} onClose={() => setPurchaseOpen(false)} materials={[material]} suppliers={suppliers} categories={categories} defaultMaterialId={material.id} />
      <IssueReturnDialog open={issueOpen} onClose={() => setIssueOpen(false)} mode="issue" materials={[material]} projects={projects} categories={categories} defaultMaterialId={material.id} />
      <IssueReturnDialog open={returnOpen} onClose={() => setReturnOpen(false)} mode="return" materials={[material]} projects={projects} categories={categories} defaultMaterialId={material.id} />
      <StockAdjustmentDialog open={adjustOpen} onClose={() => setAdjustOpen(false)} material={material} />
      <MergeMaterialDialog open={mergeOpen} onClose={() => setMergeOpen(false)} source={material} materials={allMaterials} categories={categories} />
      <DeleteMaterialDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        material={material}
        onDeleted={() => router.push("/stock")}
        onSuggestMerge={() => setMergeOpen(true)}
      />
      <MovementDialogs
        editing={editingMovement}
        deleting={deletingMovement}
        onCloseEdit={() => setEditingMovement(null)}
        onCloseDelete={() => setDeletingMovement(null)}
        materials={[material]}
        categories={categories}
        suppliers={suppliers}
        projects={projects}
      />
    </div>
  );
}
