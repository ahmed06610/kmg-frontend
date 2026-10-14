"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { resolveCheck } from "@/actions/suppliers";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input } from "@/components/ui/Field";
import { CheckResolutionAction } from "@/types/enums";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { SupplierPaymentDTO } from "@/types/supplier";

export function ResolveCheckDialog({ open, onClose, payment }: { open: boolean; onClose: () => void; payment: SupplierPaymentDTO | null }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newDueDate, setNewDueDate] = useState(formatDate(new Date()));

  if (!payment) return null;

  const run = async (action: number, extraDueDate?: string) => {
    setLoading(true);
    setServerError(null);
    const result = await resolveCheck({ paymentId: payment.id, action, newDueDate: extraDueDate }, payment.supplierId);
    setLoading(false);
    if (!result.success) {
      setServerError(result.message ?? "حدث خطأ");
      return;
    }
    onClose();
    router.refresh();
  };

  return (
    <Dialog open={open} onClose={onClose} title="تسوية شيك مستحق" maxWidth="max-w-md">
      <div className="flex flex-col gap-stack-md">
        <p className="text-body-sm text-on-surface">
          شيك المورد <span className="font-semibold">{payment.supplierName}</span> بقيمة{" "}
          <span dir="ltr" className="font-mono-data">{formatCurrency(payment.amountCash)}</span> مستحق بتاريخ {formatDate(payment.checkDueDate ?? payment.paymentDate)}. هل تم صرفه؟
        </p>

        <div className="flex flex-col gap-stack-sm">
          <Button type="button" disabled={loading} onClick={() => run(CheckResolutionAction.Clear)}>
            تم الصرف - خصم من الخزنة
          </Button>

          <div className="flex items-end gap-stack-sm">
            <FieldGroup label="تأجيل لتاريخ جديد">
              <Input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
            </FieldGroup>
            <Button type="button" variant="secondary" disabled={loading} onClick={() => run(CheckResolutionAction.Reschedule, newDueDate)}>
              تأجيل
            </Button>
          </div>

          <Button type="button" variant="danger" disabled={loading} onClick={() => run(CheckResolutionAction.Cancel)}>
            إلغاء الشيك (لا يُحتسب)
          </Button>
        </div>

        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </div>
    </Dialog>
  );
}
