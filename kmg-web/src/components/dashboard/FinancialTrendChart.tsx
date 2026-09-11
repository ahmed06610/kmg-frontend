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
import { Chart } from "react-chartjs-2";
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
            backgroundColor: "#5b8def",
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.4,
          },
          {
            type: "bar" as const,
            label: "المصروفات",
            data: data.map((d) => d.expenses),
            backgroundColor: "#4a5568",
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.4,
          },
          {
            type: "line" as const,
            label: "صافي الربح",
            data: data.map((d) => d.netProfit),
            borderColor: "#4ddb85",
            backgroundColor: "#4ddb85",
            borderWidth: 2,
            pointBackgroundColor: "#0b0f18",
            pointBorderColor: "#4ddb85",
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
            backgroundColor: "rgba(20, 27, 41, 0.95)",
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
          x: { grid: { display: false }, ticks: { color: "#98a2b8" } },
          y: {
            position: "right",
            grid: { color: "#2a3446" },
            ticks: {
              color: "#98a2b8",
              callback: (value) => `${Number(value) / 1000}k`,
            },
          },
        },
      }}
    />
  );
}
