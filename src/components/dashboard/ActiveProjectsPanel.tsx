import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { projectStatusTone } from "@/lib/status-tone";
import { projectStatusLabels } from "@/types/enums";
import type { ActiveProjectSummaryDTO } from "@/types/dashboard";

export function ActiveProjectsPanel({ projects }: { projects: ActiveProjectSummaryDTO[] }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl elevation-1 shadow-[var(--shadow-soft)] border border-outline-variant p-stack-lg flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-title-sm text-on-surface font-bold">المشاريع الجارية (تفاصيل مالية)</h3>
        <Link href="/projects" className="text-primary hover:underline text-sm font-medium">
          عرض كل المشاريع
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant text-center py-stack-md">لا توجد مشاريع جارية حاليًا</p>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="block border border-outline-variant rounded-lg p-4 bg-surface hover:border-primary-fixed-dim transition-colors"
            >
              <div className="flex justify-between items-start mb-3 gap-2">
                <div className="min-w-0">
                  <h4 className="text-title-sm font-semibold text-on-surface truncate">{p.name}</h4>
                  <p className="text-xs text-on-surface-variant mt-1 truncate">العميل: {p.clientName}</p>
                </div>
                <Badge tone={projectStatusTone(p.status)}>{projectStatusLabels[p.status] ?? p.status}</Badge>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3 bg-surface-container-lowest p-2 rounded border border-outline-variant/50 text-center">
                <div>
                  <p className="text-[10px] text-on-surface-variant mb-0.5">قيمة المشروع</p>
                  <p dir="ltr" className="text-mono-data text-xs font-semibold">
                    {formatCurrency(p.contractValue)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant mb-0.5">المحصل</p>
                  <p dir="ltr" className="text-mono-data text-xs font-semibold text-success">
                    {formatCurrency(p.totalCollected)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant mb-0.5">التكلفة الفعلية</p>
                  <p dir="ltr" className="text-mono-data text-xs font-semibold text-error">
                    {formatCurrency(p.actualCost)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant mb-0.5">صافي الربح</p>
                  <p dir="ltr" className={`text-mono-data text-xs font-semibold ${p.netProfit >= 0 ? "text-primary" : "text-error"}`}>
                    {formatCurrency(p.netProfit)}
                  </p>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">نسبة الإنجاز (حسب مرحلة المشروع)</span>
                  <span dir="ltr" className="text-mono-data font-semibold">
                    {p.progressPercent}%
                  </span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: `${p.progressPercent}%` }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
