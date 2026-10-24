"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpButton } from "@/components/help/HelpDrawer";
import { Icon } from "@/components/ui/Icon";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { isNavItemActive, NAV_ITEMS } from "./nav-items";

/** قايمة صفحات السيستم (حسب صلاحيات المستخدم) مع زرار الشرح جنب كل صفحة - مشتركة بين السايد بار وقايمة الموبايل */
export function NavList({ abilities }: { abilities: string[] }) {
  const t = useT();
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => abilities.includes(item.ability));

  return (
    <nav className="flex-1 overflow-y-auto py-stack-md px-stack-md flex flex-col gap-1">
      {items.map((item) => {
        const active = isNavItemActive(item.href, pathname);
        return (
          <div
            key={item.href}
            className={cn(
              "group flex items-center rounded-lg transition-colors",
              active ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
            )}
          >
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn("flex-1 flex items-center gap-3 px-stack-md py-2.5 text-body-sm", active && "font-semibold")}
            >
              <Icon name={item.icon} filled={active} />
              {t(item.label)}
            </Link>
            <HelpButton
              href={item.href}
              label={t(item.label)}
              className={cn(
                "me-1.5",
                active ? "text-on-primary/80 hover:bg-on-primary/15 hover:text-on-primary" : "text-on-surface-variant/60 hover:bg-surface-container-highest hover:text-primary",
              )}
            />
          </div>
        );
      })}
    </nav>
  );
}
