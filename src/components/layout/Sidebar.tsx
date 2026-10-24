"use client";

import Image from "next/image";
import { logout } from "@/actions/auth";
import { Icon } from "@/components/ui/Icon";
import { useT } from "@/lib/i18n/client";
import { NavList } from "./NavList";

export function Sidebar({ abilities }: { abilities: string[] }) {
  const t = useT();

  return (
    <aside
      data-print-hide
      className="hidden md:flex fixed start-0 top-0 h-full w-sidebar-width flex-col bg-surface-container-lowest border-e border-outline-variant z-20"
    >
      <div className="flex items-center gap-2 px-stack-lg h-16 border-b border-outline-variant">
        <Image src="/logo-mark.png" alt="KMG" width={32} height={32} className="shrink-0 object-contain" />
        <div className="leading-tight">
          <p className="text-title-sm text-on-surface">KMG</p>
          <p className="text-xs text-on-surface-variant">{t("نظام إدارة الأعمال")}</p>
        </div>
      </div>

      <NavList abilities={abilities} />

      <div className="border-t border-outline-variant p-stack-md">
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 rounded-lg px-stack-md py-2.5 text-body-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface w-full transition-colors"
          >
            <Icon name="logout" className="rtl:-scale-x-100" />
            {t("تسجيل الخروج")}
          </button>
        </form>
      </div>
    </aside>
  );
}
