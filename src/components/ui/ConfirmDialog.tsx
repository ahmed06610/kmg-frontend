"use client";

import { useState } from "react";
import { Button } from "./Button";
import { Dialog } from "./Dialog";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => Promise<{ success: boolean; message?: string }>;
  onConfirmed?: () => void;
}

export function ConfirmDialog({ open, onClose, title, message, confirmLabel = "حذف", onConfirm, onConfirmed }: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setServerError(null);
    const result = await onConfirm();
    setLoading(false);
    if (!result.success) {
      setServerError(result.message ?? "حدث خطأ");
      return;
    }
    onClose();
    onConfirmed?.();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="max-w-sm"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button variant="danger" type="button" onClick={handleConfirm} disabled={loading}>
            {loading ? "جاري الحذف..." : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-body-sm text-on-surface">{message}</p>
      {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
    </Dialog>
  );
}
