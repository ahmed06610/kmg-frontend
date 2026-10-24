import { DEFAULT_LOCALE, parseLocale, type Locale } from "@/lib/preferences-shared";
import { translate, type TranslateVars } from "./translate";

// لغة "حالية" على مستوى الموديول - للدوال المساعدة اللي برّه أي كومبوننت (تصدير Excel، تسميات...).
// في المتصفح بتتاخد من <html lang> اللي السيرفر حطها، وبيحدّثها I18nProvider.
let currentLocale: Locale =
  typeof document !== "undefined" ? parseLocale(document.documentElement.lang) : DEFAULT_LOCALE;

export function setGlobalLocale(locale: Locale) {
  currentLocale = locale;
}

export function getGlobalLocale(): Locale {
  return currentLocale;
}

/** ترجمة من غير hook - استخدمها بس برّه الكومبوننتات (جوه الكومبوننت استخدم useT) */
export function tr(text: string | null | undefined, vars?: TranslateVars): string {
  return translate(currentLocale, text, vars);
}

/** اسم الـ locale لـ Intl (التواريخ والأرقام) حسب لغة الواجهة */
export function intlLocale(locale: Locale = currentLocale): string {
  return locale === "en" ? "en-US" : "ar-EG";
}
