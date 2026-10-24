import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// أحجام الخط المخصصة في globals.css (text-title-sm، text-body-sm...) - لازم tailwind-merge يعرف إنها
// أحجام خط مش ألوان، وإلا بيعتبرها بتتعارض مع text-on-primary وأخواتها ويشيل اللون
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display-lg", "headline-md", "title-sm", "title-md", "body-md", "body-sm", "label-caps", "mono-data"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-CA").format(date); // YYYY-MM-DD
}
