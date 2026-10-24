"use client";

import { useT } from "@/lib/i18n/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteSupplier, deleteSupplierPayment } from "@/actions/suppliers";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { MultiSheetExportButton } from "@/components/ui/ExportButton";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { PurchaseDialog } from "@/components/stock/PurchaseDialog";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatMaterialLabel } from "@/lib/material-label";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTableState } from "@/lib/useTableState";
import { checkStatusLabels } from "@/types/enums";
import type { MaterialCategoryDTO, MaterialDTO, StockMovementDTO } from "@/types/stock";
import type { SupplierDetailsDTO, SupplierPaymentDTO, SupplierPurchaseDTO } from "@/types/supplier";
import { ResolveCheckDialog } from "./ResolveCheckDialog";
import { SupplierFormDialog } from "./SupplierFormDialog";
import { SupplierPaymentDialog } from "./SupplierPaymentDialog";

const checkStatusTone: Record<string, "warning" | "success" | "neutral"> = {
  Pending: "warning",
  Cleared: "success",
  Cancelled: "neutral",
};

function toMovement(p: SupplierPurchaseDTO, supplierId: number, supplierName: string): StockMovementDTO {
  return {
    id: p.id,
    movementType: "Purchase",
    materialId: p.materialId,
    materialName: p.materialName,
    quantity: p.quantity,
    unitPriceAtTime: p.unitPriceAtTime,
    transportCost: p.transportCost,
    projectId: null,
    projectCode: null,
    projectName: null,
    supplierId,
    supplierName,
    movementDate: p.movementDate,
    notes: p.notes,
    createdByEmployeeName: "",
    attachmentUrl: p.attachmentUrl,
    attachmentFileName: p.attachmentFileName,
  };
}

