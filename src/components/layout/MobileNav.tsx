"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/actions/auth";
import { Icon } from "@/components/ui/Icon";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { isNavItemActive, NAV_ITEMS } from "./nav-items";
import { NavList } from "./NavList";
import { LanguageToggle, ThemeToggle } from "./PreferenceToggles";

const MAX_TABS = 4;

/**
 * شريط تابات ثابت تحت في شاشة الموبايل: أهم 4 صفحات مسموحة للمستخدم + "المزيد" اللي بيفتح
 * القايمة الكاملة (مع الشرح وتبديل اللغة والثيم وتسجيل الخروج). بيختفي من md وطالع (فيه السايد بار).
 */
export function MobileNav({ abilities, username, roleName }: { abilities: string[]; username: string; roleName: string }) {
  const t = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const allowed = NAV_ITEMS.filter((item) => abilities.includes(item.ability));
  const tabs = allowed.filter((item) => item.mobileTab).slice(0, MAX_TABS);
  const moreActive = !tabs.some((item) => isNavItemActive(item.href, pathname));

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    // منع سكرول الصفحة اللي ورا القايمة وهي مفتوحة
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <nav
        data-print-hide
        aria-label={t("التنقل الرئيسي")}
        className="md:hidden fixed inset-x-0 bottom-0 z-30 border-t border-outline-variant bg-surface-container-lowest/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="grid" style={{ gridTemplateColumns: `repeat(${tabs.length + 1}, minmax(0, 1fr))` }}>
          {tabs.map((item) => {
            const active = isNavItemActive(item.href, pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 h-16 text-[11px] font-semibold transition-colors",
                    active ? "text-primary" : "text-on-surface-variant",
                  )}
                >
                  <span className={cn("flex items-center justify-center w-14 h-7 rounded-full transition-colors", active && "bg-primary/15")}>
                    <Icon name={item.icon} filled={active} size={22} />
                  </span>
                  <span className="truncate max-w-full px-1">{t(item.shortLabel ?? item.label)}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              className={cn(
                "w-full flex flex-col items-center justify-center gap-0.5 h-16 text-[11px] font-semibold transition-colors",
                moreActive || open ? "text-primary" : "text-on-surface-variant",
              )}
            >
              <span className={cn("flex items-center justify-center w-14 h-7 rounded-full", (moreActive || open) && "bg-primary/15")}>
                <Icon name="menu" size={22} />
              </span>
              {t("المزيد")}
            </button>
          </li>
        </ul>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-on-background/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="sheet-up fixed inset-x-0 bottom-0 max-h-[85dvh] flex flex-col rounded-t-2xl bg-surface-container-lowest border-t border-outline-variant shadow-2xl pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-center pt-2">
              <span className="w-10 h-1 rounded-full bg-outline-variant" />
            </div>
            <div className="flex items-center justify-between gap-2 px-stack-lg py-stack-md border-b border-outline-variant">
              <div className="flex items-center gap-3 min-w-0">
                <Image src="/logo-mark.png" alt="KMG" width={32} height={32} className="shrink-0 object-contain" />
                <div className="leading-tight min-w-0">
                  <p className="text-title-sm text-on-surface truncate">{username}</p>
                  <p className="text-xs text-on-surface-variant truncate">{t(roleName)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-9 h-9 rounded-full text-on-surface-variant hover:bg-surface-container-high"
                aria-label={t("إغلاق")}
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-stack-lg py-stack-md border-b border-outline-variant">
              <LanguageToggle showLabel className="flex-1" />
              <ThemeToggle className="border border-outline-variant" />
            </div>

            <NavList abilities={abilities} />

            <div className="border-t border-outline-variant p-stack-md">
              <form action={logout}>
                <button
                  type="submit"
                  className="flex items-center gap-3 rounded-lg px-stack-md py-2.5 text-body-sm text-error hover:bg-error-container/40 w-full transition-colors"
                >
                  <Icon name="logout" className="rtl:-scale-x-100" />
                  {t("تسجيل الخروج")}
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
