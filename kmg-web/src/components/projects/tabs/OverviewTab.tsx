import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { formatCurrency } from "@/lib/utils";
import type { ProjectDetailsDTO } from "@/types/project";
import type { MissionListDTO } from "@/types/mission";

function Kpi({ label, value, icon, tone }: { label: string; value: string; icon: string; tone: string }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md shadow-soft relative overflow-hidden">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-on-surface-variant">{label}</span>
        <Icon name={icon} size={16} className={tone} />
      </div>
      <p dir="ltr" className="text-title-sm text-mono-data text-on-surface text-right">
        {value}
      </p>
    </div>
  );
}

function CircularGauge({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * clamped) / 100;
  const overBudget = percent > 100;

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-32 h-32 -rotate-90">
        <circle cx="64" cy="64" r={radius} fill="transparent" stroke="var(--color-surface-variant)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="transparent"
          stroke={overBudget ? "var(--color-error)" : "var(--color-primary)"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span dir="ltr" className="text-headline-md text-mono-data text-on-surface font-bold">
          {percent}%
        </span>
        <span className="text-[10px] text-on-surface-variant">تم الصرف</span>
      </div>
    </div>
  );
}

interface MaterialUsage {
  materialId: number;
  name: string;
  netIssued: number;
}

function aggregateMaterialUsage(project: ProjectDetailsDTO): MaterialUsage[] {
  const byMaterial = new Map<number, MaterialUsage>();
  for (const m of project.stockMovements) {
    if (m.movementType !== "IssueToProject" && m.movementType !== "ReturnFromProject") continue;
    const existing = byMaterial.get(m.materialId) ?? { materialId: m.materialId, name: m.materialName, netIssued: 0 };
    existing.netIssued += m.movementType === "IssueToProject" ? m.quantity : -m.quantity;
    byMaterial.set(m.materialId, existing);
  }
  return Array.from(byMaterial.values())
    .filter((m) => m.netIssued > 0)
    .sort((a, b) => b.netIssued - a.netIssued);
}

