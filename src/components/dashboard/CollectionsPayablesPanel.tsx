import { Icon } from "@/components/ui/Icon";
import { formatCurrency } from "@/lib/utils";

export function CollectionsPayablesPanel({ receivables, payables }: { receivables: number; payables: number }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl elevation-1 shadow-[var(--shadow-soft)] border border-outline-variant p-stack-lg flex flex-col justify-center">
      <h3 className="text-title-sm text-on-surface font-bold mb-4 text-center">إجمالي المستحقات (عملاء وموردين)</h3>
      <div className="flex items-center justify-center gap-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-success-container text-success flex items-center justify-center mx-auto mb-2 border-4 border-surface-container-lowest shadow-sm">
            <Icon name="call_received" size={24} filled />
          </div>
          <p className="text-sm font-medium mb-1">مستحق من العملاء</p>
          <p dir="ltr" className="text-mono-data text-lg font-bold text-success">
            {formatCurrency(receivables)}
          </p>
        </div>
        <Icon name="sync_alt" size={28} className="text-on-surface-variant" />
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center mx-auto mb-2 border-4 border-surface-container-lowest shadow-sm">
            <Icon name="call_made" size={24} filled />
          </div>
          <p className="text-sm font-medium mb-1">مستحق للموردين</p>
          <p dir="ltr" className="text-mono-data text-lg font-bold text-error">
            {formatCurrency(payables)}
          </p>
        </div>
      </div>
    </div>
  );
}
