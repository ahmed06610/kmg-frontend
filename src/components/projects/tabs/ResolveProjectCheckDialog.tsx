"use client";

import { useT } from "@/lib/i18n/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { resolveProjectCheck } from "@/actions/projects";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input } from "@/components/ui/Field";
import { CheckResolutionAction } from "@/types/enums";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ProjectPaymentDTO } from "@/types/project";

export function ResolveProjectCheckDialog({
  open,
  onClose,
  payment,
  projectId,
}: {
  open: boolean;
  onClose: () => void;
  payment: ProjectPaymentDTO | null;
  projectId: number;
}) {
  const t = useT();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newDueDate, setNewDueDate] = useState(formatDate(new Date()));

  if (!payment) return null;

  const run = async (action: number, extraDueDate?: string) => {
    setLoading(true);
    setServerError(null);
    const result = await resolveProjectCheck({ paymentId: payment.id, action, newDueDate: extraDueDate }, projectId);
    setLoading(false);
    if (!result.success) {
      setServerError(result.message ?? t("حدث خطأ"));
      return;
    }
    onClose();
    router.refresh();
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("تسوية شيك دفعة مشروع")} maxWidth="max-w-md">
      <div className="flex flex-col gap-stack-md">
        <p className="text-body-sm text-on-surface">
          {t("شيك بقيمة ")}<span dir="ltr" className="font-mono-data">{formatCurrency(payment.amountCash)}</span> {t(" مستحق بتاريخ")}{" "}
          {formatDate(payment.checkDueDate ?? payment.paymentDate)}{t(". هل تم تحصيله؟")}</p>

        <div className="flex flex-col gap-stack-sm">
          <Button type="button" disabled={loading} onClick={() => run(CheckResolutionAction.Clear)}>
            {t("تم التحصيل - إضافة للخزنة")}</Button>

          <div className="flex items-end gap-stack-sm">
            <FieldGroup label={t("تأجيل لتاريخ جديد")}>
              <Input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
            </FieldGroup>
            <Button type="button" variant="secondary" disabled={loading} onClick={() => run(CheckResolutionAction.Reschedule, newDueDate)}>
              {t("تأجيل")}</Button>
          </div>

          <Button type="button" variant="danger" disabled={loading} onClick={() => run(CheckResolutionAction.Cancel)}>
            {t("إلغاء الشيك (لا يُحتسب)")}</Button>
        </div>

        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{t(serverError)}</div>}
      </div>
    </Dialog>
  );
}
