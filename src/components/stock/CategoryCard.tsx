import { Icon } from "@/components/ui/Icon";
import { formatCurrency } from "@/lib/utils";

export function CategoryCard({
  name,
  icon,
  itemsCount,
  totalValue,
  onClick,
}: {
  name: string;
  icon: string;
  itemsCount: number;
  totalValue: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-stack-sm rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg text-right hover:border-primary hover:shadow-[var(--shadow-soft)] transition-all"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        <Icon name={icon} size={22} />
      </div>
      <p className="text-title-sm text-on-surface font-semibold">{name}</p>
      <div className="flex flex-col gap-0.5 w-full">
        <p className="text-xs text-on-surface-variant">{itemsCount} صنف</p>
        <p dir="ltr" className="text-body-sm text-mono-data text-on-surface text-right">
          {formatCurrency(totalValue)}
        </p>
      </div>
    </button>
  );
}
