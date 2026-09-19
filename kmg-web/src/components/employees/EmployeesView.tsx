"use client";

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
import { RegisterEmployeeDialog } from "./RegisterEmployeeDialog";

function KpiCard({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <Card className="p-stack-md">
      <p className="text-label-caps text-on-surface-variant mb-1">{label}</p>
      <p dir="ltr" className={`text-title-sm text-mono-data text-right ${tone ?? "text-on-surface"}`}>
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
  const [workerDialogOpen, setWorkerDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);

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
          <h1 className="text-headline-md text-on-surface">الموظفين</h1>
          <p className="text-body-sm text-on-surface-variant">{employees.length} موظف</p>
        </div>
        <div className="flex gap-stack-sm">
          {canRegisterEmployee && (
            <Button variant="secondary" onClick={() => setRegisterDialogOpen(true)}>
              <Icon name="admin_panel_settings" size={18} />
              تسجيل موظف بحساب دخول
            </Button>
          )}
          {canCreateWorker && (
            <Button onClick={() => setWorkerDialogOpen(true)}>
              <Icon name="add" />
              عامل جديد
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        <KpiCard label="إجمالي الموظفين" value={String(employees.length)} />
        <KpiCard label="إداريون" value={String(admins.length)} />
        <KpiCard label="عمال" value={String(workers.length)} />
        <KpiCard label="سلف قائمة" value={formatCurrency(totalAdvances)} tone="text-error" />
      </div>

      <div className="flex items-center justify-between gap-stack-sm flex-wrap">
        <SearchInput value={table.search} onChange={table.setSearch} placeholder="بحث بالاسم..." />
        <ExportButton
          filename="الموظفين"
          columns={[
            { header: "الاسم", key: "name" },
            { header: "النوع", key: "type" },
            { header: "نوع الأجر", key: "wageType" },
            { header: "قيمة الأجر", key: "wageAmount" },
            { header: "السلف المتبقية", key: "advances" },
            { header: "الحالة", key: "status" },
          ]}
          rows={table.filteredRows.map((e) => ({
            name: e.name,
            type: e.employeeType === 1 ? employeeTypeLabels.Admin : employeeTypeLabels.Worker,
            wageType: e.wageType === 1 ? wageTypeLabels.Monthly : wageTypeLabels.Daily,
            wageAmount: e.wageAmount,
            advances: e.remainingAdvances,
            status: e.suspended ? "موقوف" : "نشط",
          }))}
        />
      </div>

      {table.totalCount === 0 ? (
        <EmptyState icon="badge" title="لا يوجد موظفين مطابقين" />
      ) : (
        <>
          <Table>
            <THead>
              <tr>
                <Th>الاسم</Th>
                <Th>النوع</Th>
                <Th>نوع الأجر</Th>
                <Th>قيمة الأجر</Th>
                <Th>السلف المتبقية</Th>
                <Th>المدير</Th>
                <Th>حساب دخول</Th>
                <Th>الحالة</Th>
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
                  <TdMono className={e.remainingAdvances > 0 ? "text-error font-semibold" : undefined}>
                    {e.remainingAdvances > 0 ? formatCurrency(e.remainingAdvances) : "-"}
                  </TdMono>
                  <Td>{e.managerName ?? "-"}</Td>
                  <Td>{e.hasLoginAccount ? <Badge tone="info">نعم</Badge> : <Badge tone="neutral">لا</Badge>}</Td>
                  <Td>{e.suspended ? <Badge tone="error">موقوف</Badge> : <Badge tone="success">نشط</Badge>}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          <Pagination page={table.page} pageSize={table.pageSize} totalCount={table.totalCount} onPageChange={table.setPage} />
        </>
      )}

      <CreateWorkerDialog open={workerDialogOpen} onClose={() => setWorkerDialogOpen(false)} />
      <RegisterEmployeeDialog open={registerDialogOpen} onClose={() => setRegisterDialogOpen(false)} roles={roles} />
    </div>
  );
}
