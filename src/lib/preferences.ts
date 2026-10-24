import "server-only";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, parseLocale, parseTheme, THEME_COOKIE, type Locale, type Theme } from "./preferences-shared";

export async function getPreferences(): Promise<{ theme: Theme; locale: Locale }> {
  const store = await cookies();
  return {
    theme: parseTheme(store.get(THEME_COOKIE)?.value),
    locale: parseLocale(store.get(LOCALE_COOKIE)?.value),
  };
}
