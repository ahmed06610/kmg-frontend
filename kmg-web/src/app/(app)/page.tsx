import { getDashboard } from "@/lib/api/dashboard";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { projectTypeLabels } from "@/types/enums";
import { formatCurrency, formatDate } from "@/lib/utils";

function StatCard({ label, value, icon, tone }: { label: string; value: string; icon: string; tone: string }) {
  return (
    <Card className="flex items-center gap-stack-md">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${tone}`}>
        <Icon name={icon} />
      </div>
      <div className="min-w-0">
        <p className="text-body-sm text-on-surface-variant">{label}</p>
        <p dir="ltr" className="text-title-sm text-mono-data text-on-surface text-right truncate">
          {value}
        </p>
      </div>
    </Card>
  );
}

function MiniStat({ label, value, icon, tone }: { label: string; value: string; icon: string; tone: string }) {
  return (
    <Card className="p-stack-md">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-on-surface-variant">{label}</span>
        <Icon name={icon} size={16} className={tone} />
      </div>
      <p dir="ltr" className="text-title-sm text-mono-data text-on-surface text-right">
        {value}
      </p>
    </Card>
  );
}

export default async function DashboardPage() {
  const dashboard = await getDashboard();

  return (
    <div className="flex flex-col gap-stack-lg">
      <div>
        <h1 className="text-headline-md text-on-surface">لوحة التحكم</h1>
        <p className="text-body-sm text-on-surface-variant">نظرة عامة على أداء الشركة</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <StatCard
          label="إجمالي الدخل"
          value={formatCurrency(dashboard.totalIncome)}
          icon="trending_up"
          tone="bg-success-container text-on-success-container"
        />
        <StatCard
          label="إجمالي المصاريف"
          value={formatCurrency(dashboard.totalExpenses)}
          icon="trending_down"
          tone="bg-error-container text-on-error-container"
        />
        <StatCard
          label="صافي الربح"
          value={formatCurrency(dashboard.netProfit)}
          icon="paid"
          tone="bg-secondary-container text-on-secondary-container"
        />
        <StatCard
          label="رصيد الخزنة"
          value={formatCurrency(dashboard.cashBoxTotal)}
          icon="account_balance_wallet"
          tone="bg-primary-container text-on-primary-container"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        <MiniStat label="مأموريات مفتوحة" value={String(dashboard.openMissionsCount)} icon="engineering" tone="text-secondary" />
        <MiniStat label="سلف قائمة" value={formatCurrency(dashboard.totalOutstandingAdvances)} icon="request_quote" tone="text-warning" />
        <MiniStat label="عملاء لهم مستحقات" value={String(dashboard.clientsWithOutstandingBalanceCount)} icon="groups" tone="text-error" />
        <MiniStat label="موردين لهم مستحقات" value={String(dashboard.suppliersWithOutstandingBalanceCount)} icon="local_shipping" tone="text-error" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>المشاريع حسب النوع</CardTitle>
            <span className="text-body-sm text-on-surface-variant">
              {dashboard.activeProjectsCount} جاري / {dashboard.completedProjectsCount} مكتمل
            </span>
          </CardHeader>
          <div className="flex flex-col divide-y divide-outline-variant">
            {dashboard.projectsByType.map((p) => (
              <div key={p.projectType} className="flex items-center justify-between py-stack-sm">
                <span className="text-body-sm text-on-surface">
                  {projectTypeLabels[p.projectType] ?? p.projectType}
                </span>
                <div className="flex items-center gap-stack-lg">
                  <span className="text-body-sm text-on-surface-variant">{p.count} مشروع</span>
                  <span dir="ltr" className="text-mono-data text-on-surface">
                    {formatCurrency(p.totalValue)}
                  </span>
                </div>
              </div>
            ))}
            {dashboard.projectsByType.length === 0 && (
              <p className="py-stack-md text-body-sm text-on-surface-variant text-center">لا توجد مشاريع بعد</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تنبيهات المخزون</CardTitle>
            {dashboard.lowStockMaterialsCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-error-container text-on-error-container px-2 py-0.5 text-xs font-semibold">
                {dashboard.lowStockMaterialsCount}
              </span>
            )}
          </CardHeader>
          {dashboard.lowStockMaterialNames.length > 0 ? (
            <ul className="flex flex-col gap-stack-sm">
              {dashboard.lowStockMaterialNames.map((name) => (
                <li key={name} className="flex items-center gap-2 text-body-sm text-on-surface">
                  <Icon name="warning" size={16} className="text-warning" />
                  {name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-sm text-on-surface-variant">كل الخامات فوق الحد الأدنى</p>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>آخر الأنشطة</CardTitle>
        </CardHeader>
        {dashboard.recentActivity.length > 0 ? (
          <div className="flex flex-col divide-y divide-outline-variant">
            {dashboard.recentActivity.map((a, i) => (
              <div key={i} className="flex items-center justify-between gap-stack-md py-stack-sm">
                <span className="text-body-sm text-on-surface">{a.description}</span>
                <div className="flex items-center gap-stack-md shrink-0">
                  <span dir="ltr" className={`text-mono-data text-body-sm ${a.amount >= 0 ? "text-success" : "text-error"}`}>
                    {a.amount >= 0 ? "+" : ""}
                    {formatCurrency(a.amount)}
                  </span>
                  <span dir="ltr" className="text-mono-data text-xs text-on-surface-variant">
                    {formatDate(a.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-body-sm text-on-surface-variant text-center py-stack-md">لا توجد حركات مسجلة بعد</p>
        )}
      </Card>

      <Card>
        <p className="text-body-sm text-on-surface-variant">مدفوعات للموردين هذا الشهر</p>
        <p dir="ltr" className="text-headline-md text-mono-data text-on-surface mt-1 text-right">
          {formatCurrency(dashboard.supplierPaymentsThisMonth)}
        </p>
      </Card>
    </div>
  );
}
