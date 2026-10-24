"use client";

import { useT } from "@/lib/i18n/client";
import { Icon } from "@/components/ui/Icon";
import { formatCurrency } from "@/lib/utils";
import type { DashboardDTO } from "@/types/dashboard";

interface Alert {
  icon: string;
  title: string;
  description: string;
  tone: "warning" | "error" | "neutral";
}

const toneClasses: Record<Alert["tone"], { border: string; bg: string; icon: string; title: string }> = {
  warning: { border: "border-warning/30", bg: "bg-warning-container/40", icon: "text-warning", title: "text-warning" },
  error: { border: "border-error-container", bg: "bg-error-container/30", icon: "text-error", title: "text-error" },
  neutral: { border: "border-outline-variant", bg: "bg-surface", icon: "text-secondary", title: "text-secondary" },
};

export function AttentionCenter({ dashboard }: { dashboard: DashboardDTO }) {
  const t = useT();
  const alerts: Alert[] = [];

  if (dashboard.lowStockMaterials.length > 0) {
    const first = dashboard.lowStockMaterials[0];
    alerts.push({
      icon: "inventory_2",
      tone: "warning",
      title: t("نقص في المخزون"),
      description:
        dashboard.lowStockMaterials.length === 1
          ? t("{0} قارب على النفاذ (المتبقي {1} {2}).", [first.name, first.quantity, first.unit])
          : t("{0} وخامات أخرى ({1}) تحت الحد الأدنى.", [first.name, dashboard.lowStockMaterials.length]),
    });
  }

  if (dashboard.topOutstandingClient) {
    alerts.push({
      icon: "request_quote",
      tone: "error",
      title: t("مستحقات غير محصلة"),
      description: t("{0} - متأخرات بقيمة {1} ج.م.", [dashboard.topOutstandingClient.name, formatCurrency(dashboard.topOutstandingClient.amount)]),
    });
  }

  if (dashboard.openMissionsCount > 0) {
    alerts.push({
      icon: "receipt_long",
      tone: "neutral",
      title: t("عُهد غير مسواة"),
      description: t("يوجد {0} {1} عهدتها لسه ما اتسوتش.", [dashboard.openMissionsCount, dashboard.openMissionsCount === 1 ? t("مأمورية") : t("مأموريات")]),
    });
  }

  if (dashboard.topOutstandingSupplier) {
    alerts.push({
      icon: "payments",
      tone: "neutral",
      title: t("مستحقات موردين"),
      description: t("{0} - مستحق {1} ج.م.", [dashboard.topOutstandingSupplier.name, formatCurrency(dashboard.topOutstandingSupplier.amount)]),
    });
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl elevation-1 shadow-[var(--shadow-soft)] border border-outline-variant p-stack-lg flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-title-sm text-on-surface font-bold flex items-center gap-2">
          <Icon name="notifications_active" size={20} className="text-warning" filled />
          {t("مركز الانتباه")}</h3>
        {alerts.length > 0 && (
          <span className="bg-error-container text-on-error-container text-label-caps px-2 py-0.5 rounded-full">
            {alerts.length} {t(" إجراءات مطلوبة")}</span>
        )}
      </div>
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto ps-1">
        {alerts.length === 0 && <p className="text-body-sm text-on-surface-variant text-center py-stack-md">{t("كل حاجة تمام - مفيش إجراءات مطلوبة")}</p>}
        {alerts.map((a, i) => {
          const tone = toneClasses[a.tone];
          return (
            <div key={i} className={`p-3 rounded-lg border ${tone.border} ${tone.bg} flex gap-3 items-start`}>
              <Icon name={a.icon} size={20} className={`${tone.icon} mt-0.5 shrink-0`} />
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-semibold mb-1 ${tone.title}`}>{a.title}</h4>
                <p className="text-xs text-on-surface-variant leading-tight">{a.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
