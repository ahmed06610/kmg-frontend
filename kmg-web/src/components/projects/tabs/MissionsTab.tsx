"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { missionStatusTone } from "@/lib/status-tone";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { EmployeeListDTO } from "@/types/employee";
import type { MissionListDTO } from "@/types/mission";
import { CreateMissionDialog } from "./CreateMissionDialog";
import { SettleMissionDialog } from "./SettleMissionDialog";

export function MissionsTab({
  projectId,
  missions,
  workers,
  canManage,
}: {
  projectId: number;
  missions: MissionListDTO[];
  workers: EmployeeListDTO[];
  canManage: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [settleMission, setSettleMission] = useState<MissionListDTO | null>(null);

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex items-center justify-end">
        {canManage && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Icon name="add" size={18} />
            مأمورية جديدة
          </Button>
        )}
      </div>

      {missions.length === 0 ? (
        <EmptyState icon="engineering" title="لا توجد مأموريات لهذا المشروع بعد" />
      ) : (
        <Table>
          <THead>
            <tr>
              <Th>رئيس العمال</Th>
              <Th>البداية</Th>
              <Th>النهاية</Th>
              <Th>العهدة</Th>
              <Th>المصروف الفعلي</Th>
              <Th>الحالة</Th>
              <Th></Th>
            </tr>
          </THead>
          <TBody>
            {missions.map((m) => (
              <Tr key={m.id}>
                <Td>{m.foremanName}</Td>
                <Td>{formatDate(m.startDate)}</Td>
                <Td>{m.endDate ? formatDate(m.endDate) : "-"}</Td>
                <TdMono>{formatCurrency(m.advanceAmount)}</TdMono>
                <TdMono>{m.status === "Settled" ? formatCurrency(m.actualSpent) : "-"}</TdMono>
                <Td>
                  <Badge tone={missionStatusTone(m.status)}>{m.status === "Settled" ? "متسواة" : "مفتوحة"}</Badge>
                </Td>
                <Td>
                  {canManage && m.status !== "Settled" && (
                    <button onClick={() => setSettleMission(m)} className="text-primary text-body-sm font-semibold hover:underline">
                      تسوية العهدة
                    </button>
                  )}
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}

      <CreateMissionDialog open={createOpen} onClose={() => setCreateOpen(false)} projectId={projectId} workers={workers} />
      {settleMission && (
        <SettleMissionDialog open={!!settleMission} onClose={() => setSettleMission(null)} mission={settleMission} projectId={projectId} />
      )}
    </div>
  );
}
