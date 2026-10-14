import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import type { AiTenderResultDTO } from "@/types/aiTenderResult";

function deadlineTone(days: number | null): "error" | "warning" | "neutral" {
  if (days === null) return "neutral";
  if (days <= 3) return "error";
  if (days <= 10) return "warning";
  return "neutral";
}

export function AiTendersSummary({ results }: { results: AiTenderResultDTO[] }) {
  const recent = results.slice(0, 4);

  return (
    <div className="bg-surface-container-lowest rounded-xl elevation-1 shadow-[var(--shadow-soft)] border border-outline-variant p-stack-lg flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-title-sm text-on-surface font-bold flex items-center gap-2">
          <Icon name="request_quote" size={20} className="text-primary" filled />
          مناقصات AI
        </h3>
        {results.length > 0 && (
          <Link href="/ai-tenders" className="text-xs text-primary hover:underline">
            عرض الكل ({results.length})
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
        {recent.length === 0 && <p className="text-body-sm text-on-surface-variant text-center py-stack-md">لا توجد مناقصات مطابقة حاليًا</p>}
        {recent.map((r) => (
          <Link
            key={r.id}
            href={`/ai-tenders/${r.id}`}
            className="p-3 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors flex flex-col gap-1"
          >
            <span className="text-sm font-semibold text-on-surface truncate">{r.tenderTitle ?? r.tenderId}</span>
            <span className="text-xs text-on-surface-variant truncate">{r.issuingEntity ?? "-"}</span>
            {r.daysUntilDeadline !== null && (
              <span>
                <Badge tone={deadlineTone(r.daysUntilDeadline)}>
                  {r.daysUntilDeadline <= 0 ? "انتهى الموعد" : `متبقي ${r.daysUntilDeadline} يوم`}
                </Badge>
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
