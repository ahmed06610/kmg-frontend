"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useLocale, useT } from "@/lib/i18n/client";
import { LOCALE_COOKIE, THEME_COOKIE, writePreferenceCookie, type Theme } from "@/lib/preferences-shared";
import { cn } from "@/lib/utils";

export const THEME_CHANGE_EVENT = "kmg-theme-change";

function currentTheme(): Theme {
  return typeof document !== "undefined" && document.documentElement.classList.contains("light") ? "light" : "dark";
}

/** تبديل الثيم فوري من غير reload: بنبدّل الكلاس على <html> والكوكي بيحفظ الاختيار للمرات الجاية */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useT();
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  const toggle = () => {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(next);
    root.style.colorScheme = next;
    writePreferenceCookie(THEME_COOKIE, next);
    setTheme(next);
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: next }));
  };

  const label = theme === "dark" ? t("الوضع الفاتح") : t("الوضع الغامق");
  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      className={cn(
        "flex items-center justify-center w-9 h-9 rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors",
        className,
      )}
    >
      <Icon name={theme === "dark" ? "light_mode" : "dark_mode"} size={20} />
    </button>
  );
}

/** تبديل اللغة: الاتجاه (RTL/LTR) واللغة بيتحددوا على السيرفر، فبنعمل reload بعد ما نحفظ الكوكي */
export function LanguageToggle({ className, showLabel = false }: { className?: string; showLabel?: boolean }) {
  const t = useT();
  const locale = useLocale();
  const next = locale === "ar" ? "en" : "ar";

  const toggle = () => {
    writePreferenceCookie(LOCALE_COOKIE, next);
    window.location.reload();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={t("تغيير اللغة")}
      aria-label={t("تغيير اللغة")}
      className={cn(
        "flex items-center justify-center gap-1.5 h-9 rounded-full border border-outline-variant px-3 text-body-sm font-semibold text-on-surface-variant hover:border-primary hover:text-primary transition-colors",
        className,
      )}
    >
      <Icon name="translate" size={18} />
      {/* بنكتب اسم اللغة التانية بلغتها هي، عشان اللي مش فاهم اللغة الحالية يلاقيها */}
      <span className={cn(!showLabel && "hidden sm:inline")}>{next === "en" ? "English" : "العربية"}</span>
      {/* في هيدر الموبايل المساحة ضيقة: اختصار بدل الاسم الكامل */}
      {!showLabel && <span className="sm:hidden">{next === "en" ? "EN" : "ع"}</span>}
    </button>
  );
}
