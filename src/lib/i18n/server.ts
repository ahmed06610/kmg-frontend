import "server-only";
import { getPreferences } from "@/lib/preferences";
import { translate, type TFunction } from "./translate";

/** نسخة السيرفر من useT - للـ Server Components والـ metadata */
export async function getT(): Promise<TFunction> {
  const { locale } = await getPreferences();
  return (text, vars) => translate(locale, text, vars);
}
