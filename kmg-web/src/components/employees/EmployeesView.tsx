"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency } from "@/lib/utils";
import { employeeTypeLabels, wageTypeLabels } from "@/types/enums";
import type { RoleDto } from "@/types/auth";
import type { EmployeeListDTO } from "@/types/employee";
import { CreateWorkerDialog } from "./CreateWorkerDialog";
import { RegisterEmployeeDialog } from "./RegisterEmployeeDialog";

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

      {employees.length === 0 ? (
        <EmptyState icon="badge" title="لا يوجد موظفين بعد" />
      ) : (
        <Table>
          <THead>
            <tr>
              <Th>الاسم</Th>
              <Th>النوع</Th>
              <Th>نوع الأجر</Th>
              <Th>قيمة الأجر</Th>
              <Th>المدير</Th>
              <Th>حساب دخول</Th>
              <Th>الحالة</Th>
            </tr>
          </THead>
          <TBody>
            {employees.map((e) => (
              <Tr key={e.id}>
                <Td>
                  <Link href={`/employees/${e.id}`} className="text-primary font-semibold hover:underline">
                    {e.name}
                  </Link>
                </Td>
                <Td>{e.employeeType === 1 ? employeeTypeLabels.Admin : employeeTypeLabels.Worker}</Td>
                <Td>{e.wageType === 1 ? wageTypeLabels.Monthly : wageTypeLabels.Daily}</Td>
                <TdMono>{formatCurrency(e.wageAmount)}</TdMono>
                <Td>{e.managerName ?? "-"}</Td>
                <Td>{e.hasLoginAccount ? <Badge tone="info">نعم</Badge> : <Badge tone="neutral">لا</Badge>}</Td>
                <Td>{e.suspended ? <Badge tone="error">موقوف</Badge> : <Badge tone="success">نشط</Badge>}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}

      <CreateWorkerDialog open={workerDialogOpen} onClose={() => setWorkerDialogOpen(false)} />
      <RegisterEmployeeDialog open={registerDialogOpen} onClose={() => setRegisterDialogOpen(false)} roles={roles} />
    </div>
  );
}
