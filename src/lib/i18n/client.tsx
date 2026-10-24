"use client";

import { createContext, useCallback, useContext } from "react";
import type { Locale } from "@/lib/preferences-shared";
import { setGlobalLocale } from "./global";
import { translate, type TFunction } from "./translate";

const LocaleContext = createContext<Locale>("ar");

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  setGlobalLocale(locale);
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useT(): TFunction {
  const locale = useContext(LocaleContext);
  return useCallback<TFunction>((text, vars) => translate(locale, text, vars), [locale]);
}

/** بيثبّت لغة معينة لجزء من الصفحة بس (زي الفاتورة المطبوعة اللي لازم تفضل عربي) من غير ما يغيّر لغة باقي الواجهة */
export function LocaleScope({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}
