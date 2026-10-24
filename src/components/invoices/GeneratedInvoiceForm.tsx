"use client";

import { useT } from "@/lib/i18n/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { createGeneratedInvoiceAndRedirect } from "@/actions/invoices";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Combobox } from "@/components/ui/Combobox";
import { FieldGroup, Input, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { formatCurrency, formatDate } from "@/lib/utils";
import { generatedInvoiceSchema, type GeneratedInvoiceFormValues } from "@/schema/invoice";
import type { ClientListDTO } from "@/types/client";
import type { ProjectListDTO } from "@/types/project";

export function GeneratedInvoiceForm({ projects, clients }: { projects: ProjectListDTO[]; clients: ClientListDTO[] }) {
  const t = useT();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GeneratedInvoiceFormValues>({
    resolver: zodResolver(generatedInvoiceSchema),
    defaultValues: {
      title: "",
      issueDate: formatDate(new Date()),
      dueDate: "",
      recipientName: "",
      recipientAddress: "",
      recipientPhone: "",
      notes: "",
      creatorDisplayName: "",
      showCreatorName: false,
      showSignature: false,
      lineItems: [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lineItems" });
  const lineItems = watch("lineItems");
  const taxPercent = watch("taxPercent");
  const showCreatorName = watch("showCreatorName");

  const subtotal = lineItems.reduce((sum, li) => sum + (li.quantity || 0) * (li.unitPrice || 0), 0);
  const taxAmount = taxPercent ? subtotal * (taxPercent / 100) : 0;
  const total = subtotal + taxAmount;

  function applyClient(clientId: string) {
    const client = clients.find((c) => String(c.id) === clientId);
    if (!client) return;
    setValue("recipientName", client.name);
    if (client.phone) setValue("recipientPhone", client.phone);
  }

  const onSubmit = async (data: GeneratedInvoiceFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await createGeneratedInvoiceAndRedirect({
      title: data.title || null,
      issueDate: data.issueDate,
      dueDate: data.dueDate || null,
      recipientName: data.recipientName,
      recipientAddress: data.recipientAddress || null,
      recipientPhone: data.recipientPhone || null,
      projectId: data.projectId || null,
      notes: data.notes || null,
      taxPercent: data.taxPercent || null,
      creatorDisplayName: data.creatorDisplayName || null,
      showCreatorName: data.showCreatorName,
      showSignature: data.showSignature,
      lineItems: data.lineItems,
    });
    setLoading(false);
    if (result && !result.success) {
      setServerError(result.message ?? t("حدث خطأ"));
    }
  };

  return (
    <div className="flex flex-col gap-stack-lg max-w-3xl">
      <div>
        <h1 className="text-headline-md text-on-surface">{t("فاتورة إلكترونية جديدة")}</h1>
        <p className="text-body-sm text-on-surface-variant">{t("هتتحفظ برقم تسلسلي تلقائي، وتقدر تطبعها أو تحفظها PDF بعد الإنشاء")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-lg">
        <Card>
          <CardHeader>
            <CardTitle>{t("بيانات المستلم")}</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-stack-md">
            {clients.length > 0 && (
              <FieldGroup label={t("اختيار من العملاء الحاليين (اختياري)")}>
                <Combobox
                  value=""
                  onChange={applyClient}
                  placeholder={t("اختر عميل لتعبئة بياناته تلقائيًا")}
                  options={clients.map((c) => ({ value: String(c.id), label: c.name, hint: c.phone ?? undefined }))}
                />
              </FieldGroup>
            )}
            <FieldGroup label={t("اسم المستلم")} error={errors.recipientName?.message}>
              <Input {...register("recipientName")} />
            </FieldGroup>
            <div className="grid grid-cols-2 gap-stack-md">
              <FieldGroup label={t("الهاتف")} error={errors.recipientPhone?.message}>
                <Input dir="ltr" {...register("recipientPhone")} />
              </FieldGroup>
              <FieldGroup label={t("العنوان")} error={errors.recipientAddress?.message}>
                <Input {...register("recipientAddress")} />
              </FieldGroup>
            </div>
            <FieldGroup label={t("ربط بمشروع (اختياري)")}>
              <Controller
                name="projectId"
                control={control}
                render={({ field }) => (
                  <Combobox
                    value={field.value ? String(field.value) : ""}
                    onChange={(v) => field.onChange(v ? Number(v) : undefined)}
                    placeholder={t("بدون ربط بمشروع")}
                    options={projects.map((p) => ({ value: String(p.id), label: `${p.name} (${p.projectCode})` }))}
                  />
                )}
              />
            </FieldGroup>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("بيانات الفاتورة")}</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-stack-md">
            <FieldGroup label={t("عنوان الفاتورة (اختياري)")} error={errors.title?.message}>
              <Input {...register("title")} placeholder={t("مثال: فاتورة توريد وتركيب كلادينج")} />
            </FieldGroup>
            <div className="grid grid-cols-2 gap-stack-md">
              <FieldGroup label={t("تاريخ الإصدار")} error={errors.issueDate?.message}>
                <Input type="date" {...register("issueDate")} />
              </FieldGroup>
              <FieldGroup label={t("تاريخ الاستحقاق (اختياري)")} error={errors.dueDate?.message}>
                <Input type="date" {...register("dueDate")} />
              </FieldGroup>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("منشئ الفاتورة والتوقيع")}</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-stack-md">
            <div className="flex items-center gap-stack-md">
              <div className="flex-1">
                <FieldGroup label={t("اسم منشئ الفاتورة (اختياري)")} error={errors.creatorDisplayName?.message}>
                  <Input {...register("creatorDisplayName")} placeholder={t("الاسم اللي يظهر على الفاتورة")} />
                </FieldGroup>
              </div>
              <label className="flex items-center gap-2 text-body-sm text-on-surface shrink-0 pt-6">
                <input type="checkbox" {...register("showCreatorName")} />
                {t("إظهار الاسم في الفاتورة")}</label>
            </div>
            {showCreatorName && !watch("creatorDisplayName") && (
              <p className="text-xs text-warning">{t("اكتب الاسم اللي عاوز يظهر، وإلا الحقل هيظهر فاضي في الفاتورة")}</p>
            )}
            <label className="flex items-center gap-2 text-body-sm text-on-surface">
              <input type="checkbox" {...register("showSignature")} />
              {t("إضافة خانة توقيع أسفل الفاتورة")}</label>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("البنود")}</CardTitle>
            <Button type="button" size="sm" variant="secondary" onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}>
              <Icon name="add" size={16} />
              {t("إضافة بند")}</Button>
          </CardHeader>
          <div className="flex flex-col gap-stack-sm">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_90px_110px_auto] gap-stack-sm items-start">
                <FieldGroup label={index === 0 ? t("الوصف") : ""} error={errors.lineItems?.[index]?.description?.message}>
                  <Input {...register(`lineItems.${index}.description`)} placeholder={t("وصف البند")} />
                </FieldGroup>
                <FieldGroup label={index === 0 ? t("الكمية") : ""} error={errors.lineItems?.[index]?.quantity?.message}>
                  <Input type="number" step="0.01" dir="ltr" {...register(`lineItems.${index}.quantity`, { valueAsNumber: true })} />
                </FieldGroup>
                <FieldGroup label={index === 0 ? t("سعر الوحدة") : ""} error={errors.lineItems?.[index]?.unitPrice?.message}>
                  <Input type="number" step="0.01" dir="ltr" {...register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })} />
                </FieldGroup>
                <div className={index === 0 ? "pt-7" : ""}>
                  <button
                    type="button"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    className="text-error hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed p-2"
                    title={t("حذف البند")}
                  >
                    <Icon name="delete" size={18} />
                  </button>
                </div>
              </div>
            ))}
            {errors.lineItems?.message && <p className="text-error text-xs">{errors.lineItems.message}</p>}
          </div>

          <div className="mt-stack-lg border-t border-outline-variant pt-stack-md flex flex-col gap-2 items-end">
            <div className="w-full max-w-xs flex flex-col gap-stack-sm">
              <FieldGroup label={t("نسبة الضريبة % (اختياري)")}>
                <Input type="number" step="0.01" dir="ltr" {...register("taxPercent", { valueAsNumber: true })} />
              </FieldGroup>
              <div className="flex justify-between text-body-sm text-on-surface-variant">
                <span>{t("الإجمالي قبل الضريبة")}</span>
                <span dir="ltr" className="font-mono-data">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-body-sm text-on-surface-variant">
                <span>{t("الضريبة")}</span>
                <span dir="ltr" className="font-mono-data">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-title-sm text-on-surface font-semibold border-t border-outline-variant pt-2">
                <span>{t("الإجمالي")}</span>
                <span dir="ltr" className="font-mono-data">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("ملاحظات")}</CardTitle>
          </CardHeader>
          <Textarea rows={3} {...register("notes")} placeholder={t("شروط الدفع، تفاصيل إضافية...")} />
        </Card>

        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{t(serverError)}</div>}

        <div className="flex items-center gap-stack-sm justify-end">
          <Button variant="secondary" type="button" onClick={() => router.push("/invoices")}>
            {t("إلغاء")}</Button>
          <Button type="submit" disabled={loading}>
            {loading ? t("جاري الإنشاء...") : t("إنشاء الفاتورة")}
          </Button>
        </div>
      </form>
    </div>
  );
}
