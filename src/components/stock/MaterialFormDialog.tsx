"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createMaterial, updateMaterial } from "@/actions/stock";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input } from "@/components/ui/Field";
import { materialSchema, type MaterialFormValues } from "@/schema/stock";
import type { MaterialCategoryDTO, MaterialDTO } from "@/types/stock";

interface Props {
  open: boolean;
  onClose: () => void;
  material?: MaterialDTO;
  categories: MaterialCategoryDTO[];
}

export function MaterialFormDialog({ open, onClose, material, categories }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(material?.categoryId ?? null);
  const [extraFieldValues, setExtraFieldValues] = useState<Record<string, string>>(material?.extraFieldValues ?? {});
  const isEdit = !!material;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: material?.name ?? "",
      unit: material?.unit ?? "",
      unitPrice: material?.unitPrice ?? 0,
      minimumThreshold: material?.minimumThreshold ?? 0,
      initialQuantity: 0,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: material?.name ?? "",
        unit: material?.unit ?? "",
        unitPrice: material?.unitPrice ?? 0,
        minimumThreshold: material?.minimumThreshold ?? 0,
        initialQuantity: 0,
      });
      setCategoryId(material?.categoryId ?? null);
      setExtraFieldValues(material?.extraFieldValues ?? {});
      setServerError(null);
    }
  }, [open, material, reset]);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const onSubmit = async (data: MaterialFormValues) => {
    setLoading(true);
    setServerError(null);

    const result = isEdit
      ? await updateMaterial({
          id: material!.id,
          name: data.name,
          unit: data.unit,
          unitPrice: data.unitPrice,
          minimumThreshold: data.minimumThreshold,
          categoryId,
          extraFieldValues,
        })
      : await createMaterial({ ...data, categoryId, extraFieldValues });

    setLoading(false);
    if (!result.success) {
      setServerError(result.message ?? "حدث خطأ");
      return;
    }
    onClose();
    router.refresh();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "تعديل الخامة" : "خامة جديدة"}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="material-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </>
      }
    >
      <form id="material-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="اسم الخامة" error={errors.name?.message}>
          <Input {...register("name")} />
        </FieldGroup>
        <FieldGroup label="الوحدة (متر مربع، علبة، ...)" error={errors.unit?.message}>
          <Input {...register("unit")} />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label="سعر الوحدة" error={errors.unitPrice?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("unitPrice", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label="الحد الأدنى للتنبيه" error={errors.minimumThreshold?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("minimumThreshold", { valueAsNumber: true })} />
          </FieldGroup>
        </div>
        {!isEdit && (
          <FieldGroup label="الرصيد الافتتاحي (اختياري)" error={errors.initialQuantity?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("initialQuantity", { valueAsNumber: true })} />
          </FieldGroup>
        )}

        <FieldGroup label="النوع (اختياري)">
          <Combobox
            value={categoryId ? String(categoryId) : ""}
            onChange={(v) => {
              setCategoryId(v ? Number(v) : null);
              setExtraFieldValues({});
            }}
            placeholder="بدون نوع"
            options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
          />
        </FieldGroup>

        {selectedCategory && selectedCategory.extraFieldDefinitions.length > 0 && (
          <div className="grid grid-cols-2 gap-stack-md">
            {selectedCategory.extraFieldDefinitions.map((f) => (
              <FieldGroup key={f.key} label={f.label}>
                <Input
                  type={f.fieldType === "number" ? "number" : "text"}
                  value={extraFieldValues[f.key] ?? ""}
                  onChange={(e) => setExtraFieldValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                />
              </FieldGroup>
            ))}
          </div>
        )}

        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
