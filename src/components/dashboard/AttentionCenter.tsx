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
  warning: { border: "border-[#ffe5a0]", bg: "bg-[#fff8e6]", icon: "text-[#b06000]", title: "text-[#b06000]" },
  error: { border: "border-error-container", bg: "bg-error-container/30", icon: "text-error", title: "text-error" },
  neutral: { border: "border-outline-variant", bg: "bg-surface", icon: "text-secondary", title: "text-secondary" },
};

export function AttentionCenter({ dashboard }: { dashboard: DashboardDTO }) {
  const alerts: Alert[] = [];

  if (dashboard.lowStockMaterials.length > 0) {
    const first = dashboard.lowStockMaterials[0];
    alerts.push({
      icon: "inventory_2",
      tone: "warning",
      title: "نقص في المخزون",
      description:
        dashboard.lowStockMaterials.length === 1
          ? `${first.name} قارب على النفاذ (المتبقي ${first.quantity} ${first.unit}).`
          : `${first.name} وخامات أخرى (${dashboard.lowStockMaterials.length}) تحت الحد الأدنى.`,
    });
  }

  if (dashboard.topOutstandingClient) {
    alerts.push({
      icon: "request_quote",
      tone: "error",
      title: "مستحقات غير محصلة",
      description: `${dashboard.topOutstandingClient.name} - متأخرات بقيمة ${formatCurrency(dashboard.topOutstandingClient.amount)} ج.م.`,
    });
  }

  if (dashboard.openMissionsCount > 0) {
    alerts.push({
      icon: "receipt_long",
      tone: "neutral",
      title: "عُهد غير مسواة",
      description: `يوجد ${dashboard.openMissionsCount} ${dashboard.openMissionsCount === 1 ? "مأمورية" : "مأموريات"} عهدتها لسه ما اتسوتش.`,
    });
  }

  if (dashboard.topOutstandingSupplier) {
    alerts.push({
      icon: "payments",
      tone: "neutral",
      title: "مستحقات موردين",
      description: `${dashboard.topOutstandingSupplier.name} - مستحق ${formatCurrency(dashboard.topOutstandingSupplier.amount)} ج.م.`,
    });
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl elevation-1 shadow-[var(--shadow-soft)] border border-outline-variant p-stack-lg flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-title-sm text-on-surface font-bold flex items-center gap-2">
          <Icon name="notifications_active" size={20} className="text-[#b06000]" filled />
          مركز الانتباه
        </h3>
        {alerts.length > 0 && (
          <span className="bg-error-container text-on-error-container text-label-caps px-2 py-0.5 rounded-full">
            {alerts.length} إجراءات مطلوبة
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
        {alerts.length === 0 && <p className="text-body-sm text-on-surface-variant text-center py-stack-md">كل حاجة تمام - مفيش إجراءات مطلوبة</p>}
        {alerts.map((a, i) => {
          const t = toneClasses[a.tone];
          return (
            <div key={i} className={`p-3 rounded-lg border ${t.border} ${t.bg} flex gap-3 items-start`}>
              <Icon name={a.icon} size={20} className={`${t.icon} mt-0.5 shrink-0`} />
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-semibold mb-1 ${t.title}`}>{a.title}</h4>
                <p className="text-xs text-on-surface-variant leading-tight">{a.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
