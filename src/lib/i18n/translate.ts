import type { Locale } from "@/lib/preferences-shared";
import { en } from "./en";

export type TranslateVars = ReadonlyArray<string | number | null | undefined>;
export type TFunction = (text: string | null | undefined, vars?: TranslateVars) => string;

const normalize = (s: string) => s.trim().replace(/\s+/g, " ");

function fill(text: string, vars?: TranslateVars) {
  if (!vars || vars.length === 0) return text;
  return text.replace(/\{(\d+)\}/g, (match, i) => {
    const v = vars[Number(i)];
    return v === undefined || v === null ? "" : String(v);
  });
}

/**
 * النص العربي نفسه هو مفتاح الترجمة. في العربي بيرجع زي ما هو، وفي الإنجليزي بيدور عليه في القاموس -
 * ولو مش موجود (رسالة جاية من الباك اند مثلًا) بيرجع العربي بدل ما يكسر. المسافات اللي في الأول والآخر
 * بتتحفظ عشان النصوص المقطعة جوه JSX (زي "المتبقي: " قبل رقم) تفضل متباعدة صح.
 */
export function translate(locale: Locale, text: string | null | undefined, vars?: TranslateVars): string {
  if (text === null || text === undefined) return "";
  if (locale === "ar") return fill(text, vars);

  const key = normalize(text);
  const hit = en[key];
  if (hit === undefined) return fill(text, vars);

  const lead = text.match(/^\s*/)?.[0] ?? "";
  const trail = text.match(/\s*$/)?.[0] ?? "";
  return lead + fill(hit, vars) + trail;
}
