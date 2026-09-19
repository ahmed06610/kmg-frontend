"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { deleteProjectPayment, recordProjectPayment, updateProjectPayment } from "@/actions/projects";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldGroup, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTableState } from "@/lib/useTableState";
import { projectPaymentSchema, type ProjectPaymentFormValues } from "@/schema/project";
import type { ProjectPaymentDTO } from "@/types/project";

export function PaymentsTab({ projectId, payments, remainingBalance, canManage }: { projectId: number; payments: ProjectPaymentDTO[]; remainingBalance: number; canManage: boolean }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<ProjectPaymentDTO | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<ProjectPaymentDTO | null>(null);

  const table = useTableState({
    rows: payments,
    pageSize: 10,
    searchPredicate: (p, term) => (p.notes ?? "").toLowerCase().includes(term) || String(p.amount).includes(term),
  });

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex items-center justify-between flex-wrap gap-stack-sm">
        <p className="text-body-sm text-on-surface-variant">
          المتبقي حاليًا: <span dir="ltr" className="font-mono-data text-on-surface font-semibold">{formatCurrency(remainingBalance)}</span>
        </p>
        {canManage && remainingBalance > 0 && (
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Icon name="add" size={18} />
            تسجيل دفعة
          </Button>
        )}
      </div>

      {payments.length > 0 && <SearchInput value={table.search} onChange={table.setSearch} placeholder="بحث بالملاحظات أو المبلغ..." />}

      {payments.length === 0 ? (
        <EmptyState icon="payments" title="لا توجد دفعات مسجلة بعد" />
      ) : table.totalCount === 0 ? (
        <EmptyState icon="search_off" title="لا توجد نتائج مطابقة" />
      ) : (
        <>
        <Table>
          <THead>
            <tr>
              <Th>المبلغ</Th>
              <Th>كاش</Th>
              <Th>كريديت</Th>
              <Th>التاريخ</Th>
              <Th>ملاحظات</Th>
              {canManage && <Th>إجراءات</Th>}
            </tr>
          </THead>
          <TBody>
            {table.pageRows.map((p) => (
              <Tr key={p.id}>
                <TdMono>{formatCurrency(p.amount)}</TdMono>
                <TdMono>{formatCurrency(p.amountCash)}</TdMono>
                <TdMono>{formatCurrency(p.amountCredit)}</TdMono>
                <Td>{formatDate(p.paymentDate)}</Td>
                <Td>{p.notes ?? "-"}</Td>
                {canManage && (
                  <Td>
                    <div className="flex items-center gap-1">
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
        title="حذف الدفعة"
        message="هل أنت متأكد من حذف هذه الدفعة؟ سيتم إلغاء أثرها في الخزنة."
        onConfirm={() => deleteProjectPayment(deletingPayment!.id, projectId)}
        onConfirmed={() => router.refresh()}
      />
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
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!payment;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectPaymentFormValues>({
    resolver: zodResolver(projectPaymentSchema),
    defaultValues: { amountCash: 0, amountCredit: 0, paymentDate: formatDate(new Date()), notes: "" },
  });

  useEffect(() => {
    if (open) {
      reset({
        amountCash: payment?.amountCash ?? 0,
        amountCredit: payment?.amountCredit ?? 0,
        paymentDate: payment ? payment.paymentDate.slice(0, 10) : formatDate(new Date()),
        notes: payment?.notes ?? "",
      });
      setServerError(null);
    }
  }, [open, payment, reset]);

  const onSubmit = async (data: ProjectPaymentFormValues) => {
    setLoading(true);
    setServerError(null);
    const payload = { ...data, notes: data.notes || null };
    const result = isEdit
      ? await updateProjectPayment({ id: payment!.id, ...payload }, projectId)
      : await recordProjectPayment({ projectId, ...payload });
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
      title={isEdit ? "تعديل دفعة من العميل" : "تسجيل دفعة من العميل"}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="project-payment-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </>
      }
    >
      <p className="text-body-sm text-on-surface-variant">
        المتبقي: <span dir="ltr" className="font-mono-data text-on-surface">{remainingBalance.toFixed(2)}</span>
      </p>
      <form id="project-payment-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label="المبلغ كاش" error={errors.amountCash?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("amountCash", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label="المبلغ كريديت" error={errors.amountCredit?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("amountCredit", { valueAsNumber: true })} />
          </FieldGroup>
        </div>
        <FieldGroup label="تاريخ الدفعة" error={errors.paymentDate?.message}>
          <Input type="date" {...register("paymentDate")} />
        </FieldGroup>
        <FieldGroup label="ملاحظات" error={errors.notes?.message}>
          <Input {...register("notes")} />
        </FieldGroup>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
