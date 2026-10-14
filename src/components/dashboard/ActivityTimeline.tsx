import { formatDate } from "@/lib/utils";
import type { RecentActivityDTO } from "@/types/dashboard";

const dotTones = ["bg-primary", "bg-secondary", "bg-outline"];

export function ActivityTimeline({ activity }: { activity: RecentActivityDTO[] }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl elevation-1 shadow-[var(--shadow-soft)] border border-outline-variant p-stack-lg flex-1">
      <h3 className="text-title-sm text-on-surface font-bold mb-4">سجل النشاط الحديث</h3>
      {activity.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant text-center py-stack-md">لا يوجد نشاط مسجل بعد</p>
      ) : (
        <div className="space-y-4">
          {activity.map((a, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full ${dotTones[i % dotTones.length]} mt-1.5`} />
                {i < activity.length - 1 && <div className="w-px h-full bg-outline-variant my-1" />}
              </div>
              <div className="pb-2 min-w-0">
                <p className="text-sm font-medium text-on-surface truncate">{a.description}</p>
                <span className="text-[10px] text-outline mt-1 block" dir="ltr">
                  {formatDate(a.date)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
