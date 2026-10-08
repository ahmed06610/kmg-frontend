"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { findHelpForPath } from "@/lib/help-content";
import { HelpDrawer } from "./HelpDrawer";

/** زرار "شرح الصفحة" في التوب بار - بيفتح شرح الصفحة اللي المستخدم واقف عليها حاليًا (مفيد كمان على الموبايل) */
export function CurrentPageHelp() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const match = findHelpForPath(pathname);
  if (!match) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-outline-variant px-3 h-9 text-body-sm text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
        title={`شرح صفحة ${match.help.title}`}
      >
        <Icon name="help" size={18} />
        <span className="hidden sm:inline">شرح الصفحة</span>
      </button>
      <HelpDrawer href={match.href} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
