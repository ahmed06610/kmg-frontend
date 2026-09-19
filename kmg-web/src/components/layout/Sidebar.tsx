"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

export function Sidebar({ abilities }: { abilities: string[] }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => abilities.includes(item.ability));

  return (
    <aside className="hidden md:flex fixed right-0 top-0 h-full w-sidebar-width flex-col bg-surface-container-lowest border-l border-outline-variant z-20">
      <div className="flex items-center gap-2 px-stack-lg h-16 border-b border-outline-variant">
        <Image src="/logo-mark.png" alt="KMG" width={32} height={32} className="shrink-0 object-contain" />
        <div className="leading-tight">
          <p className="text-title-sm text-on-surface">KMG</p>
          <p className="text-xs text-on-surface-variant">نظام إدارة الأعمال</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-stack-md px-stack-md flex flex-col gap-1">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-stack-md py-2.5 text-body-sm transition-colors",
                active
                  ? "bg-primary text-on-primary font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
              )}
            >
              <Icon name={item.icon} filled={active} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-outline-variant p-stack-md">
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 rounded-lg px-stack-md py-2.5 text-body-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface w-full transition-colors"
          >
            <Icon name="logout" />
            تسجيل الخروج
          </button>
        </form>
      </div>
    </aside>
  );
}
