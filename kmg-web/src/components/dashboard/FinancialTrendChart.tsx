"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import type { MonthlyTrendDTO } from "@/types/dashboard";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

export function FinancialTrendChart({ data }: { data: MonthlyTrendDTO[] }) {
  return (
    <Chart
      type="bar"
      data={{
        labels: data.map((d) => d.monthLabel),
        datasets: [
          {
            type: "bar" as const,
            label: "الدخل",
            data: data.map((d) => d.income),
            backgroundColor: "#0f172a",
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.4,
          },
          {
            type: "bar" as const,
            label: "المصروفات",
            data: data.map((d) => d.expenses),
            backgroundColor: "#bec6e0",
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.4,
          },
          {
            type: "line" as const,
            label: "صافي الربح",
            data: data.map((d) => d.netProfit),
            borderColor: "#166534",
            backgroundColor: "#166534",
            borderWidth: 2,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#166534",
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
            rtl: true,
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            titleFont: { size: 13, family: "IBM Plex Sans Arabic" },
            bodyFont: { size: 13, family: "JetBrains Mono" },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y ?? 0;
                return `${context.dataset.label}: ${new Intl.NumberFormat("ar-EG").format(value)} ج.م`;
              },
            },
          },
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            position: "right",
            grid: { color: "#e6eeff" },
            ticks: {
              color: "#7c839b",
              callback: (value) => `${Number(value) / 1000}k`,
            },
          },
        },
      }}
    />
  );
}
