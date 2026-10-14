import { Icon } from "@/components/ui/Icon";
import { cn, formatCurrency } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  changePercent,
  highlight,
  valueTone,
  subtitle,
}: {
  label: string;
  value: number;
  changePercent?: number;
  highlight?: boolean;
  valueTone?: "error" | "success";
  subtitle?: string;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-stack-md border border-outline-variant shadow-[var(--shadow-soft)] relative overflow-hidden">
      <div className={cn("absolute top-0 right-0 w-full h-1", highlight ? "bg-primary" : "bg-surface-variant")} />
      <div className="flex justify-between items-start mb-2 gap-2">
        <p className={cn("text-body-sm text-on-surface-variant", highlight && "font-semibold text-primary")}>{label}</p>
        {changePercent !== undefined && changePercent !== 0 && (
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0",
              changePercent > 0 ? "bg-success-container text-on-success-container" : "bg-error-container text-on-error-container",
            )}
          >
            <Icon name={changePercent > 0 ? "trending_up" : "trending_down"} size={12} />
            {changePercent > 0 ? "+" : ""}
            {changePercent}%
          </span>
        )}
      </div>
      <h3
        dir="ltr"
        className={cn(
          "text-xl text-mono-data tracking-tight text-right",
          valueTone === "error" ? "text-error" : "text-on-surface",
        )}
      >
        {formatCurrency(value)} <span className="text-xs text-on-surface-variant">ج.م</span>
      </h3>
      {subtitle && <p className="text-[10px] text-on-surface-variant mt-1">{subtitle}</p>}
    </div>
  );
}
