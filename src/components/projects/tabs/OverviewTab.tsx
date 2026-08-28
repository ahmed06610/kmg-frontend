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

export function OverviewTab({ project, missions }: { project: ProjectDetailsDTO; missions: MissionListDTO[] }) {
  const totalCost = project.totalMaterialsCost + project.totalPettyExpenses + project.totalLaborCost;
  const spendRatio = project.contractValue > 0 ? Math.min(100, Math.round((totalCost / project.contractValue) * 100)) : 0;
  const activeMission = missions.find((m) => m.status !== "Settled");
  const hasClientInfo = project.clientPhone || project.clientEmail || project.clientAddress;

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
        <div className="lg:col-span-2 flex flex-col gap-gutter">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-title-sm text-on-surface">نسبة الصرف من قيمة العقد</p>
              <span dir="ltr" className="text-mono-data text-on-surface-variant text-sm">
                {spendRatio}%
              </span>
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
              <div className={`h-full ${spendRatio > 100 ? "bg-error" : "bg-primary"}`} style={{ width: `${Math.min(spendRatio, 100)}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-gutter mt-4">
              <div>
                <p className="text-xs text-on-surface-variant mb-1">تكلفة الخامات</p>
                <p dir="ltr" className="text-body-sm text-mono-data text-on-surface text-right">
                  {formatCurrency(project.totalMaterialsCost)}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">المصاريف النثرية</p>
                <p dir="ltr" className="text-body-sm text-mono-data text-on-surface text-right">
                  {formatCurrency(project.totalPettyExpenses)}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">تكلفة العمالة</p>
                <p dir="ltr" className="text-body-sm text-mono-data text-on-surface text-right">
                  {formatCurrency(project.totalLaborCost)}
                </p>
              </div>
            </div>
          </Card>

          {project.description && (
            <Card>
              <p className="text-body-sm text-on-surface-variant mb-1">وصف المشروع</p>
              <p className="text-body-md text-on-surface">{project.description}</p>
            </Card>
          )}

          {activeMission && (
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
          )}
        </div>

        <div className="flex flex-col gap-gutter">
          <Card>
            <p className="text-title-sm text-on-surface mb-3 pb-2 border-b border-outline-variant">بيانات العميل</p>
            <p className="text-body-sm font-semibold text-on-surface mb-2">{project.clientName}</p>
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
        </div>
      </div>
    </div>
  );
}
