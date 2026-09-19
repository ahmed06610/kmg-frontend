"use client";

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
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTableState } from "@/lib/useTableState";
import { checkStatusLabels } from "@/types/enums";
import type { SupplierDetailsDTO, SupplierPaymentDTO } from "@/types/supplier";
import { ResolveCheckDialog } from "./ResolveCheckDialog";
import { SupplierFormDialog } from "./SupplierFormDialog";
import { SupplierPaymentDialog } from "./SupplierPaymentDialog";

const checkStatusTone: Record<string, "warning" | "success" | "neutral"> = {
  Pending: "warning",
  Cleared: "success",
  Cancelled: "neutral",
};

export function SupplierDetailsView({ supplier, canManage }: { supplier: SupplierDetailsDTO; canManage: boolean }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<SupplierPaymentDTO | null>(null);
  const [resolvingPayment, setResolvingPayment] = useState<SupplierPaymentDTO | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<SupplierPaymentDTO | null>(null);
  const [deleteSupplierOpen, setDeleteSupplierOpen] = useState(false);

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
            {supplier.phone ?? "بدون هاتف"} {supplier.email ? `· ${supplier.email}` : ""}
          </p>
        </div>
        <div className="flex gap-stack-sm">
          <MultiSheetExportButton
            filename={supplier.name}
            sheets={[
              {
                name: "المشتريات",
                columns: [
                  { header: "الخامة", key: "materialName" },
                  { header: "الكمية", key: "quantity" },
                  { header: "سعر الوحدة", key: "unitPriceAtTime" },
                  { header: "التاريخ", key: "date" },
                ],
                rows: supplier.purchases.map((p) => ({
                  materialName: p.materialName,
                  quantity: p.quantity,
                  unitPriceAtTime: p.unitPriceAtTime,
                  date: formatDate(p.movementDate),
                })),
              },
              {
                name: "الدفعات",
                columns: [
                  { header: "المبلغ", key: "amount" },
                  { header: "الطريقة", key: "method" },
                  { header: "التاريخ", key: "date" },
                  { header: "ملاحظات", key: "notes" },
                ],
                rows: supplier.payments.map((p) => ({
                  amount: p.amount,
                  method: p.isCheck ? `شيك (${checkStatusLabels[p.checkStatus ?? ""] ?? p.checkStatus})` : "نقدي",
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
                تعديل
              </Button>
              <Button onClick={() => setPaymentOpen(true)}>
                <Icon name="payments" size={18} />
                تسجيل دفعة
              </Button>
              <Button variant="danger" onClick={() => setDeleteSupplierOpen(true)}>
                <Icon name="delete" size={18} />
                حذف المورد
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
        <Card>
          <p className="text-body-sm text-on-surface-variant">إجمالي المشتريات</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-on-surface mt-1 text-right">
            {formatCurrency(supplier.totalPurchases)}
          </p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">إجمالي المدفوع</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-success mt-1 text-right">
            {formatCurrency(supplier.totalPaid)}
          </p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">المتبقي</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-error mt-1 text-right">
            {formatCurrency(supplier.totalRemaining)}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between flex-wrap gap-stack-sm">
          <CardTitle>سجل المشتريات ({supplier.purchases.length})</CardTitle>
          {supplier.purchases.length > 0 && (
            <SearchInput value={purchasesTable.search} onChange={purchasesTable.setSearch} placeholder="بحث بالخامة..." className="sm:w-56" />
          )}
        </CardHeader>
        {supplier.purchases.length === 0 ? (
          <EmptyState icon="inventory_2" title="لا توجد مشتريات مسجلة بعد" />
        ) : purchasesTable.totalCount === 0 ? (
          <EmptyState icon="search_off" title="لا توجد نتائج مطابقة" />
        ) : (
          <>
            <Table>
              <THead>
                <tr>
                  <Th>الخامة</Th>
                  <Th>الكمية</Th>
                  <Th>سعر الوحدة</Th>
                  <Th>التاريخ</Th>
                </tr>
              </THead>
              <TBody>
                {purchasesTable.pageRows.map((p) => (
                  <Tr key={p.id}>
                    <Td>{p.materialName}</Td>
                    <TdMono>{p.quantity}</TdMono>
                    <TdMono>{formatCurrency(p.unitPriceAtTime)}</TdMono>
                    <Td>{formatDate(p.movementDate)}</Td>
                  </Tr>
                ))}
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
          <CardTitle>سجل الدفعات ({supplier.payments.length})</CardTitle>
          {supplier.payments.length > 0 && (
            <SearchInput value={paymentsTable.search} onChange={paymentsTable.setSearch} placeholder="بحث بالملاحظات أو المبلغ..." className="sm:w-56" />
          )}
        </CardHeader>
        {supplier.payments.length === 0 ? (
          <EmptyState icon="receipt_long" title="لا توجد دفعات مسجلة بعد" />
        ) : paymentsTable.totalCount === 0 ? (
          <EmptyState icon="search_off" title="لا توجد نتائج مطابقة" />
        ) : (
          <>
          <Table>
            <THead>
              <tr>
                <Th>المبلغ</Th>
                <Th>الطريقة</Th>
                <Th>التاريخ</Th>
                <Th>ملاحظات</Th>
                {canManage && <Th>إجراءات</Th>}
              </tr>
            </THead>
            <TBody>
              {paymentsTable.pageRows.map((p) => (
                <Tr key={p.id}>
                  <TdMono>{formatCurrency(p.amount)}</TdMono>
                  <Td>
                    {p.isCheck ? (
                      <div className="flex items-center gap-1.5">
                        <span>شيك{p.checkDueDate ? ` (${formatDate(p.checkDueDate)})` : ""}</span>
                        {p.checkStatus && (
                          <Badge tone={checkStatusTone[p.checkStatus] ?? "neutral"}>{checkStatusLabels[p.checkStatus] ?? p.checkStatus}</Badge>
                        )}
                      </div>
                    ) : (
                      "نقدي"
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
                            title="تسوية الشيك"
                            onClick={() => setResolvingPayment(p)}
                          >
                            <Icon name="fact_check" size={18} />
                          </button>
                        )}
                        <button className="text-on-surface-variant hover:text-on-surface" title="تعديل" onClick={() => setEditingPayment(p)}>
                          <Icon name="edit" size={18} />
                        </button>
                        <button className="text-error hover:opacity-80" title="حذف" onClick={() => setDeletingPayment(p)}>
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
      <ConfirmDialog
        open={!!deletingPayment}
        onClose={() => setDeletingPayment(null)}
        title="حذف الدفعة"
        message="هل أنت متأكد من حذف هذه الدفعة؟ سيتم إلغاء أثرها في الخزنة لو كانت مسجلة."
        onConfirm={() => deleteSupplierPayment(deletingPayment!.id, supplier.id)}
        onConfirmed={() => router.refresh()}
      />
      <ConfirmDialog
        open={deleteSupplierOpen}
        onClose={() => setDeleteSupplierOpen(false)}
        title="حذف المورد"
        message="هل أنت متأكد من حذف هذا المورد نهائيًا؟"
        onConfirm={() => deleteSupplier(supplier.id)}
        onConfirmed={() => router.push("/suppliers")}
      />
    </div>
  );
}
