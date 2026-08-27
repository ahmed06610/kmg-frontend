"use client";

import { useState } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Tabs } from "@/components/ui/Tabs";
import { formatCurrency } from "@/lib/utils";
import { projectTypeLabels } from "@/types/enums";
import type { EmployeeListDTO } from "@/types/employee";
import type { MaterialDTO } from "@/types/stock";
import type { MissionListDTO } from "@/types/mission";
import type { ProjectDetailsDTO } from "@/types/project";
import { ProjectStatusSelect } from "./ProjectStatusSelect";
import { OverviewTab } from "./tabs/OverviewTab";
import { PaymentsTab } from "./tabs/PaymentsTab";
import { ExpensesTab } from "./tabs/ExpensesTab";
import { MaterialsTab } from "./tabs/MaterialsTab";
import { MissionsTab } from "./tabs/MissionsTab";
import { AttachmentsTab } from "./tabs/AttachmentsTab";
import { AuditTab } from "./tabs/AuditTab";

export function ProjectDetailsView({
  project,
  missions,
  materials,
  workers,
  canManage,
}: {
  project: ProjectDetailsDTO;
  missions: MissionListDTO[];
  materials: MaterialDTO[];
  workers: EmployeeListDTO[];
  canManage: boolean;
}) {
  const [tab, setTab] = useState("overview");

  return (
    <div className="flex flex-col gap-stack-lg">
      <Breadcrumb items={[{ label: "المشاريع", href: "/projects" }, { label: project.projectCode }]} />

      <div className="flex items-start justify-between flex-wrap gap-stack-sm">
        <div>
          <h1 className="text-headline-md text-on-surface">{project.projectCode}</h1>
          <p className="text-body-sm text-on-surface-variant">
            {project.clientName} · {projectTypeLabels[project.projectType] ?? project.projectType} ·{" "}
            <span dir="ltr" className="font-mono-data">
              {formatCurrency(project.contractValue)}
            </span>
          </p>
        </div>
        {canManage && <ProjectStatusSelect projectId={project.id} currentStatus={project.status} />}
      </div>

      <Tabs
        active={tab}
        onChange={setTab}
        items={[
          { key: "overview", label: "نظرة عامة" },
          { key: "materials", label: "الخامات", badge: project.stockMovements.length },
          { key: "expenses", label: "المصاريف", badge: project.expenses.length },
          { key: "payments", label: "الدفعات", badge: project.payments.length },
          { key: "missions", label: "المأموريات", badge: missions.length },
          { key: "attachments", label: "المرفقات", badge: project.attachments.length },
          { key: "audit", label: "سجل التدقيق" },
        ]}
      />

      <div>
        {tab === "overview" && <OverviewTab project={project} />}
        {tab === "materials" && (
          <MaterialsTab
            projectId={project.id}
            movements={project.stockMovements}
            totalMaterialsCost={project.totalMaterialsCost}
            materials={materials}
            canManage={canManage}
          />
        )}
        {tab === "expenses" && <ExpensesTab projectId={project.id} expenses={project.expenses} canManage={canManage} />}
        {tab === "payments" && (
          <PaymentsTab projectId={project.id} payments={project.payments} remainingBalance={project.remainingBalance} canManage={canManage} />
        )}
        {tab === "missions" && <MissionsTab projectId={project.id} missions={missions} workers={workers} canManage={canManage} />}
        {tab === "attachments" && <AttachmentsTab projectId={project.id} attachments={project.attachments} canManage={canManage} />}
        {tab === "audit" && <AuditTab logs={project.auditLogs} />}
      </div>
    </div>
  );
}
