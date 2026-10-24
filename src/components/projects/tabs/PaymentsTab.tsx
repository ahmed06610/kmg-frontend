"use client";

import { useT } from "@/lib/i18n/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { deleteProjectPayment, recordProjectPayment, updateProjectPayment } from "@/actions/projects";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldGroup, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { InvoiceAttachmentField, type InvoiceAttachmentValue } from "@/components/ui/InvoiceAttachmentField";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTableState } from "@/lib/useTableState";
import { projectPaymentSchema, type ProjectPaymentFormValues } from "@/schema/project";
import { checkStatusLabels } from "@/types/enums";
import type { ProjectPaymentDTO } from "@/types/project";
import { ResolveProjectCheckDialog } from "./ResolveProjectCheckDialog";

const checkStatusTone: Record<string, "warning" | "success" | "neutral"> = {
  Pending: "warning",
  Cleared: "success",
  Cancelled: "neutral",
};

export function PaymentsTab({ projectId, payments, remainingBalance, canManage }: { projectId: number; payments: ProjectPaymentDTO[]; remainingBalance: number; canManage: boolean }) {
  const t = useT();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<ProjectPaymentDTO | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<ProjectPaymentDTO | null>(null);
  const [resolvingPayment, setResolvingPayment] = useState<ProjectPaymentDTO | null>(null);

  const table = useTableState({
    rows: payments,
    pageSize: 10,
    searchPredicate: (p, term) => (p.notes ?? "").toLowerCase().includes(term) || String(p.amount).includes(term),
  });

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex items-center justify-between flex-wrap gap-stack-sm">
        <p className="text-body-sm text-on-surface-variant">
          {t("المتبقي حاليًا: ")}<span dir="ltr" className="font-mono-data text-on-surface font-semibold">{formatCurrency(remainingBalance)}</span>
        </p>
        {canManage && remainingBalance > 0 && (
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Icon name="add" size={18} />
            {t("تسجيل دفعة")}</Button>
        )}
      </div>

      {payments.length > 0 && <SearchInput value={table.search} onChange={table.setSearch} placeholder={t("بحث بالملاحظات أو المبلغ...")} />}

      {payments.length === 0 ? (
        <EmptyState icon="payments" title={t("لا توجد دفعات مسجلة بعد")} />
      ) : table.totalCount === 0 ? (
        <EmptyState icon="search_off" title={t("لا توجد نتائج مطابقة")} />
      ) : (
        <>
        <Table>
          <THead>
            <tr>
              <Th>{t("المبلغ")}</Th>
              <Th>{t("الطريقة")}</Th>
              <Th>{t("كاش")}</Th>
              <Th>{t("كريديت")}</Th>
              <Th>{t("التاريخ")}</Th>
              <Th>{t("ملاحظات")}</Th>
              {canManage && <Th>{t("إجراءات")}</Th>}
            </tr>
          </THead>
          <TBody>
            {table.pageRows.map((p) => (
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
                {/* الشيك بيتسجل في الخزنة على رصيد الكريديت لما يتصرف، فبيظهر في عمود الكريديت */}
                <TdMono>{p.isCheck ? "-" : formatCurrency(p.amountCash)}</TdMono>
                <TdMono>{formatCurrency(p.isCheck ? p.amount : p.amountCredit)}</TdMono>
                <Td>{formatDate(p.paymentDate)}</Td>
                <Td>{p.notes ?? "-"}</Td>
                {canManage && (
                  <Td>
                    <div className="flex items-center gap-1">
                      {p.isCheck && p.checkStatus === "Pending" && (
                        <button className="text-warning hover:opacity-80" title={t("تسوية الشيك")} onClick={() => setResolvingPayment(p)}>
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
        <Pagination page={table.page} pageSize={table.pageSize} totalCount={table.totalCount} onPageChange={table.setPage} />
        </>
      )}

      <PaymentDialog open={dialogOpen} onClose={() => setDialogOpen(false)} projectId={projectId} remainingBalance={remainingBalance} />
      <PaymentDialog
        open={!!editingPayment}
        onClose={() => setEditingPayment(null)}
        projectId={projectId}
        remainingBalance={remainingBalance + (editingPayment?.amount ?? 0)}
        payment={editingPayment ?? undefined}
      />
      <ConfirmDialog
        open={!!deletingPayment}
        onClose={() => setDeletingPayment(null)}
        title={t("حذف الدفعة")}
        message={t("هل أنت متأكد من حذف هذه الدفعة؟ سيتم إلغاء أثرها في الخزنة.")}
        onConfirm={() => deleteProjectPayment(deletingPayment!.id, projectId)}
        onConfirmed={() => router.refresh()}
      />
      <ResolveProjectCheckDialog open={!!resolvingPayment} onClose={() => setResolvingPayment(null)} payment={resolvingPayment} projectId={projectId} />
    </div>
  );
}

function PaymentDialog({
  open,
  onClose,
  projectId,
  remainingBalance,
  payment,
}: {
  open: boolean;
  onClose: () => void;
  projectId: number;
  remainingBalance: number;
  payment?: ProjectPaymentDTO;
}) {
  const t = useT();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<InvoiceAttachmentValue | null>(null);
  const isEdit = !!payment;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProjectPaymentFormValues>({
    resolver: zodResolver(projectPaymentSchema),
    defaultValues: { amountCash: 0, amountCredit: 0, paymentDate: formatDate(new Date()), notes: "", isCheck: false, checkDueDate: "" },
  });

  useEffect(() => {
    if (open) {
      reset({
        amountCash: payment?.amountCash ?? 0,
        amountCredit: payment?.amountCredit ?? 0,
        paymentDate: payment ? payment.paymentDate.slice(0, 10) : formatDate(new Date()),
        notes: payment?.notes ?? "",
        isCheck: payment?.isCheck ?? false,
        checkDueDate: payment?.checkDueDate ? payment.checkDueDate.slice(0, 10) : "",
      });
      setAttachment(
        payment?.attachmentUrl ? { attachmentUrl: payment.attachmentUrl, attachmentFileName: payment.attachmentFileName ?? payment.attachmentUrl } : null,
      );
      setServerError(null);
    }
  }, [open, payment, reset]);

  const isCheck = watch("isCheck");

  const onSubmit = async (data: ProjectPaymentFormValues) => {
    setLoading(true);
    setServerError(null);
    const payload = {
      amountCash: data.amountCash,
      amountCredit: data.isCheck ? 0 : data.amountCredit,
      paymentDate: data.paymentDate,
      notes: data.notes || null,
      attachmentUrl: attachment?.attachmentUrl ?? null,
      attachmentFileName: attachment?.attachmentFileName ?? null,
      isCheck: data.isCheck,
      checkDueDate: data.isCheck ? data.checkDueDate || null : null,
    };
    const result = isEdit
      ? await updateProjectPayment({ id: payment!.id, ...payload }, projectId)
      : await recordProjectPayment({ projectId, ...payload });
    setLoading(false);
    if (!result.success) {
      setServerError(result.message ?? t("حدث خطأ"));
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
      title={isEdit ? t("تعديل دفعة من العميل") : t("تسجيل دفعة من العميل")}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t("إلغاء")}</Button>
          <Button type="submit" form="project-payment-form" disabled={loading}>
            {loading ? t("جاري الحفظ...") : t("حفظ")}
          </Button>
        </>
      }
    >
      <p className="text-body-sm text-on-surface-variant">
        {t("المتبقي: ")}<span dir="ltr" className="font-mono-data text-on-surface">{remainingBalance.toFixed(2)}</span>
      </p>
      <form id="project-payment-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <label className="flex items-center gap-2 text-body-sm text-on-surface">
          <input type="checkbox" {...register("isCheck")} />
          {t("دفعة بشيك")}</label>

        {isCheck ? (
          <FieldGroup label={t("قيمة الشيك")} error={errors.amountCash?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("amountCash", { valueAsNumber: true })} />
          </FieldGroup>
        ) : (
          <div className="grid grid-cols-2 gap-stack-md">
            <FieldGroup label={t("المبلغ كاش")} error={errors.amountCash?.message}>
              <Input type="number" step="0.01" dir="ltr" {...register("amountCash", { valueAsNumber: true })} />
            </FieldGroup>
            <FieldGroup label={t("المبلغ كريديت")} error={errors.amountCredit?.message}>
              <Input type="number" step="0.01" dir="ltr" {...register("amountCredit", { valueAsNumber: true })} />
            </FieldGroup>
          </div>
        )}

        {isCheck && (
          <FieldGroup label={t("تاريخ استحقاق الشيك")} error={errors.checkDueDate?.message}>
            <Input type="date" {...register("checkDueDate")} />
          </FieldGroup>
        )}

        <FieldGroup label={t("تاريخ الدفعة")} error={errors.paymentDate?.message}>
          <Input type="date" {...register("paymentDate")} />
        </FieldGroup>
        <FieldGroup label={t("ملاحظات")} error={errors.notes?.message}>
          <Input {...register("notes")} />
        </FieldGroup>
        <InvoiceAttachmentField folder="projects" value={attachment} onChange={setAttachment} />
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{t(serverError)}</div>}
      </form>
    </Dialog>
  );
}
