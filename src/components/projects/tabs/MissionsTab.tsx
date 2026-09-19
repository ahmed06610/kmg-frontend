"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteMission } from "@/actions/missions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { missionStatusTone } from "@/lib/status-tone";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTableState } from "@/lib/useTableState";
import type { EmployeeListDTO } from "@/types/employee";
import type { MissionListDTO } from "@/types/mission";
import { CreateMissionDialog } from "./CreateMissionDialog";
import { MissionEditDialog } from "./MissionEditDialog";
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
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [settleMission, setSettleMission] = useState<MissionListDTO | null>(null);
  const [editingMission, setEditingMission] = useState<MissionListDTO | null>(null);
  const [deletingMission, setDeletingMission] = useState<MissionListDTO | null>(null);

  const table = useTableState({
    rows: missions,
    pageSize: 10,
    searchPredicate: (m, term) => m.foremanName.toLowerCase().includes(term),
  });

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex items-center justify-between gap-stack-sm flex-wrap">
        {missions.length > 0 && <SearchInput value={table.search} onChange={table.setSearch} placeholder="بحث برئيس العمال..." />}
        {canManage && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Icon name="add" size={18} />
            مأمورية جديدة
          </Button>
        )}
      </div>

      {missions.length === 0 ? (
        <EmptyState icon="engineering" title="لا توجد مأموريات لهذا المشروع بعد" />
      ) : table.totalCount === 0 ? (
        <EmptyState icon="search_off" title="لا توجد نتائج مطابقة" />
      ) : (
        <>
        <Table>
          <THead>
            <tr>
              <Th>رئيس العمال</Th>
              <Th>البداية</Th>
              <Th>النهاية</Th>
              <Th>العهدة</Th>
              <Th>المصروف الفعلي</Th>
              <Th>الحالة</Th>
              <Th>إجراءات</Th>
            </tr>
          </THead>
          <TBody>
            {table.pageRows.map((m) => (
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
                  <div className="flex items-center gap-2">
                    {canManage && m.status !== "Settled" && (
                      <>
                        <button onClick={() => setSettleMission(m)} className="text-primary text-body-sm font-semibold hover:underline">
                          تسوية العهدة
                        </button>
                        <button className="text-on-surface-variant hover:text-on-surface" title="تعديل" onClick={() => setEditingMission(m)}>
                          <Icon name="edit" size={18} />
                        </button>
                      </>
                    )}
                    {canManage && (
                      <button className="text-error hover:opacity-80" title="حذف" onClick={() => setDeletingMission(m)}>
                        <Icon name="delete" size={18} />
                      </button>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
        <Pagination page={table.page} pageSize={table.pageSize} totalCount={table.totalCount} onPageChange={table.setPage} />
        </>
      )}

      <CreateMissionDialog open={createOpen} onClose={() => setCreateOpen(false)} projectId={projectId} workers={workers} />
      {settleMission && (
        <SettleMissionDialog open={!!settleMission} onClose={() => setSettleMission(null)} mission={settleMission} projectId={projectId} />
      )}
      <MissionEditDialog open={!!editingMission} onClose={() => setEditingMission(null)} mission={editingMission} projectId={projectId} workers={workers} />
      <ConfirmDialog
        open={!!deletingMission}
        onClose={() => setDeletingMission(null)}
        title="حذف المأمورية"
        message="هل أنت متأكد من حذف هذه المأمورية؟ سيتم إلغاء أي أثر لها في الخزنة."
        onConfirm={() => deleteMission(deletingMission!.id, projectId)}
        onConfirmed={() => router.refresh()}
      />
    </div>
  );
}
