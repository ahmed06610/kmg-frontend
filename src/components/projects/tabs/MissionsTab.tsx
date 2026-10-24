"use client";

import { useT } from "@/lib/i18n/client";
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
import type { MissionDetailsDTO } from "@/types/mission";
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
  missions: MissionDetailsDTO[];
  workers: EmployeeListDTO[];
  canManage: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [settleMission, setSettleMission] = useState<MissionDetailsDTO | null>(null);
  const [editingMission, setEditingMission] = useState<MissionDetailsDTO | null>(null);
  const [deletingMission, setDeletingMission] = useState<MissionDetailsDTO | null>(null);

  const table = useTableState({
    rows: missions,
    pageSize: 10,
    searchPredicate: (m, term) => m.foremanName.toLowerCase().includes(term),
  });

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex items-center justify-between gap-stack-sm flex-wrap">
        {missions.length > 0 && <SearchInput value={table.search} onChange={table.setSearch} placeholder={t("بحث برئيس العمال...")} />}
        {canManage && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Icon name="add" size={18} />
            {t("مأمورية جديدة")}</Button>
        )}
      </div>

      {missions.length === 0 ? (
        <EmptyState icon="engineering" title={t("لا توجد مأموريات لهذا المشروع بعد")} />
      ) : table.totalCount === 0 ? (
        <EmptyState icon="search_off" title={t("لا توجد نتائج مطابقة")} />
      ) : (
        <>
        <Table>
          <THead>
            <tr>
              <Th>{t("رئيس العمال")}</Th>
              <Th>{t("البداية")}</Th>
              <Th>{t("النهاية")}</Th>
              <Th>{t("العهدة")}</Th>
              <Th>{t("المصروف الفعلي")}</Th>
              <Th>{t("الحالة")}</Th>
              <Th>{t("إجراءات")}</Th>
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
                  <Badge tone={missionStatusTone(m.status)}>{m.status === "Settled" ? t("متسواة") : t("مفتوحة")}</Badge>
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    {canManage && m.status !== "Settled" && (
                      <>
                        <button onClick={() => setSettleMission(m)} className="text-primary text-body-sm font-semibold hover:underline">
                          {t("تسوية العهدة")}</button>
                        <button className="text-on-surface-variant hover:text-on-surface" title={t("تعديل")} onClick={() => setEditingMission(m)}>
                          <Icon name="edit" size={18} />
                        </button>
                      </>
                    )}
                    {canManage && (
                      <button className="text-error hover:opacity-80" title={t("حذف")} onClick={() => setDeletingMission(m)}>
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
        title={t("حذف المأمورية")}
        message={t("هل أنت متأكد من حذف هذه المأمورية؟ سيتم إلغاء أي أثر لها في الخزنة.")}
        onConfirm={() => deleteMission(deletingMission!.id, projectId)}
        onConfirmed={() => router.refresh()}
      />
    </div>
  );
}
