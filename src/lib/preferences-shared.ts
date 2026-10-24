// تفضيلات العرض (الثيم واللغة) - محفوظة في كوكيز عشان السيرفر يرسم الصفحة صح من أول طلب من غير وميض
export type Theme = "dark" | "light";
export type Locale = "ar" | "en";

export const THEME_COOKIE = "kmg_theme";
export const LOCALE_COOKIE = "kmg_locale";

export const DEFAULT_THEME: Theme = "dark";
export const DEFAULT_LOCALE: Locale = "ar";

export function parseTheme(value: string | undefined | null): Theme {
  return value === "light" ? "light" : "dark";
}

export function parseLocale(value: string | undefined | null): Locale {
  return value === "en" ? "en" : "ar";
}

export function directionOf(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** بيحفظ التفضيل في كوكي لمدة سنة (من الكلاينت) */
export function writePreferenceCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}
