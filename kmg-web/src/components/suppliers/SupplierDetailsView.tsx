"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { SupplierDetailsDTO } from "@/types/supplier";
import { SupplierFormDialog } from "./SupplierFormDialog";
import { SupplierPaymentDialog } from "./SupplierPaymentDialog";

export function SupplierDetailsView({ supplier, canManage }: { supplier: SupplierDetailsDTO; canManage: boolean }) {
  const [editOpen, setEditOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface">{supplier.name}</h1>
          <p className="text-body-sm text-on-surface-variant">
            {supplier.phone ?? "بدون هاتف"} {supplier.email ? `· ${supplier.email}` : ""}
          </p>
        </div>
        {canManage && (
          <div className="flex gap-stack-sm">
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Icon name="edit" size={18} />
              تعديل
            </Button>
            <Button onClick={() => setPaymentOpen(true)}>
              <Icon name="payments" size={18} />
              تسجيل دفعة
            </Button>
          </div>
        )}
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
        <CardHeader>
          <CardTitle>سجل المشتريات ({supplier.purchases.length})</CardTitle>
        </CardHeader>
        {supplier.purchases.length === 0 ? (
          <EmptyState icon="inventory_2" title="لا توجد مشتريات مسجلة بعد" />
        ) : (
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
              {supplier.purchases.map((p) => (
                <Tr key={p.id}>
                  <Td>{p.materialName}</Td>
                  <TdMono>{p.quantity}</TdMono>
                  <TdMono>{formatCurrency(p.unitPriceAtTime)}</TdMono>
                  <Td>{formatDate(p.movementDate)}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>سجل الدفعات ({supplier.payments.length})</CardTitle>
        </CardHeader>
        {supplier.payments.length === 0 ? (
          <EmptyState icon="receipt_long" title="لا توجد دفعات مسجلة بعد" />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>المبلغ</Th>
                <Th>كاش</Th>
                <Th>كريديت</Th>
                <Th>التاريخ</Th>
                <Th>ملاحظات</Th>
              </tr>
            </THead>
            <TBody>
              {supplier.payments.map((p) => (
                <Tr key={p.id}>
                  <TdMono>{formatCurrency(p.amount)}</TdMono>
                  <TdMono>{formatCurrency(p.amountCash)}</TdMono>
                  <TdMono>{formatCurrency(p.amountCredit)}</TdMono>
                  <Td>{formatDate(p.paymentDate)}</Td>
                  <Td>{p.notes ?? "-"}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <SupplierFormDialog open={editOpen} onClose={() => setEditOpen(false)} supplier={supplier} />
      <SupplierPaymentDialog
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        supplierId={supplier.id}
        outstanding={supplier.totalRemaining}
      />
    </div>
  );
}