export function OverviewTab({ project, missions }: { project: ProjectDetailsDTO; missions: MissionListDTO[] }) {
  const totalCost = project.totalMaterialsCost + project.totalPettyExpenses + project.totalLaborCost;
  const spendRatio = project.contractValue > 0 ? Math.round((totalCost / project.contractValue) * 100) : 0;
  const activeMission = missions.find((m) => m.status !== "Settled");
  const hasClientInfo = project.clientPhone || project.clientEmail || project.clientAddress;
  const materialsUsage = aggregateMaterialUsage(project);

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        <Kpi label="قيمة العقد" value={formatCurrency(project.contractValue)} icon="account_balance_wallet" tone="text-on-surface-variant" />
        <Kpi label="المحصَّل" value={formatCurrency(project.totalCollected)} icon="download_done" tone="text-success" />
        <Kpi label="المتبقي" value={formatCurrency(project.remainingBalance)} icon="hourglass_empty" tone="text-warning" />
        <Kpi
          label="صافي الربح"
          value={formatCurrency(project.netProfit)}
          icon="insights"
          tone={project.netProfit >= 0 ? "text-success" : "text-error"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
        <div className="flex flex-col gap-gutter">
          <Card>
            <p className="text-title-sm text-on-surface mb-4 flex items-center gap-2">
              <Icon name="donut_large" size={18} className="text-on-surface-variant" />
              التباين المالي
            </p>
            <CircularGauge percent={spendRatio} />
            <div className="flex flex-col gap-3 mt-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">قيمة العقد</span>
                  <span dir="ltr" className="text-mono-data text-on-surface">
                    {formatCurrency(project.contractValue)}
                  </span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full w-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">التكلفة الفعلية</span>
                  <span dir="ltr" className="text-mono-data text-on-surface">
                    {formatCurrency(totalCost)}
                  </span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${spendRatio > 100 ? "bg-error" : "bg-primary"}`} style={{ width: `${Math.min(spendRatio, 100)}%` }} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-gutter mt-4 pt-4 border-t border-outline-variant">
              <div>
                <p className="text-xs text-on-surface-variant mb-1">خامات</p>
                <p dir="ltr" className="text-body-sm text-mono-data text-on-surface text-right">
                  {formatCurrency(project.totalMaterialsCost)}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">نثرية</p>
                <p dir="ltr" className="text-body-sm text-mono-data text-on-surface text-right">
                  {formatCurrency(project.totalPettyExpenses)}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">عمالة</p>
                <p dir="ltr" className="text-body-sm text-mono-data text-on-surface text-right">
                  {formatCurrency(project.totalLaborCost)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <p className="text-title-sm text-on-surface mb-1">بيانات العميل</p>
            <div className="pb-3 mb-3 border-b border-outline-variant">
              <p className="text-body-sm font-semibold text-on-surface">{project.clientName}</p>
            </div>
            {hasClientInfo ? (
              <div className="flex flex-col gap-2 text-body-sm text-on-surface-variant">
                {project.clientPhone && (
                  <div className="flex items-center gap-2">
                    <Icon name="call" size={16} />
                    <span dir="ltr" className="text-mono-data">
                      {project.clientPhone}
                    </span>
                  </div>
                )}
                {project.clientEmail && (
                  <div className="flex items-center gap-2">
                    <Icon name="mail" size={16} />
                    <span dir="ltr">{project.clientEmail}</span>
                  </div>
                )}
                {project.clientAddress && (
                  <div className="flex items-start gap-2">
                    <Icon name="location_on" size={16} className="mt-0.5" />
                    <span>{project.clientAddress}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-body-sm text-on-surface-variant">لا توجد بيانات تواصل مسجلة</p>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-gutter">
          <Card className="overflow-hidden !p-0">
            <div className="px-gutter py-stack-md border-b border-outline-variant flex items-center justify-between">
              <p className="text-title-sm text-on-surface flex items-center gap-2">
                <Icon name="inventory_2" size={18} className="text-primary" />
                الخامات المصروفة على المشروع
              </p>
              <span className="text-xs text-on-surface-variant">{materialsUsage.length} صنف</span>
            </div>
            {materialsUsage.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant text-center py-stack-lg">لسه مفيش خامات اتصرفت على المشروع ده</p>
            ) : (
              <div className="divide-y divide-outline-variant">
                {materialsUsage.map((m) => (
                  <div key={m.materialId} className="flex items-center justify-between px-gutter py-stack-sm">
                    <div className="flex items-center gap-2 text-body-sm text-on-surface">
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      {m.name}
                    </div>
                    <span dir="ltr" className="text-mono-data text-on-surface-variant text-sm">
                      {m.netIssued}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {project.description && (
            <Card>
              <p className="text-body-sm text-on-surface-variant mb-1">وصف المشروع</p>
              <p className="text-body-md text-on-surface">{project.description}</p>
            </Card>
          )}

          {activeMission ? (
            <Card className="border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 h-full bg-primary" />
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">مأمورية نشطة حاليًا</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-gutter">
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">رئيس العمال</p>
                  <p className="text-body-sm text-on-surface font-semibold">{activeMission.foremanName}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">تاريخ البداية</p>
                  <p dir="ltr" className="text-body-sm text-mono-data text-on-surface text-right">
                    {activeMission.startDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">قيمة العهدة</p>
                  <p dir="ltr" className="text-body-sm text-mono-data text-on-surface text-right">
                    {formatCurrency(activeMission.advanceAmount)}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            missions.length > 0 && (
              <Card>
                <p className="text-title-sm text-on-surface mb-1">المأموريات</p>
                <p className="text-body-sm text-on-surface-variant">
                  كل المأموريات ({missions.length}) متسواة حاليًا، مفيش مأمورية مفتوحة على المشروع ده دلوقتي.
                </p>
              </Card>
            )
          )}

          {project.remainingBalance > project.contractValue * 0.5 && (
            <Card className="bg-error-container/30 border-error/30">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="warning" size={18} className="text-error" />
                <p className="text-body-sm font-semibold text-on-error-container">نسبة تحصيل منخفضة</p>
              </div>
              <p className="text-xs text-on-surface-variant">
                لسه متبقي {formatCurrency(project.remainingBalance)} من قيمة العقد ({formatCurrency(project.contractValue)}).
              </p>
            </Card>
          )}

          {project.attachments.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <p className="text-title-sm text-on-surface flex items-center gap-2">
                  <Icon name="description" size={18} className="text-on-surface-variant" />
                  أحدث المستندات
                </p>
                <span className="text-xs text-on-surface-variant">{project.attachments.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {project.attachments.slice(0, 3).map((a) => (
                  <Link
                    key={a.id}
                    href={a.fileUrl}
                    target="_blank"
                    className="flex items-center gap-2 text-body-sm text-on-surface hover:text-primary transition-colors truncate"
                  >
                    <Icon name="attach_file" size={16} className="shrink-0 text-on-surface-variant" />
                    <span className="truncate">{a.fileName || a.fileUrl}</span>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