export function SupplierDetailsView({
  supplier,
  materials,
  categories,
  canManage,
}: {
  supplier: SupplierDetailsDTO;
  materials: MaterialDTO[];
  categories: MaterialCategoryDTO[];
  canManage: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<SupplierPaymentDTO | null>(null);
  const [resolvingPayment, setResolvingPayment] = useState<SupplierPaymentDTO | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<SupplierPaymentDTO | null>(null);
  const [deleteSupplierOpen, setDeleteSupplierOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<SupplierPurchaseDTO | null>(null);

  const purchasesTable = useTableState({
    rows: supplier.purchases,
    pageSize: 10,
    searchPredicate: (p, term) => p.materialName.toLowerCase().includes(term),
  });
  const paymentsTable = useTableState({
    rows: supplier.payments,
    pageSize: 10,
    searchPredicate: (p, term) => (p.notes ?? "").toLowerCase().includes(term) || String(p.amount).includes(term),
  });

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface">{supplier.name}</h1>
          <p className="text-body-sm text-on-surface-variant">
            {supplier.phone ?? t("بدون هاتف")} {supplier.email ? `· ${supplier.email}` : ""}
          </p>
        </div>
        <div className="flex gap-stack-sm">
          <MultiSheetExportButton
            filename={supplier.name}
            sheets={[
              {
                name: t("المشتريات"),
                columns: [
                  { header: t("الخامة"), key: "materialName" },
                  { header: t("الكمية"), key: "quantity" },
                  { header: t("سعر الوحدة"), key: "unitPriceAtTime" },
                  { header: t("قيمة النقل"), key: "transportCost" },
                  { header: t("الإجمالي بالنقل"), key: "totalWithTransport" },
                  { header: t("التاريخ"), key: "date" },
                ],
                rows: supplier.purchases.map((p) => ({
                  materialName: p.materialName,
                  quantity: p.quantity,
                  unitPriceAtTime: p.unitPriceAtTime,
                  transportCost: p.transportCost,
                  totalWithTransport: p.quantity * p.unitPriceAtTime + p.transportCost,
                  date: formatDate(p.movementDate),
                })),
              },
              {
                name: t("الدفعات"),
                columns: [
                  { header: t("المبلغ"), key: "amount" },
                  { header: t("الطريقة"), key: "method" },
                  { header: t("التاريخ"), key: "date" },
                  { header: t("ملاحظات"), key: "notes" },
                ],
                rows: supplier.payments.map((p) => ({
                  amount: p.amount,
                  method: p.isCheck ? t("شيك ({0})", [t(checkStatusLabels[p.checkStatus ?? ""] ?? p.checkStatus)]) : t("نقدي"),
                  date: formatDate(p.paymentDate),
                  notes: p.notes ?? "-",
                })),
              },
            ]}
          />
          {canManage && (
            <>
              <Button variant="secondary" onClick={() => setEditOpen(true)}>
                <Icon name="edit" size={18} />
                {t("تعديل")}</Button>
              <Button onClick={() => setPaymentOpen(true)}>
                <Icon name="payments" size={18} />
                {t("تسجيل دفعة")}</Button>
              <Button variant="danger" onClick={() => setDeleteSupplierOpen(true)}>
                <Icon name="delete" size={18} />
                {t("حذف المورد")}</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
        <Card>
          <p className="text-body-sm text-on-surface-variant">{t("إجمالي المشتريات")}</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-on-surface mt-1 text-page-start">
            {formatCurrency(supplier.totalPurchases)}
          </p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">{t("إجمالي المدفوع")}</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-success mt-1 text-page-start">
            {formatCurrency(supplier.totalPaid)}
          </p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">{t("المتبقي")}</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-error mt-1 text-page-start">
            {formatCurrency(supplier.totalRemaining)}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between flex-wrap gap-stack-sm">
          <CardTitle>{t("سجل المشتريات (")}{supplier.purchases.length})</CardTitle>
          {supplier.purchases.length > 0 && (
            <SearchInput value={purchasesTable.search} onChange={purchasesTable.setSearch} placeholder={t("بحث بالخامة...")} className="sm:w-56" />
          )}
        </CardHeader>
        {supplier.purchases.length === 0 ? (
          <EmptyState icon="inventory_2" title={t("لا توجد مشتريات مسجلة بعد")} />
        ) : purchasesTable.totalCount === 0 ? (
          <EmptyState icon="search_off" title={t("لا توجد نتائج مطابقة")} />
        ) : (
          <>
            <Table>
              <THead>
                <tr>
                  <Th>{t("الخامة")}</Th>
                  <Th>{t("الكمية")}</Th>
                  <Th>{t("سعر الوحدة")}</Th>
                  <Th>{t("قيمة النقل")}</Th>
                  <Th>{t("الإجمالي بالنقل")}</Th>
                  <Th>{t("التاريخ")}</Th>
                  {canManage && <Th>{t("إجراءات")}</Th>}
                </tr>
              </THead>
              <TBody>
                {purchasesTable.pageRows.map((p) => {
                  const material = materials.find((m) => m.id === p.materialId);
                  return (
                    <Tr key={p.id}>
                      <Td>{material ? formatMaterialLabel(material, categories) : p.materialName}</Td>
                      <TdMono>{p.quantity}</TdMono>
                      <TdMono>{formatCurrency(p.unitPriceAtTime)}</TdMono>
                      <TdMono>{p.transportCost > 0 ? formatCurrency(p.transportCost) : "-"}</TdMono>
                      <TdMono className="font-semibold">{formatCurrency(p.quantity * p.unitPriceAtTime + p.transportCost)}</TdMono>
                      <TdMono className="font-semibold">{formatCurrency(p.quantity * p.unitPriceAtTime + p.transportCost)}</TdMono>
                      <Td>{formatDate(p.movementDate)}</Td>
                      {canManage && (
                        <Td>
                          <button className="text-on-surface-variant hover:text-on-surface" title={t("تعديل خطأ")} onClick={() => setEditingPurchase(p)}>
                            <Icon name="edit" size={18} />
                          </button>
                        </Td>
                      )}
                    </Tr>
                  );
                })}
              </TBody>
            </Table>
            <div className="mt-stack-sm">
              <Pagination page={purchasesTable.page} pageSize={purchasesTable.pageSize} totalCount={purchasesTable.totalCount} onPageChange={purchasesTable.setPage} />
            </div>
          </>
        )}
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between flex-wrap gap-stack-sm">
          <CardTitle>{t("سجل الدفعات (")}{supplier.payments.length})</CardTitle>
          {supplier.payments.length > 0 && (
            <SearchInput value={paymentsTable.search} onChange={paymentsTable.setSearch} placeholder={t("بحث بالملاحظات أو المبلغ...")} className="sm:w-56" />
          )}
        </CardHeader>
        {supplier.payments.length === 0 ? (
          <EmptyState icon="receipt_long" title={t("لا توجد دفعات مسجلة بعد")} />
        ) : paymentsTable.totalCount === 0 ? (
          <EmptyState icon="search_off" title={t("لا توجد نتائج مطابقة")} />
        ) : (
          <>
          <Table>
            <THead>
              <tr>
                <Th>{t("المبلغ")}</Th>
                <Th>{t("الطريقة")}</Th>
                <Th>{t("التاريخ")}</Th>
                <Th>{t("ملاحظات")}</Th>
                {canManage && <Th>{t("إجراءات")}</Th>}
              </tr>
            </THead>
            <TBody>
              {paymentsTable.pageRows.map((p) => (
                <Tr key={p.id}>
                  <TdMono>{formatCurrency(p.amount)}</TdMono>
                  <Td>
                    {p.isCheck ? (
                      <div className="flex items-center gap-1.5">
                        <span>{t("شيك")}{p.checkDueDate ? ` (${formatDate(p.checkDueDate)})` : ""}</span>
                        {p.checkStatus && (
                          <Badge tone={checkStatusTone[p.checkStatus] ?? "neutral"}>{t(checkStatusLabels[p.checkStatus] ?? p.checkStatus)}</Badge>
                        )}
                      </div>
                    ) : (
                      t("نقدي")
                    )}
                  </Td>
                  <Td>{formatDate(p.paymentDate)}</Td>
                  <Td>{p.notes ?? "-"}</Td>
                  {canManage && (
                    <Td>
                      <div className="flex items-center gap-1">
                        {p.isCheck && p.checkStatus === "Pending" && (
                          <button
                            className="text-warning hover:opacity-80"
                            title={t("تسوية الشيك")}
                            onClick={() => setResolvingPayment(p)}
                          >
                            <Icon name="fact_check" size={18} />
                          </button>
                        )}
                        <button className="text-on-surface-variant hover:text-on-surface" title={t("تعديل")} onClick={() => setEditingPayment(p)}>
                          <Icon name="edit" size={18} />
                        </button>
                        <button className="text-error hover:opacity-80" title={t("حذف")} onClick={() => setDeletingPayment(p)}>
                          <Icon name="delete" size={18} />
                        </button>
                      </div>
                    </Td>
                  )}
                </Tr>
              ))}
            </TBody>
          </Table>
          <div className="mt-stack-sm">
            <Pagination page={paymentsTable.page} pageSize={paymentsTable.pageSize} totalCount={paymentsTable.totalCount} onPageChange={paymentsTable.setPage} />
          </div>
          </>
        )}
      </Card>

      <SupplierFormDialog open={editOpen} onClose={() => setEditOpen(false)} supplier={supplier} />
      <SupplierPaymentDialog
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        supplierId={supplier.id}
        outstanding={supplier.totalRemaining}
      />
      <SupplierPaymentDialog
        open={!!editingPayment}
        onClose={() => setEditingPayment(null)}
        supplierId={supplier.id}
        outstanding={supplier.totalRemaining + (editingPayment?.amount ?? 0)}
        payment={editingPayment ?? undefined}
      />
      <ResolveCheckDialog open={!!resolvingPayment} onClose={() => setResolvingPayment(null)} payment={resolvingPayment} />
      <PurchaseDialog
        open={!!editingPurchase}
        onClose={() => setEditingPurchase(null)}
        materials={materials}
        suppliers={[supplier]}
        categories={categories}
        purchase={editingPurchase ? toMovement(editingPurchase, supplier.id, supplier.name) : undefined}
      />
      <ConfirmDialog
        open={!!deletingPayment}
        onClose={() => setDeletingPayment(null)}
        title={t("حذف الدفعة")}
        message={t("هل أنت متأكد من حذف هذه الدفعة؟ سيتم إلغاء أثرها في الخزنة لو كانت مسجلة.")}
        onConfirm={() => deleteSupplierPayment(deletingPayment!.id, supplier.id)}
        onConfirmed={() => router.refresh()}
      />
      <ConfirmDialog
        open={deleteSupplierOpen}
        onClose={() => setDeleteSupplierOpen(false)}
        title={t("حذف المورد")}
        message={t("هل أنت متأكد من حذف هذا المورد نهائيًا؟")}
        onConfirm={() => deleteSupplier(supplier.id)}
        onConfirmed={() => router.push("/suppliers")}
      />
    </div>
  );
}
