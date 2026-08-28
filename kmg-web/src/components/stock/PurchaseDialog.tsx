"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { recordPurchase } from "@/actions/stock";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input } from "@/components/ui/Field";
import { formatCurrency } from "@/lib/utils";
import { purchaseSchema, type PurchaseFormValues } from "@/schema/stock";
import type { MaterialDTO } from "@/types/stock";
import type { SupplierListDTO } from "@/types/supplier";

export function PurchaseDialog({
  open,
  onClose,
  materials,
  suppliers,
  defaultMaterialId,
}: {
  open: boolean;
  onClose: () => void;
  materials: MaterialDTO[];
  suppliers: SupplierListDTO[];
  defaultMaterialId?: number;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    defaultValues: { materialId: defaultMaterialId ?? 0, supplierId: 0, quantity: 0, unitPrice: 0, notes: "" },
  });

  const selectedMaterialId = watch("materialId");
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  const onSubmit = async (data: PurchaseFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await recordPurchase({ ...data, notes: data.notes || null });
    setLoading(false);
    if (!result.success) {
      setServerError(result.message ?? "حدث خطأ");
      return;
    }
    reset();
    onClose();
    router.refresh();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="تسجيل شراء خامة"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="purchase-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "تسجيل الشراء"}
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
                disabled={!!defaultMaterialId}
                placeholder="اختر خامة"
                options={materials.map((m) => ({ value: String(m.id), label: m.name, hint: `متاح: ${m.quantity}` }))}
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
        <FieldGroup label="ملاحظات" error={errors.notes?.message}>
          <Input {...register("notes")} />
        </FieldGroup>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
