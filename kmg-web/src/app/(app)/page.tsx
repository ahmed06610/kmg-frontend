import { getDashboard } from "@/lib/api/dashboard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ExportButton } from "@/components/ui/ExportButton";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { FinancialTrendChart } from "@/components/dashboard/FinancialTrendChart";
import { AttentionCenter } from "@/components/dashboard/AttentionCenter";
import { ActiveProjectsPanel } from "@/components/dashboard/ActiveProjectsPanel";
import { ProjectsPipelinePanel } from "@/components/dashboard/ProjectsPipelinePanel";
import { InventoryHealthPanel } from "@/components/dashboard/InventoryHealthPanel";
import { CollectionsPayablesPanel } from "@/components/dashboard/CollectionsPayablesPanel";
import { RecentTransactionsTable } from "@/components/dashboard/RecentTransactionsTable";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";

export default async function DashboardPage() {
  const dashboard = await getDashboard();

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-stack-sm">
        <div>
          <Breadcrumb items={[{ label: "الرئيسية" }]} />
          <h1 className="text-display-lg text-on-surface mb-1">نظرة عامة على الأداء</h1>
          <p className="text-body-sm text-on-surface-variant">متابعة الأداء المالي والتشغيلي</p>
        </div>
        <ExportButton
          filename="ملخص_لوحة_التحكم"
          columns={[
            { header: "المؤشر", key: "label" },
            { header: "القيمة", key: "value" },
          ]}
          rows={[
            { label: "إجمالي قيمة المشاريع", value: dashboard.totalContractValue },
            { label: "إجمالي المحصل", value: dashboard.totalIncome },
            { label: "إجمالي التكاليف", value: dashboard.totalExpenses },
            { label: "صافي الربح", value: dashboard.netProfit },
            { label: "رصيد الخزنة", value: dashboard.cashBoxTotal },
            { label: "المستحق للتحصيل", value: dashboard.totalReceivables },
            { label: "المستحق للموردين", value: dashboard.totalPayables },
          ]}
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-gutter">
        <KpiCard label="إجمالي قيمة المشاريع" value={dashboard.totalContractValue} changePercent={dashboard.totalContractValueChangePercent} />
        <KpiCard label="إجمالي المحصل" value={dashboard.totalIncome} changePercent={dashboard.incomeChangePercent} />
        <KpiCard label="إجمالي التكاليف" value={dashboard.totalExpenses} changePercent={dashboard.expensesChangePercent} />
        <KpiCard label="صافي الربح" value={dashboard.netProfit} changePercent={dashboard.netProfitChangePercent} highlight />
        <KpiCard label="رصيد الخزنة" value={dashboard.cashBoxTotal} subtitle="نقد / كريديت" />
        <KpiCard label="المستحق للتحصيل" value={dashboard.totalReceivables} valueTone="error" />
      </div>

      {/* Chart + Attention Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl elevation-1 shadow-[var(--shadow-soft)] border border-outline-variant p-stack-lg flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
            <h3 className="text-title-sm text-on-surface font-bold">الأداء المالي (آخر 6 أشهر)</h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary" />
                الدخل
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#bec6e0" }} />
                المصروفات
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-success" />
                صافي الربح
              </span>
            </div>
          </div>
          <div className="flex-1 relative w-full h-full">
            <FinancialTrendChart data={dashboard.monthlyTrend} />
          </div>
        </div>
        <div className="lg:col-span-4">
          <AttentionCenter dashboard={dashboard} />
        </div>
      </div>

      {/* Active projects + pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8">
          <ActiveProjectsPanel projects={dashboard.activeProjectsSummary} />
        </div>
        <div className="lg:col-span-4">
          <ProjectsPipelinePanel pipeline={dashboard.projectsPipeline} />
        </div>
      </div>

      {/* Inventory + collections/payables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <InventoryHealthPanel materials={dashboard.lowStockMaterials} />
        <CollectionsPayablesPanel receivables={dashboard.totalReceivables} payables={dashboard.totalPayables} />
      </div>

      {/* Transactions + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8">
          <RecentTransactionsTable activity={dashboard.recentActivity} />
        </div>
        <div className="lg:col-span-4">
          <ActivityTimeline activity={dashboard.recentActivity} />
        </div>
      </div>
    </div>
  );
}
