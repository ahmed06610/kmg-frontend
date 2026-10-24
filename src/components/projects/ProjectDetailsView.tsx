"use client";

import { useT } from "@/lib/i18n/client";
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
  employees,
  clients,
  canManage,
  canManageStock,
}: {
  project: ProjectDetailsDTO;
  missions: MissionDetailsDTO[];
  materials: MaterialDTO[];
  categories: MaterialCategoryDTO[];
  workers: EmployeeListDTO[];
  employees: EmployeeListDTO[];
  clients: ClientListDTO[];
  canManage: boolean;
  canManageStock: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="flex flex-col gap-stack-lg">
      <Breadcrumb items={[{ label: t("المشاريع"), href: "/projects" }, { label: project.name }]} />

      <div className="flex items-start justify-between flex-wrap gap-stack-sm">
        <div>
          <h1 className="text-headline-md text-on-surface">{project.name}</h1>
          <p className="text-body-sm text-on-surface-variant">
            {project.projectCode} · {project.clientName} · {t(projectTypeLabels[project.projectType] ?? project.projectType)} ·{" "}
            <span dir="ltr" className="font-mono-data">
              {formatCurrency(project.contractValue)}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-stack-sm">
          <MultiSheetExportButton filename={project.name} sheets={buildProjectExportSheets(project, missions)} />
          {canManage && (
            <>
              <Button variant="secondary" onClick={() => setEditOpen(true)}>
                <Icon name="edit" size={18} />
                {t("تعديل")}</Button>
              <Button variant="danger" disabled={!project.canDelete} title={project.canDelete ? undefined : t("لازم تحذف كل بيانات المشروع (دفعات/مصاريف/مأموريات/مخزون/مرفقات) الأول")} onClick={() => setDeleteOpen(true)}>
                <Icon name="delete" size={18} />
                {t("حذف")}</Button>
            </>
          )}
          {canManage && <ProjectStatusSelect projectId={project.id} currentStatus={project.status} />}
        </div>
      </div>

      <Tabs
        active={tab}
        onChange={setTab}
        items={[
          { key: "overview", label: t("نظرة عامة") },
          { key: "materials", label: t("الخامات"), badge: project.stockMovements.length },
          { key: "expenses", label: t("المصاريف والعهد"), badge: project.expenses.length + project.custodies.length + missions.filter((m) => m.advanceAmount > 0).length },
          { key: "payments", label: t("الدفعات"), badge: project.payments.length },
          { key: "missions", label: t("المأموريات"), badge: missions.length },
          { key: "writeoffs", label: t("خصم أعمال المشروع"), badge: project.writeOffs.length },
          { key: "attachments", label: t("المرفقات"), badge: project.attachments.length },
          { key: "audit", label: t("سجل التدقيق") },
        ]}
      />

      <div>
        {tab === "overview" && <OverviewTab project={project} missions={missions} materials={materials} categories={categories} canManage={canManage} />}
        {tab === "materials" && (
          <MaterialsTab
            project={project}
            movements={project.stockMovements}
            totalMaterialsCost={project.totalMaterialsCost}
            materials={materials}
            categories={categories}
            canManage={canManage}
            canManageStock={canManageStock}
          />
        )}
        {tab === "expenses" && <ExpensesTab project={project} missions={missions} employees={employees} canManage={canManage} />}
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
        title={t("حذف المشروع")}
        message={t("هل أنت متأكد من حذف مشروع \"{0}\" نهائيًا؟", [project.name])}
        onConfirm={() => deleteProject(project.id)}
        onConfirmed={() => router.push("/projects")}
      />
    </div>
  );
}
