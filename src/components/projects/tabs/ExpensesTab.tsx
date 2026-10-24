"use client";

import { useT } from "@/lib/i18n/client";
import type { TFunction } from "@/lib/i18n/translate";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { deleteCustody } from "@/actions/custody";
import { deleteProjectExpense } from "@/actions/projects";
import { CustodyDialog } from "@/components/cashbox/CustodyDialog";
import { SettleCustodyDialog } from "@/components/cashbox/SettleCustodyDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { useTableState } from "@/lib/useTableState";
import { expenseCategoryLabels } from "@/types/enums";
import type { CustodyDTO } from "@/types/custody";
import type { EmployeeListDTO } from "@/types/employee";
import type { MissionDetailsDTO } from "@/types/mission";
import type { ProjectDetailsDTO, ProjectExpenseDTO, ProjectListDTO } from "@/types/project";
import { EditExpenseDialog, RecordExpenseDialog } from "./ExpenseDialogs";
import { SettleMissionDialog } from "./SettleMissionDialog";

type RowKind = "expense" | "mission" | "custody";

/** صف موحد في جدول مصاريف المشروع - بيجمع المصروف النثري وعهدة المأمورية والعهدة الجانبية في مكان واحد */
interface CostRow {
  key: string;
  kind: RowKind;
  title: string;
  details: string;
  /** القيمة اللي بتتحسب فعليًا على المشروع */
  amount: number;
  /** سطر توضيحي تحت القيمة (مثلًا: العهدة المصروفة مقابل المصروف الفعلي) */
  amountHint?: string;
  date: string;
  status?: { label: string; tone: "success" | "warning" };
  expense?: ProjectExpenseDTO;
  mission?: MissionDetailsDTO;
  custody?: CustodyDTO;
}

const kindMeta: Record<RowKind, { label: string; icon: string }> = {
  expense: { label: "مصروف نثري", icon: "receipt_long" },
  mission: { label: "عهدة مأمورية", icon: "engineering" },
  custody: { label: "عهدة جانبية", icon: "wallet" },
};

