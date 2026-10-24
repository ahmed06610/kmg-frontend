"use client";

import { useT } from "@/lib/i18n/client";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExportButton } from "@/components/ui/ExportButton";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency } from "@/lib/utils";
import { projectStatusTone } from "@/lib/status-tone";
import { useTableState } from "@/lib/useTableState";
import { projectStatusLabels, projectTypeLabels } from "@/types/enums";
import type { ClientListDTO } from "@/types/client";
import type { ProjectListDTO } from "@/types/project";
import { CreateProjectDialog } from "./CreateProjectDialog";

export function ProjectsView({ projects, clients, canManage }: { projects: ProjectListDTO[]; clients: ClientListDTO[]; canManage: boolean }) {
  const t = useT();
  const [dialogOpen, setDialogOpen] = useState(false);
  const table = useTableState({
    rows: projects,
    pageSize: 10,
    searchPredicate: (p, term) =>
      p.name.toLowerCase().includes(term) || p.projectCode.toLowerCase().includes(term) || p.clientName.toLowerCase().includes(term),
  });

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface">{t("المشاريع")}</h1>
          <p className="text-body-sm text-on-surface-variant">{t("{0} مشروع", [projects.length])}</p>
        </div>
        {canManage && (
          <Button onClick={() => setDialogOpen(true)}>
            <Icon name="add" />
            {t("مشروع جديد")}</Button>
        )}
      </div>

      {projects.length > 0 && (
        <div className="flex items-center justify-between gap-stack-sm flex-wrap">
          <SearchInput value={table.search} onChange={table.setSearch} placeholder={t("بحث بالاسم أو الكود أو العميل...")} />
          <ExportButton
            filename={t("المشاريع")}
            columns={[
              { header: t("اسم المشروع"), key: "name" },
              { header: t("الكود"), key: "code" },
              { header: t("العميل"), key: "client" },
              { header: t("النوع"), key: "type" },
              { header: t("الحالة"), key: "status" },
              { header: t("القيمة"), key: "value" },
              { header: t("المحصَّل"), key: "collected" },
              { header: t("صافي الربح"), key: "netProfit" },
            ]}
            rows={table.filteredRows.map((p) => ({
              name: p.name,
              code: p.projectCode,
              client: p.clientName,
              type: t(projectTypeLabels[p.projectType] ?? p.projectType),
              status: t(projectStatusLabels[p.status] ?? p.status),
              value: p.contractValue,
              collected: p.totalCollected,
              netProfit: p.netProfit,
            }))}
          />
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState icon="account_tree" title={t("لا توجد مشاريع بعد")} description={t("ابدأ بإنشاء أول مشروع")} />
      ) : table.totalCount === 0 ? (
        <EmptyState icon="search_off" title={t("لا توجد مشاريع مطابقة للبحث")} />
      ) : (
        <>
          <Table>
            <THead>
              <tr>
                <Th>{t("اسم المشروع")}</Th>
                <Th>{t("العميل")}</Th>
                <Th>{t("النوع")}</Th>
                <Th>{t("الحالة")}</Th>
                <Th>{t("القيمة")}</Th>
                <Th>{t("المحصَّل")}</Th>
                <Th>{t("صافي الربح")}</Th>
              </tr>
            </THead>
            <TBody>
              {table.pageRows.map((p) => (
                <Tr key={p.id}>
                  <Td>
                    <Link href={`/projects/${p.id}`} className="text-primary font-semibold hover:underline">
                      {p.name}
                    </Link>
                    <p className="text-xs text-on-surface-variant">{p.projectCode}</p>
                  </Td>
                  <Td>{p.clientName}</Td>
                  <Td>{t(projectTypeLabels[p.projectType] ?? p.projectType)}</Td>
                  <Td>
                    <Badge tone={projectStatusTone(p.status)}>{t(projectStatusLabels[p.status] ?? p.status)}</Badge>
                  </Td>
                  <TdMono>{formatCurrency(p.contractValue)}</TdMono>
                  <TdMono>{formatCurrency(p.totalCollected)}</TdMono>
                  <TdMono className={p.netProfit >= 0 ? "text-success" : "text-error"}>{formatCurrency(p.netProfit)}</TdMono>
                </Tr>
              ))}
            </TBody>
          </Table>
          <Pagination page={table.page} pageSize={table.pageSize} totalCount={table.totalCount} onPageChange={table.setPage} />
        </>
      )}

      <CreateProjectDialog open={dialogOpen} onClose={() => setDialogOpen(false)} clients={clients} />
    </div>
  );
}
