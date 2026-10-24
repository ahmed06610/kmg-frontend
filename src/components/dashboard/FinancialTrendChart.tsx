"use client";

import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Chart } from "react-chartjs-2";
import { THEME_CHANGE_EVENT } from "@/components/layout/PreferenceToggles";
import { useLocale, useT } from "@/lib/i18n/client";
import { intlLocale } from "@/lib/i18n/global";
import type { MonthlyTrendDTO } from "@/types/dashboard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
);

interface ChartColors {
  primary: string;
  muted: string;
  success: string;
  surface: string;
  text: string;
  grid: string;
  tooltip: string;
}

// ألوان الرسم بتتقري من متغيرات الثيم (CSS) - عشان الرسم يمشي مع الوضع الفاتح والغامق
function readColors(): ChartColors {
  const style = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    primary: v("--color-primary", "#5b8def"),
    muted: v("--color-outline", "#4a5568"),
    success: v("--color-success", "#4ddb85"),
    surface: v("--color-surface", "#0b0f18"),
    text: v("--color-on-surface-variant", "#98a2b8"),
    grid: v("--color-outline-variant", "#2a3446"),
    tooltip: v("--color-inverse-surface", "#e6eaf3"),
  };
}

const DARK_DEFAULTS: ChartColors = {
  primary: "#5b8def",
  muted: "#4a5568",
  success: "#4ddb85",
  surface: "#0b0f18",
  text: "#98a2b8",
  grid: "#2a3446",
  tooltip: "#141b29",
};

// الباك اند بيرجع اسم الشهر بالعربي (وأحيانًا معاه السنة لو الفترة أكتر من سنة) - بنترجم اسم الشهر بس
function translateMonthLabel(label: string, t: (s: string) => string) {
  const [month, ...rest] = label.split(" ");
  return [t(month), ...rest].join(" ");
}

export function FinancialTrendChart({ data }: { data: MonthlyTrendDTO[] }) {
  const t = useT();
  const locale = useLocale();
  const [colors, setColors] = useState<ChartColors>(DARK_DEFAULTS);

  useEffect(() => {
    setColors(readColors());
    const onThemeChange = () => setColors(readColors());
    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
  }, []);

  const isRtl = locale === "ar";

  return (
    <Chart
      type="bar"
      data={{
        labels: data.map((d) => translateMonthLabel(d.monthLabel, t)),
        datasets: [
          {
            type: "bar" as const,
            label: t("الدخل"),
            data: data.map((d) => d.income),
            backgroundColor: colors.primary,
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.4,
          },
          {
            type: "bar" as const,
            label: t("المصروفات"),
            data: data.map((d) => d.expenses),
            backgroundColor: colors.muted,
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.4,
          },
          {
            type: "line" as const,
            label: t("صافي الربح"),
            data: data.map((d) => d.netProfit),
            borderColor: colors.success,
            backgroundColor: colors.success,
            borderWidth: 2,
            pointBackgroundColor: colors.surface,
            pointBorderColor: colors.success,
            pointBorderWidth: 2,
            pointRadius: 4,
            tension: 0.3,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            rtl: isRtl,
            backgroundColor: colors.tooltip,
            titleColor: colors.surface,
            bodyColor: colors.surface,
            titleFont: { size: 13, family: "IBM Plex Sans Arabic" },
            bodyFont: { size: 13, family: "JetBrains Mono" },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y ?? 0;
                return t("{0}: {1} ج.م", [context.dataset.label, new Intl.NumberFormat(intlLocale(locale)).format(value)]);
              },
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: colors.text } },
          y: {
            position: isRtl ? "right" : "left",
            grid: { color: colors.grid },
            ticks: {
              color: colors.text,
              callback: (value) => `${Number(value) / 1000}k`,
            },
          },
        },
      }}
    />
  );
}