function buildRows(project: ProjectDetailsDTO, missions: MissionDetailsDTO[], t: TFunction): CostRow[] {
  const rows: CostRow[] = [];

  for (const e of project.expenses) {
    rows.push({
      key: `e-${e.id}`,
      kind: "expense",
      title: t(expenseCategoryLabels[e.category] ?? e.category),
      details: e.description ?? "-",
      amount: e.amount,
      date: e.expenseDate,
      expense: e,
    });
  }

  // نفس منطق الباك اند (Project.TotalMissionCustodyCost): قبل التسوية بقيمة العهدة كاملة،
  // وبعدها بالمصروف الفعلي لحد قيمة العهدة - الزيادة بتظهر لوحدها كمصروف "فرق تسوية عهدة"
  for (const m of missions) {
    if (m.advanceAmount <= 0) continue;
    const settled = m.status === "Settled";
    rows.push({
      key: `m-${m.id}`,
      kind: "mission",
      title: t("عهدة مأمورية"),
      details: t("رئيس العمال: {0}", [m.foremanName]),
      amount: settled ? Math.min(m.actualSpent, m.advanceAmount) : m.advanceAmount,
      amountHint: settled ? t("العهدة {0} · المصروف {1}", [formatCurrency(m.advanceAmount), formatCurrency(m.actualSpent)]) : t("محسوبة بالكامل لحد التسوية"),
      date: m.startDate,
      status: settled ? { label: t("متسواة"), tone: "success" } : { label: t("مفتوحة"), tone: "warning" },
      mission: m,
    });
  }

  for (const c of project.custodies) {
    const settled = c.status === "Settled";
    rows.push({
      key: `c-${c.id}`,
      kind: "custody",
      title: t("عهدة جانبية"),
      details: `${c.employeeName} — ${c.description}`,
      amount: settled ? (c.settledAmount ?? c.amount) : c.amount,
      amountHint: settled ? t("العهدة {0} · المصروف {1}", [formatCurrency(c.amount), formatCurrency(c.settledAmount ?? c.amount)]) : t("محسوبة بالكامل لحد التسوية"),
      date: c.issueDate,
      status: settled ? { label: t("متسواة"), tone: "success" } : { label: t("نشطة"), tone: "warning" },
      custody: c,
    });
  }

  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

function SummaryCard({ label, value, icon, active, onClick }: { label: string; value: number; icon: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-start bg-surface-container-lowest border rounded-lg p-stack-md shadow-soft transition-colors",
        active ? "border-primary ring-1 ring-primary" : "border-outline-variant hover:border-primary/50",
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-on-surface-variant">{label}</span>
        <Icon name={icon} size={16} className="text-on-surface-variant" />
      </div>
      <p dir="ltr" className="text-title-sm text-mono-data text-on-surface text-page-start">
        {formatCurrency(value)}
      </p>
    </button>
  );
}

export function ExpensesTab({
  project,
  missions,
  employees,
  canManage,
}: {
  project: ProjectDetailsDTO;
  missions: MissionDetailsDTO[];
  employees: EmployeeListDTO[];
  canManage: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const projectId = project.id;
  const [kindFilter, setKindFilter] = useState<RowKind | "all">("all");
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ProjectExpenseDTO | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<ProjectExpenseDTO | null>(null);
  const [custodyOpen, setCustodyOpen] = useState(false);
  const [editingCustody, setEditingCustody] = useState<CustodyDTO | undefined>(undefined);
  const [settlingCustody, setSettlingCustody] = useState<CustodyDTO | null>(null);
  const [deletingCustody, setDeletingCustody] = useState<CustodyDTO | null>(null);
  const [settlingMission, setSettlingMission] = useState<MissionDetailsDTO | null>(null);

  const allRows = useMemo(() => buildRows(project, missions, t), [project, missions, t]);
  const rows = kindFilter === "all" ? allRows : allRows.filter((r) => r.kind === kindFilter);
  const grandTotal = project.totalPettyExpenses + project.totalCustodyCost;
  const filteredTotal = rows.reduce((sum, r) => sum + r.amount, 0);
  // المشروع الحالي بس هو اللي بيظهر في اختيار المشروع جوه دايلوج العهدة (مثبت عليه)
  const projectAsList: ProjectListDTO[] = [project];

  const table = useTableState({
    rows,
    pageSize: 10,
    searchPredicate: (r, term) => r.title.toLowerCase().includes(term) || r.details.toLowerCase().includes(term),
  });

  const toggle = (kind: RowKind) => setKindFilter((current) => (current === kind ? "all" : kind));

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        <SummaryCard label={t("مصاريف نثرية")} value={project.totalPettyExpenses} icon="receipt_long" active={kindFilter === "expense"} onClick={() => toggle("expense")} />
        <SummaryCard label={t("عهد المأموريات")} value={project.totalMissionCustodyCost} icon="engineering" active={kindFilter === "mission"} onClick={() => toggle("mission")} />
        <SummaryCard label={t("عهد جانبية")} value={project.totalSideCustodyCost} icon="wallet" active={kindFilter === "custody"} onClick={() => toggle("custody")} />
        <SummaryCard label={t("إجمالي المصاريف")} value={grandTotal} icon="functions" active={kindFilter === "all"} onClick={() => setKindFilter("all")} />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-stack-sm">
        <div className="flex items-center gap-stack-sm flex-wrap">
          {allRows.length > 0 && <SearchInput value={table.search} onChange={table.setSearch} placeholder={t("بحث بالوصف أو التصنيف أو الموظف...")} />}
          {kindFilter !== "all" && (
            <button type="button" onClick={() => setKindFilter("all")} className="text-xs text-primary font-semibold flex items-center gap-1">
              <Icon name="filter_alt_off" size={16} />
              {t("عرض الكل")}</button>
          )}
        </div>
        {canManage && (
          <div className="flex gap-stack-sm">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setEditingCustody(undefined);
                setCustodyOpen(true);
              }}
            >
              <Icon name="wallet" size={18} />
              {t("صرف عهدة")}</Button>
            <Button size="sm" onClick={() => setExpenseOpen(true)}>
              <Icon name="add" size={18} />
              {t("مصروف جديد")}</Button>
          </div>
        )}
      </div>

      {allRows.length === 0 ? (
        <EmptyState icon="receipt_long" title={t("لا توجد مصاريف أو عهد مسجلة على المشروع بعد")} />
      ) : table.totalCount === 0 ? (
        <EmptyState icon="search_off" title={t("لا توجد نتائج مطابقة")} />
      ) : (
        <>
          <Table>
            <THead>
              <tr>
                <Th>{t("النوع")}</Th>
                <Th>{t("البيان")}</Th>
                <Th>{t("التفاصيل")}</Th>
                <Th>{t("القيمة على المشروع")}</Th>
                <Th>{t("الحالة")}</Th>
                <Th>{t("التاريخ")}</Th>
                {canManage && <Th>{t("إجراءات")}</Th>}
              </tr>
            </THead>
            <TBody>
              {table.pageRows.map((r) => (
                <Tr key={r.key}>
                  <Td>
                    <span className="flex items-center gap-1.5 text-on-surface-variant whitespace-nowrap">
                      <Icon name={kindMeta[r.kind].icon} size={16} />
                      {t(kindMeta[r.kind].label)}
                    </span>
                  </Td>
                  <Td>{r.title}</Td>
                  <Td>{r.details}</Td>
                  <TdMono>
                    <div>{formatCurrency(r.amount)}</div>
                    {r.amountHint && <div className="text-[11px] text-on-surface-variant font-sans">{r.amountHint}</div>}
                  </TdMono>
                  <Td>{r.status ? <Badge tone={r.status.tone}>{r.status.label}</Badge> : "-"}</Td>
                  <Td>{formatDate(r.date)}</Td>
                  {canManage && (
                    <Td>
                      <RowActions
                        row={r}
                        onEditExpense={setEditingExpense}
                        onDeleteExpense={setDeletingExpense}
                        onSettleMission={setSettlingMission}
                        onSettleCustody={setSettlingCustody}
                        onEditCustody={(c) => {
                          setEditingCustody(c);
                          setCustodyOpen(true);
                        }}
                        onDeleteCustody={setDeletingCustody}
                      />
                    </Td>
                  )}
                </Tr>
              ))}
              <tr className="bg-surface-container-low font-semibold">
                <td colSpan={3} className="px-gutter py-stack-sm text-body-sm text-on-surface">
                  {kindFilter === "all" ? t("الإجمالي") : t("إجمالي {0}", [t(kindMeta[kindFilter].label)])}
                </td>
                <td dir="ltr" className="px-gutter py-stack-sm text-mono-data text-on-surface text-page-start">
                  {formatCurrency(filteredTotal)}
                </td>
                <td colSpan={canManage ? 3 : 2} />
              </tr>
            </TBody>
          </Table>
          <Pagination page={table.page} pageSize={table.pageSize} totalCount={table.totalCount} onPageChange={table.setPage} />
        </>
      )}

      <p className="text-xs text-on-surface-variant">
        {t("العهدة (مأمورية أو جانبية) بتتحسب على المشروع بقيمتها كاملة من وقت صرفها، ولما تتسوى بتتحسب بالمصروف الفعلي. أي زيادة في مصروف المأمورية عن العهدة بتظهر كمصروف نثري منفصل باسم \"فرق تسوية عهدة\".")}</p>

      <RecordExpenseDialog open={expenseOpen} onClose={() => setExpenseOpen(false)} projectId={projectId} />
      <EditExpenseDialog open={!!editingExpense} onClose={() => setEditingExpense(null)} projectId={projectId} expense={editingExpense} />
      <ConfirmDialog
        open={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
        title={t("حذف المصروف")}
        message={t("هل أنت متأكد من حذف هذا المصروف؟ سيتم إلغاء أثره في الخزنة لو كان مخصومًا منها.")}
        onConfirm={() => deleteProjectExpense(deletingExpense!.id, projectId)}
        onConfirmed={() => router.refresh()}
      />

      <CustodyDialog
        open={custodyOpen}
        onClose={() => {
          setCustodyOpen(false);
          setEditingCustody(undefined);
        }}
        employees={employees}
        projects={projectAsList}
        custody={editingCustody}
        fixedProjectId={projectId}
      />
      <SettleCustodyDialog open={!!settlingCustody} onClose={() => setSettlingCustody(null)} custody={settlingCustody} />
      <ConfirmDialog
        open={!!deletingCustody}
        onClose={() => setDeletingCustody(null)}
        title={t("حذف العهدة")}
        message={t("هل أنت متأكد من حذف هذه العهدة؟ سيتم إلغاء أثرها في الخزنة (الصرف وأي فرق تسوية) وهتتشال من مصاريف المشروع.")}
        onConfirm={() => deleteCustody(deletingCustody!.id)}
        onConfirmed={() => router.refresh()}
      />
      {settlingMission && <SettleMissionDialog open onClose={() => setSettlingMission(null)} mission={settlingMission} projectId={projectId} />}
    </div>
  );
}

