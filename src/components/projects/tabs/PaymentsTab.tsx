"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { recordProjectPayment } from "@/actions/projects";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldGroup, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { projectPaymentSchema, type ProjectPaymentFormValues } from "@/schema/project";
import type { ProjectPaymentDTO } from "@/types/project";

export function PaymentsTab({ projectId, payments, remainingBalance, canManage }: { projectId: number; payments: ProjectPaymentDTO[]; remainingBalance: number; canManage: boolean }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex items-center justify-between">
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

      {payments.length === 0 ? (
        <EmptyState icon="payments" title="لا توجد دفعات مسجلة بعد" />
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
            {payments.map((p) => (
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

      <RecordPaymentDialog open={dialogOpen} onClose={() => setDialogOpen(false)} projectId={projectId} remainingBalance={remainingBalance} />
    </div>
  );
}

function RecordPaymentDialog({ open, onClose, projectId, remainingBalance }: { open: boolean; onClose: () => void; projectId: number; remainingBalance: number }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectPaymentFormValues>({
    resolver: zodResolver(projectPaymentSchema),
    defaultValues: { amountCash: 0, amountCredit: 0, paymentDate: formatDate(new Date()), notes: "" },
  });

  const onSubmit = async (data: ProjectPaymentFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await recordProjectPayment({ projectId, ...data, notes: data.notes || null });
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
      title="تسجيل دفعة من العميل"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="project-payment-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "تسجيل الدفعة"}
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
