import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import type { ProjectDetailsDTO } from "@/types/project";

export function OverviewTab({ project }: { project: ProjectDetailsDTO }) {
  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        <Card>
          <p className="text-body-sm text-on-surface-variant">قيمة العقد</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-on-surface mt-1 text-right">
            {formatCurrency(project.contractValue)}
          </p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">المحصَّل</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-success mt-1 text-right">
            {formatCurrency(project.totalCollected)}
          </p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">المتبقي</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-warning mt-1 text-right">
            {formatCurrency(project.remainingBalance)}
          </p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">صافي الربح</p>
          <p
            dir="ltr"
            className={`text-title-sm text-mono-data mt-1 text-right ${project.netProfit >= 0 ? "text-success" : "text-error"}`}
          >
            {formatCurrency(project.netProfit)}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
        <Card>
          <p className="text-body-sm text-on-surface-variant">تكلفة الخامات</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-on-surface mt-1 text-right">
            {formatCurrency(project.totalMaterialsCost)}
          </p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">المصاريف النثرية</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-on-surface mt-1 text-right">
            {formatCurrency(project.totalPettyExpenses)}
          </p>
        </Card>
        <Card>
          <p className="text-body-sm text-on-surface-variant">تكلفة العمالة</p>
          <p dir="ltr" className="text-title-sm text-mono-data text-on-surface mt-1 text-right">
            {formatCurrency(project.totalLaborCost)}
          </p>
        </Card>
      </div>

      {project.description && (
        <Card>
          <p className="text-body-sm text-on-surface-variant mb-1">وصف المشروع</p>
          <p className="text-body-md text-on-surface">{project.description}</p>
        </Card>
      )}
    </div>
  );
}
