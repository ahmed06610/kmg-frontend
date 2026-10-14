"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { getMaterialPriceBatches, issueToProject, returnFromProject } from "@/actions/stock";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input } from "@/components/ui/Field";
import { InvoiceAttachmentField, type InvoiceAttachmentValue } from "@/components/ui/InvoiceAttachmentField";
import { formatMaterialLabel } from "@/lib/material-label";
import { formatCurrency, formatDate } from "@/lib/utils";
import { issueReturnSchema, type IssueReturnFormValues } from "@/schema/stock";
import type { MaterialCategoryDTO, MaterialDTO, StockPriceBatchDTO } from "@/types/stock";
import type { ProjectListDTO } from "@/types/project";

interface Props {
  open: boolean;
  onClose: () => void;
  mode: "issue" | "return";
  materials: MaterialDTO[];
  projects: ProjectListDTO[];
  categories: MaterialCategoryDTO[];
  defaultMaterialId?: number;
  defaultProjectId?: number;
}

export function IssueReturnDialog({ open, onClose, mode, materials, projects, categories, defaultMaterialId, defaultProjectId }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<InvoiceAttachmentValue | null>(null);
  const [batches, setBatches] = useState<StockPriceBatchDTO[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const isIssue = mode === "issue";

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IssueReturnFormValues>({
    resolver: zodResolver(issueReturnSchema),
    defaultValues: { materialId: defaultMaterialId ?? 0, projectId: defaultProjectId ?? 0, quantity: 0, unitPrice: undefined, notes: "" },
  });

  const materialId = watch("materialId");
  const selectedUnitPrice = watch("unitPrice");

  useEffect(() => {
    if (!isIssue || !materialId) {
      setBatches([]);
      return;
    }
    let cancelled = false;
    setBatchesLoading(true);
    setValue("unitPrice", undefined);
    getMaterialPriceBatches(materialId).then((result) => {
      if (cancelled) return;
      setBatchesLoading(false);
      if (result.success && result.data) setBatches(result.data);
      else setBatches([]);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIssue, materialId, open]);

  const onSubmit = async (data: IssueReturnFormValues) => {
    if (isIssue && !data.unitPrice) {
      setServerError("اختر سعر الدفعة المطلوب الصرف منها");
      return;
    }
    setLoading(true);
    setServerError(null);
    const result = isIssue
      ? await issueToProject({
          materialId: data.materialId,
          quantity: data.quantity,
          unitPrice: data.unitPrice!,
          projectId: data.projectId,
          notes: data.notes || null,
          attachmentUrl: attachment?.attachmentUrl ?? null,
          attachmentFileName: attachment?.attachmentFileName ?? null,
        })
      : await returnFromProject({
          materialId: data.materialId,
          quantity: data.quantity,
          projectId: data.projectId,
          notes: data.notes || null,
        });
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
      title={isIssue ? "صرف خامة لمشروع" : "مرتجع خامة من مشروع"}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="issue-return-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : isIssue ? "تسجيل الصرف" : "تسجيل المرتجع"}
          </Button>
        </>
      }
    >
      <form id="issue-return-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="الخامة" error={errors.materialId?.message}>
          <Controller
            name="materialId"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value ? String(field.value) : ""}
                onChange={(v) => field.onChange(Number(v))}
                disabled={!!defaultMaterialId}
                placeholder="اختر خامة"
                options={materials.map((m) => ({ value: String(m.id), label: formatMaterialLabel(m, categories), hint: `متاح: ${m.quantity}` }))}
              />
            )}
          />
        </FieldGroup>

        {isIssue && !!materialId && (
          <FieldGroup label="السعر (الدفعة المطلوب الصرف منها)">
            <Controller
              name="unitPrice"
              control={control}
              render={({ field }) => (
                <Combobox
                  value={field.value ? String(field.value) : ""}
                  onChange={(v) => field.onChange(Number(v))}
                  placeholder={batchesLoading ? "جاري التحميل..." : "اختر السعر"}
                  disabled={batchesLoading}
                  options={batches.map((b) => ({
                    value: String(b.unitPrice),
                    label: `${formatCurrency(b.unitPrice)} جنيه`,
                    hint: `متاح: ${b.availableQuantity} · أول شراء ${formatDate(b.firstPurchaseDate)}`,
                  }))}
                />
              )}
            />
            {!batchesLoading && batches.length === 0 && (
              <p className="text-xs text-error mt-1">لا يوجد رصيد متاح لهذه الخامة بأي سعر</p>
            )}
          </FieldGroup>
        )}

        <FieldGroup label="المشروع" error={errors.projectId?.message}>
          <Controller
            name="projectId"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value ? String(field.value) : ""}
                onChange={(v) => field.onChange(Number(v))}
                disabled={!!defaultProjectId}
                placeholder="اختر مشروع"
                options={projects.map((p) => ({ value: String(p.id), label: p.name }))}
              />
            )}
          />
        </FieldGroup>
        <FieldGroup label="الكمية" error={errors.quantity?.message}>
          <Input
            type="number"
            step="0.01"
            dir="ltr"
            {...register("quantity", { valueAsNumber: true })}
            max={isIssue ? batches.find((b) => b.unitPrice === selectedUnitPrice)?.availableQuantity : undefined}
          />
        </FieldGroup>
        <FieldGroup label="ملاحظات" error={errors.notes?.message}>
          <Input {...register("notes")} />
        </FieldGroup>
        {isIssue && <InvoiceAttachmentField folder="stock" value={attachment} onChange={setAttachment} />}
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
