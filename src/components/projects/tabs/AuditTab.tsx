import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import type { ProjectAuditDTO } from "@/types/project";

export function AuditTab({ logs }: { logs: ProjectAuditDTO[] }) {
  if (logs.length === 0) return <EmptyState icon="history" title="لا يوجد سجل تدقيق بعد" />;

  return (
    <div className="relative border-r-2 border-surface-container-high pr-stack-md space-y-stack-md">
      {logs.map((log) => (
        <div key={log.id} className="relative">
          <div className="absolute -right-[23px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-surface-container-lowest" />
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-body-sm text-on-surface font-medium">{log.actionDescription}</span>
            <span className="text-xs text-on-surface-variant shrink-0">{formatDate(log.actionDate)}</span>
          </div>
          <p className="text-xs text-on-surface-variant">{log.employeeName}</p>
        </div>
      ))}
    </div>
  );
}
