"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency } from "@/lib/utils";
import { projectStatusTone } from "@/lib/status-tone";
import { projectStatusLabels, projectTypeLabels } from "@/types/enums";
import type { ClientListDTO } from "@/types/client";
import type { ProjectListDTO } from "@/types/project";
import { CreateProjectDialog } from "./CreateProjectDialog";

export function ProjectsView({ projects, clients, canManage }: { projects: ProjectListDTO[]; clients: ClientListDTO[]; canManage: boolean }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface">المشاريع</h1>
          <p className="text-body-sm text-on-surface-variant">{projects.length} مشروع</p>
        </div>
        {canManage && (
          <Button onClick={() => setDialogOpen(true)}>
            <Icon name="add" />
            مشروع جديد
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <EmptyState icon="account_tree" title="لا توجد مشاريع بعد" description="ابدأ بإنشاء أول مشروع" />
      ) : (
        <Table>
          <THead>
            <tr>
              <Th>المشروع</Th>
              <Th>العميل</Th>
              <Th>النوع</Th>
              <Th>الحالة</Th>
              <Th>القيمة</Th>
              <Th>المحصَّل</Th>
              <Th>صافي الربح</Th>
            </tr>
          </THead>
          <TBody>
            {projects.map((p) => (
              <Tr key={p.id}>
                <Td>
                  <Link href={`/projects/${p.id}`} className="text-primary font-semibold hover:underline">
                    {p.projectCode}
                  </Link>
                </Td>
                <Td>{p.clientName}</Td>
                <Td>{projectTypeLabels[p.projectType] ?? p.projectType}</Td>
                <Td>
                  <Badge tone={projectStatusTone(p.status)}>{projectStatusLabels[p.status] ?? p.status}</Badge>
                </Td>
                <TdMono>{formatCurrency(p.contractValue)}</TdMono>
                <TdMono>{formatCurrency(p.totalCollected)}</TdMono>
                <TdMono className={p.netProfit >= 0 ? "text-success" : "text-error"}>{formatCurrency(p.netProfit)}</TdMono>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}

      <CreateProjectDialog open={dialogOpen} onClose={() => setDialogOpen(false)} clients={clients} />
    </div>
  );
}
