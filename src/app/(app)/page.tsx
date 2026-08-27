import { getDashboard } from "@/lib/api/dashboard";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { projectTypeLabels } from "@/types/enums";
import { formatCurrency } from "@/lib/utils";

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
          tone="bg-info-container text-on-info-container"
        />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
        <Card>
          <p className="text-body-sm text-on-surface-variant">موردين لهم مستحقات</p>
          <p className="text-headline-md text-on-surface mt-1">{dashboard.suppliersWithOutstandingBalanceCount}</p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">مدفوعات للموردين هذا الشهر</p>
          <p dir="ltr" className="text-headline-md text-mono-data text-on-surface mt-1 text-right">
            {formatCurrency(dashboard.supplierPaymentsThisMonth)}
          </p>
        </Card>
      </div>
    </div>
  );
}