function RowActions({
  row,
  onEditExpense,
  onDeleteExpense,
  onSettleMission,
  onSettleCustody,
  onEditCustody,
  onDeleteCustody,
}: {
  row: CostRow;
  onEditExpense: (e: ProjectExpenseDTO) => void;
  onDeleteExpense: (e: ProjectExpenseDTO) => void;
  onSettleMission: (m: MissionDetailsDTO) => void;
  onSettleCustody: (c: CustodyDTO) => void;
  onEditCustody: (c: CustodyDTO) => void;
  onDeleteCustody: (c: CustodyDTO) => void;
}) {
  const t = useT();
  if (row.expense) {
    const e = row.expense;
    return (
      <div className="flex items-center gap-1">
        <button className="text-on-surface-variant hover:text-on-surface" title={t("تعديل")} onClick={() => onEditExpense(e)}>
          <Icon name="edit" size={18} />
        </button>
        <button className="text-error hover:opacity-80" title={t("حذف")} onClick={() => onDeleteExpense(e)}>
          <Icon name="delete" size={18} />
        </button>
      </div>
    );
  }

  if (row.mission) {
    const m = row.mission;
    return m.status !== "Settled" ? (
      <button onClick={() => onSettleMission(m)} className="text-primary text-body-sm font-semibold hover:underline">
        {t("تسوية")}</button>
    ) : (
      <span className="text-xs text-on-surface-variant">{t("من تابة المأموريات")}</span>
    );
  }

  if (row.custody) {
    const c = row.custody;
    return (
      <div className="flex items-center gap-2">
        {c.status === "Active" && (
          <button onClick={() => onSettleCustody(c)} className="text-primary text-body-sm font-semibold hover:underline">
            {t("تسوية")}</button>
        )}
        <button className="text-on-surface-variant hover:text-on-surface" title={t("تعديل")} onClick={() => onEditCustody(c)}>
          <Icon name="edit" size={18} />
        </button>
        <button className="text-error hover:opacity-80" title={t("حذف")} onClick={() => onDeleteCustody(c)}>
          <Icon name="delete" size={18} />
        </button>
      </div>
    );
  }

  return null;
}
