"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteProject } from "@/actions/projects";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { MultiSheetExportButton } from "@/components/ui/ExportButton";
import { Icon } from "@/components/ui/Icon";
import { Tabs } from "@/components/ui/Tabs";
import { buildProjectExportSheets } from "@/lib/projectExport";
import { formatCurrency } from "@/lib/utils";
import { projectTypeLabels } from "@/types/enums";
import type { ClientListDTO } from "@/types/client";
import type { EmployeeListDTO } from "@/types/employee";
import type { MaterialCategoryDTO, MaterialDTO } from "@/types/stock";
import type { MissionDetailsDTO } from "@/types/mission";
import type { ProjectDetailsDTO } from "@/types/project";
import { ProjectEditDialog } from "./ProjectEditDialog";
import { ProjectStatusSelect } from "./ProjectStatusSelect";
import { OverviewTab } from "./tabs/OverviewTab";
import { PaymentsTab } from "./tabs/PaymentsTab";
import { ExpensesTab } from "./tabs/ExpensesTab";
import { MaterialsTab } from "./tabs/MaterialsTab";
import { MissionsTab } from "./tabs/MissionsTab";
import { AttachmentsTab } from "./tabs/AttachmentsTab";
import { WriteOffsTab } from "./tabs/WriteOffsTab";
import { AuditTab } from "./tabs/AuditTab";

export function ProjectDetailsView({
  project,
  missions,
  materials,
  categories,
  workers,
  clients,
  canManage,
}: {
  project: ProjectDetailsDTO;
  missions: MissionDetailsDTO[];
  materials: MaterialDTO[];
  categories: MaterialCategoryDTO[];
  workers: EmployeeListDTO[];
  clients: ClientListDTO[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="flex flex-col gap-stack-lg">
      <Breadcrumb items={[{ label: "المشاريع", href: "/projects" }, { label: project.name }]} />

      <div className="flex items-start justify-between flex-wrap gap-stack-sm">
        <div>
          <h1 className="text-headline-md text-on-surface">{project.name}</h1>
          <p className="text-body-sm text-on-surface-variant">
            {project.projectCode} · {project.clientName} · {projectTypeLabels[project.projectType] ?? project.projectType} ·{" "}
            <span dir="ltr" className="font-mono-data">
              {formatCurrency(project.contractValue)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-stack-sm">
          <MultiSheetExportButton filename={project.name} sheets={buildProjectExportSheets(project, missions)} />
          {canManage && (
            <>
              <Button variant="secondary" onClick={() => setEditOpen(true)}>
                <Icon name="edit" size={18} />
                تعديل
              </Button>
              <Button variant="danger" disabled={!project.canDelete} title={project.canDelete ? undefined : "لازم تحذف كل بيانات المشروع (دفعات/مصاريف/مأموريات/مخزون/مرفقات) الأول"} onClick={() => setDeleteOpen(true)}>
                <Icon name="delete" size={18} />
                حذف
              </Button>
            </>
          )}
          {canManage && <ProjectStatusSelect projectId={project.id} currentStatus={project.status} />}
        </div>
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
          { key: "writeoffs", label: "خصم أعمال المشروع", badge: project.writeOffs.length },
          { key: "attachments", label: "المرفقات", badge: project.attachments.length },
          { key: "audit", label: "سجل التدقيق" },
        ]}
      />

      <div>
        {tab === "overview" && <OverviewTab project={project} missions={missions} canManage={canManage} />}
        {tab === "materials" && (
          <MaterialsTab
            projectId={project.id}
            movements={project.stockMovements}
            totalMaterialsCost={project.totalMaterialsCost}
            materials={materials}
            categories={categories}
            canManage={canManage}
          />
        )}
        {tab === "expenses" && <ExpensesTab projectId={project.id} expenses={project.expenses} canManage={canManage} />}
        {tab === "payments" && (
          <PaymentsTab projectId={project.id} payments={project.payments} remainingBalance={project.remainingBalance} canManage={canManage} />
        )}
        {tab === "missions" && <MissionsTab projectId={project.id} missions={missions} workers={workers} canManage={canManage} />}
        {tab === "writeoffs" && (
          <WriteOffsTab projectId={project.id} writeOffs={project.writeOffs} remainingBalance={project.remainingBalance} canManage={canManage} />
        )}
        {tab === "attachments" && <AttachmentsTab projectId={project.id} attachments={project.attachments} canManage={canManage} />}
        {tab === "audit" && <AuditTab logs={project.auditLogs} />}
      </div>

      <ProjectEditDialog open={editOpen} onClose={() => setEditOpen(false)} project={project} clients={clients} />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="حذف المشروع"
        message={`هل أنت متأكد من حذف مشروع "${project.name}" نهائيًا؟`}
        onConfirm={() => deleteProject(project.id)}
        onConfirmed={() => router.push("/projects")}
      />
    </div>
  );
}
