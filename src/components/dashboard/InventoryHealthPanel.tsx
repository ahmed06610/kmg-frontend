import Link from "next/link";
import type { LowStockMaterialDTO } from "@/types/dashboard";

export function InventoryHealthPanel({ materials }: { materials: LowStockMaterialDTO[] }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl elevation-1 shadow-[var(--shadow-soft)] border border-outline-variant p-stack-lg flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-title-sm text-on-surface font-bold">صحة المخزون (خامات تحت الحد الأدنى)</h3>
        <Link href="/stock" className="text-primary hover:underline text-sm font-medium">
          المخزون
        </Link>
      </div>

      {materials.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant text-center py-stack-md">كل الخامات فوق الحد الأدنى</p>
      ) : (
        <div className="space-y-4">
          {materials.slice(0, 4).map((m) => {
            const ratio = m.minimumThreshold > 0 ? Math.min(100, Math.round((m.quantity / m.minimumThreshold) * 100)) : 0;
            const critical = ratio <= 30;
            return (
              <div key={m.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{m.name}</span>
                  <span className={`text-xs ${critical ? "text-error font-medium" : "text-on-surface-variant"}`}>
                    متبقي: <span dir="ltr" className="text-mono-data">{m.quantity}</span> {m.unit}
                    {critical && " (حرج)"}
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 overflow-hidden flex ${critical ? "bg-error-container" : "bg-surface-variant"}`}>
                  <div className={`h-full ${critical ? "bg-error" : "bg-success"}`} style={{ width: `${Math.max(ratio, 4)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
