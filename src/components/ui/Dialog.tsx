"use client";

import { useEffect } from "react";
import { Icon } from "./Icon";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export function Dialog({ open, onClose, title, children, footer, maxWidth = "max-w-lg" }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-on-background/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-gutter">
        <div
          role="dialog"
          aria-modal="true"
          className={`w-full ${maxWidth} max-h-[90vh] flex flex-col bg-surface-container-lowest rounded-xl shadow-2xl`}
        >
          <header className="flex items-center justify-between px-stack-lg py-gutter border-b border-outline-variant shrink-0">
            <h2 className="text-title-sm text-on-surface">{title}</h2>
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface" aria-label="إغلاق">
              <Icon name="close" />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto px-stack-lg py-stack-lg space-y-stack-md">{children}</div>
          {footer && <footer className="px-stack-lg py-gutter border-t border-outline-variant flex justify-end gap-stack-md shrink-0">{footer}</footer>}
        </div>
      </div>
    </div>
  );
}
