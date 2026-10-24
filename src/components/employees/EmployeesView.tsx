"use client";

import { useT } from "@/lib/i18n/client";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExportButton } from "@/components/ui/ExportButton";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency } from "@/lib/utils";
import { useTableState } from "@/lib/useTableState";
import { employeeTypeLabels, wageTypeLabels } from "@/types/enums";
import type { RoleDto } from "@/types/auth";
import type { EmployeeListDTO } from "@/types/employee";
import { CreateWorkerDialog } from "./CreateWorkerDialog";
import { EditEmployeeDialog } from "./EditEmployeeDialog";
import { EmployeeEditDialog } from "./EmployeeEditDialog";
import { RegisterEmployeeDialog } from "./RegisterEmployeeDialog";

function KpiCard({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <Card className="p-stack-md">
      <p className="text-label-caps text-on-surface-variant mb-1">{label}</p>
      <p dir="ltr" className={`text-title-sm text-mono-data text-page-start ${tone ?? "text-on-surface"}`}>
        {value}
      </p>
    </Card>
  );
}

export function EmployeesView({
  employees,
  roles,
  canCreateWorker,
  canRegisterEmployee,
}: {
  employees: EmployeeListDTO[];
  roles: RoleDto[];
  canCreateWorker: boolean;
  canRegisterEmployee: boolean;
}) {
  const t = useT();
  const [workerDialogOpen, setWorkerDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<EmployeeListDTO | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<EmployeeListDTO | null>(null);

  const admins = employees.filter((e) => e.employeeType === 1);
  const workers = employees.filter((e) => e.employeeType === 2);
  const totalAdvances = employees.reduce((sum, e) => sum + e.remainingAdvances, 0);

  const table = useTableState({
    rows: employees,
    pageSize: 10,
    searchPredicate: (e, term) => e.name.toLowerCase().includes(term),
  });

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="flex items-center justify-between flex-wrap gap-stack-sm">
        <div>
          <h1 className="text-headline-md text-on-surface">{t("الموظفين")}</h1>
          <p className="text-body-sm text-on-surface-variant">{t("{0} موظف", [employees.length])}</p>
        </div>
        <div className="flex gap-stack-sm">
          {canRegisterEmployee && (
            <Button variant="secondary" onClick={() => setRegisterDialogOpen(true)}>
              <Icon name="admin_panel_settings" size={18} />
              {t("تسجيل موظف بحساب دخول")}</Button>
          )}
          {canCreateWorker && (
            <Button onClick={() => setWorkerDialogOpen(true)}>
              <Icon name="add" />
              {t("عامل جديد")}</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        <KpiCard label={t("إجمالي الموظفين")} value={String(employees.length)} />
        <KpiCard label={t("إداريون")} value={String(admins.length)} />
        <KpiCard label={t("عمال")} value={String(workers.length)} />
        <KpiCard label={t("سلف قائمة")} value={formatCurrency(totalAdvances)} tone="text-error" />
      </div>

      <div className="flex items-center justify-between gap-stack-sm flex-wrap">
        <SearchInput value={table.search} onChange={table.setSearch} placeholder={t("بحث بالاسم...")} />
        <ExportButton
          filename={t("الموظفين")}
          columns={[
            { header: t("الاسم"), key: "name" },
            { header: t("النوع"), key: "type" },
            { header: t("نوع الأجر"), key: "wageType" },
            { header: t("قيمة الأجر"), key: "wageAmount" },
            { header: t("التأمين"), key: "insuranceAmount" },
            { header: t("مصر للتأمين"), key: "misrInsuranceAmount" },
            { header: t("السلف المتبقية"), key: "advances" },
            { header: t("الحالة"), key: "status" },
          ]}
          rows={table.filteredRows.map((e) => ({
            name: e.name,
            type: e.employeeType === 1 ? employeeTypeLabels.Admin : employeeTypeLabels.Worker,
            wageType: e.wageType === 1 ? wageTypeLabels.Monthly : wageTypeLabels.Daily,
            wageAmount: e.wageAmount,
            insuranceAmount: e.insuranceAmount,
            misrInsuranceAmount: e.misrInsuranceAmount,
            advances: e.remainingAdvances,
            status: e.suspended ? t("موقوف") : t("نشط"),
          }))}
        />
      </div>

      {table.totalCount === 0 ? (
        <EmptyState icon="badge" title={t("لا يوجد موظفين مطابقين")} />
      ) : (
        <>
          <Table>
            <THead>
              <tr>
                <Th>{t("الاسم")}</Th>
                <Th>{t("النوع")}</Th>
                <Th>{t("نوع الأجر")}</Th>
                <Th>{t("قيمة الأجر")}</Th>
                <Th>{t("التأمين")}</Th>
                <Th>{t("مصر للتأمين")}</Th>
                <Th>{t("السلف المتبقية")}</Th>
                <Th>{t("المدير")}</Th>
                <Th>{t("حساب دخول")}</Th>
                <Th>{t("الحالة")}</Th>
                {(canCreateWorker || canRegisterEmployee) && <Th>{t("إجراءات")}</Th>}
              </tr>
            </THead>
            <TBody>
              {table.pageRows.map((e) => (
                <Tr key={e.id}>
                  <Td>
                    <Link href={`/employees/${e.id}`} className="text-primary font-semibold hover:underline">
                      {e.name}
                    </Link>
                  </Td>
                  <Td>{e.employeeType === 1 ? employeeTypeLabels.Admin : employeeTypeLabels.Worker}</Td>
                  <Td>{e.wageType === 1 ? wageTypeLabels.Monthly : wageTypeLabels.Daily}</Td>
                  <TdMono>{formatCurrency(e.wageAmount)}</TdMono>
                  <TdMono>{e.insuranceAmount > 0 ? formatCurrency(e.insuranceAmount) : "-"}</TdMono>
                  <TdMono>{e.misrInsuranceAmount > 0 ? formatCurrency(e.misrInsuranceAmount) : "-"}</TdMono>
                  <TdMono className={e.remainingAdvances > 0 ? "text-error font-semibold" : undefined}>
                    {e.remainingAdvances > 0 ? formatCurrency(e.remainingAdvances) : "-"}
                  </TdMono>
                  <Td>{e.managerName ?? "-"}</Td>
                  <Td>{e.hasLoginAccount ? <Badge tone="info">{t("نعم")}</Badge> : <Badge tone="neutral">{t("لا")}</Badge>}</Td>
                  <Td>{e.suspended ? <Badge tone="error">{t("موقوف")}</Badge> : <Badge tone="success">{t("نشط")}</Badge>}</Td>
                  {(canCreateWorker || canRegisterEmployee) && (
                    <Td>
                      {e.hasLoginAccount
                        ? canRegisterEmployee && (
                            <button className="text-on-surface-variant hover:text-on-surface" title={t("تعديل")} onClick={() => setEditingAdmin(e)}>
                              <Icon name="edit" size={18} />
                            </button>
                          )
                        : canCreateWorker && (
                            <button className="text-on-surface-variant hover:text-on-surface" title={t("تعديل")} onClick={() => setEditingWorker(e)}>
                              <Icon name="edit" size={18} />
                            </button>
                          )}
                    </Td>
                  )}
                </Tr>
              ))}
            </TBody>
          </Table>
          <Pagination page={table.page} pageSize={table.pageSize} totalCount={table.totalCount} onPageChange={table.setPage} />
        </>
      )}

      <CreateWorkerDialog open={workerDialogOpen} onClose={() => setWorkerDialogOpen(false)} />
      <RegisterEmployeeDialog open={registerDialogOpen} onClose={() => setRegisterDialogOpen(false)} roles={roles} />
      <EmployeeEditDialog open={!!editingWorker} onClose={() => setEditingWorker(null)} employee={editingWorker} />
      <EditEmployeeDialog open={!!editingAdmin} onClose={() => setEditingAdmin(null)} employee={editingAdmin} roles={roles} />
    </div>
  );
}
