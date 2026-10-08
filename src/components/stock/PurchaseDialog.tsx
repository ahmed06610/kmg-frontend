"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { recordPurchase, updatePurchase } from "@/actions/stock";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input } from "@/components/ui/Field";
import { InvoiceAttachmentField, type InvoiceAttachmentValue } from "@/components/ui/InvoiceAttachmentField";
import { formatMaterialLabel } from "@/lib/material-label";
import { formatCurrency } from "@/lib/utils";
import { purchaseSchema, type PurchaseFormValues } from "@/schema/stock";
import type { MaterialCategoryDTO, MaterialDTO, StockMovementDTO } from "@/types/stock";
import type { SupplierListDTO } from "@/types/supplier";

export function PurchaseDialog({
  open,
  onClose,
  materials,
  suppliers,
  categories,
  defaultMaterialId,
  purchase,
}: {
  open: boolean;
  onClose: () => void;
  materials: MaterialDTO[];
  suppliers: SupplierListDTO[];
  categories: MaterialCategoryDTO[];
  defaultMaterialId?: number;
  /** لو موجودة، الدايلوج بيفتح في وضع "تعديل خطأ" على حركة شراء متسجلة بالفعل بدل إضافة شراء جديد */
  purchase?: StockMovementDTO;
}) {
  const router = useRouter();
  const isEdit = !!purchase;
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<InvoiceAttachmentValue | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: { materialId: defaultMaterialId ?? 0, supplierId: 0, quantity: 0, unitPrice: 0, transportCost: 0, notes: "" },
  });

  useEffect(() => {
    if (!open) return;
    if (purchase) {
      reset({
        materialId: purchase.materialId,
        supplierId: purchase.supplierId ?? 0,
        quantity: purchase.quantity,
        unitPrice: purchase.unitPriceAtTime,
        transportCost: purchase.transportCost,
        notes: purchase.notes ?? "",
      });
      setAttachment(
        purchase.attachmentUrl ? { attachmentUrl: purchase.attachmentUrl, attachmentFileName: purchase.attachmentFileName ?? purchase.attachmentUrl } : null,
      );
    } else {
      reset({ materialId: defaultMaterialId ?? 0, supplierId: 0, quantity: 0, unitPrice: 0, transportCost: 0, notes: "" });
      setAttachment(null);
    }
    setServerError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, purchase]);

  const selectedMaterialId = watch("materialId");
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);
  const quantity = Number(watch("quantity")) || 0;
  const transport = Number(watch("transportCost")) || 0;
  const materialsTotal = quantity * (Number(watch("unitPrice")) || 0);

  const onSubmit = async (data: PurchaseFormValues) => {
    setLoading(true);
    setServerError(null);
    const payload = {
      ...data,
      notes: data.notes || null,
      attachmentUrl: attachment?.attachmentUrl ?? null,
      attachmentFileName: attachment?.attachmentFileName ?? null,
    };
    const result = isEdit ? await updatePurchase({ id: purchase!.id, ...payload }) : await recordPurchase(payload);
    setLoading(false);
    if (!result.success) {
      setServerError(result.message ?? "حدث خطأ");
      return;
    }
    reset();
    setAttachment(null);
    onClose();
    router.refresh();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "تعديل خطأ في عملية شراء" : "تسجيل شراء خامة"}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="purchase-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : isEdit ? "حفظ التعديل" : "تسجيل الشراء"}
          </Button>
        </>
      }
    >
      <form id="purchase-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="الخامة" error={errors.materialId?.message}>
          <Controller
            name="materialId"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value ? String(field.value) : ""}
                onChange={(v) => {
                  const id = Number(v);
                  field.onChange(id);
                  const material = materials.find((m) => m.id === id);
                  if (material) setValue("unitPrice", material.unitPrice);
                }}
                disabled={!!defaultMaterialId || isEdit}
                placeholder="اختر خامة"
                options={materials.map((m) => ({ value: String(m.id), label: formatMaterialLabel(m, categories), hint: `متاح: ${m.quantity}` }))}
              />
            )}
          />
          {selectedMaterial && (
            <p className="text-xs text-on-surface-variant mt-1">
              الرصيد الحالي: {selectedMaterial.quantity} {selectedMaterial.unit} · آخر سعر: {formatCurrency(selectedMaterial.unitPrice)}
            </p>
          )}
        </FieldGroup>
        <FieldGroup label="المورد" error={errors.supplierId?.message}>
          <Controller
            name="supplierId"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value ? String(field.value) : ""}
                onChange={(v) => field.onChange(Number(v))}
                placeholder="اختر مورد"
                options={suppliers.map((s) => ({ value: String(s.id), label: s.name }))}
              />
            )}
          />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label="الكمية" error={errors.quantity?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("quantity", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label="سعر الوحدة" error={errors.unitPrice?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("unitPrice", { valueAsNumber: true })} />
          </FieldGroup>
        </div>
        <FieldGroup label="قيمة النقل (اختياري)" error={errors.transportCost?.message}>
          <Input type="number" step="0.01" dir="ltr" {...register("transportCost", { valueAsNumber: true })} />
        </FieldGroup>
        {materialsTotal > 0 && (
          <div className="rounded-lg border border-outline-variant bg-surface-container-low px-stack-md py-stack-sm text-body-sm flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">الخامة</span>
              <span dir="ltr" className="font-mono-data">{formatCurrency(materialsTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">النقل</span>
              <span dir="ltr" className="font-mono-data">{formatCurrency(transport)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-outline-variant pt-1">
              <span>المستحق للمورد عن العملية دي</span>
              <span dir="ltr" className="font-mono-data">{formatCurrency(materialsTotal + transport)}</span>
            </div>
            {transport > 0 && quantity > 0 && (
              <div className="flex justify-between text-xs text-on-surface-variant">
                <span>تكلفة الوحدة بالنقل</span>
                <span dir="ltr" className="font-mono-data">{formatCurrency((materialsTotal + transport) / quantity)}</span>
              </div>
            )}
            <p className="text-xs text-on-surface-variant">
              النقل بيتضاف على مستحق المورد ومش بيتخصم من الخزنة دلوقتي - بيتخصم مع دفعة المورد (كاش فورًا، أو الشيك لما يتصرف).
            </p>
          </div>
        )}
        <FieldGroup label="ملاحظات" error={errors.notes?.message}>
          <Input {...register("notes")} />
        </FieldGroup>
        <InvoiceAttachmentField folder="stock" value={attachment} onChange={setAttachment} />
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
