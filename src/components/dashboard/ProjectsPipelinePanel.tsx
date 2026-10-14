import { Icon } from "@/components/ui/Icon";
import type { ProjectsPipelineDTO } from "@/types/dashboard";

export function ProjectsPipelinePanel({ pipeline }: { pipeline: ProjectsPipelineDTO }) {
  const stages = [
    { label: "جديد", desc: "لسه ما بدأش التنفيذ", count: pipeline.newCount, icon: "fiber_new", bg: "bg-surface-container-low", color: "text-primary" },
    { label: "جاري التنفيذ", desc: "مراجعة خامات، شراء، تصنيع أو مأمورية", count: pipeline.inProgressCount, icon: "play_arrow", bg: "bg-success-container", color: "text-success" },
    { label: "مكتمل", desc: "تم التسليم النهائي", count: pipeline.completedCount, icon: "check_circle", bg: "bg-surface-container-highest", color: "text-on-surface" },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl elevation-1 shadow-[var(--shadow-soft)] border border-outline-variant p-stack-lg flex flex-col">
      <h3 className="text-title-sm text-on-surface font-bold mb-6">حالة المشاريع (Pipeline)</h3>
      <div className="flex-1 flex flex-col justify-center space-y-4">
        {stages.map((s, i) => (
          <div key={s.label}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center ${s.color} shrink-0`}>
                <Icon name={s.icon} size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold">{s.label}</span>
                  <span dir="ltr" className="text-mono-data font-bold">
                    {s.count}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">{s.desc}</p>
              </div>
            </div>
            {i < stages.length - 1 && <div className="w-0.5 h-4 bg-outline-variant mx-5 my-1" />}
          </div>
        ))}
      </div>
    </div>
  );
}
