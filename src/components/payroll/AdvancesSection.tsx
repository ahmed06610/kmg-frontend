"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { createAdvance } from "@/actions/payroll";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldGroup, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { advanceStatusTone } from "@/lib/status-tone";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createAdvanceSchema, type CreateAdvanceFormValues } from "@/schema/payroll";
import type { EmployeeListDTO } from "@/types/employee";
import type { AdvanceDTO } from "@/types/payroll";

export function AdvancesSection({ advances, employees, canManage }: { advances: AdvanceDTO[]; employees: EmployeeListDTO[]; canManage: boolean }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex items-center justify-end">
        {canManage && (
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Icon name="add" size={18} />
            سلفة جديدة
          </Button>
        )}
      </div>

      {advances.length === 0 ? (
        <EmptyState icon="account_balance" title="لا توجد سلف مسجلة بعد" />
      ) : (
        <Table>
          <THead>
            <tr>
              <Th>الموظف</Th>
              <Th>المبلغ الكلي</Th>
              <Th>القسط</Th>
              <Th>المتبقي</Th>
              <Th>التاريخ</Th>
              <Th>الحالة</Th>
            </tr>
          </THead>
          <TBody>
            {advances.map((a) => (
              <Tr key={a.id}>
                <Td>{a.employeeName}</Td>
                <TdMono>{formatCurrency(a.totalAmount)}</TdMono>
                <TdMono>{formatCurrency(a.installmentAmount)}</TdMono>
                <TdMono>{formatCurrency(a.remainingAmount)}</TdMono>
                <Td>{formatDate(a.issueDate)}</Td>
                <Td>
                  <Badge tone={advanceStatusTone(a.status)}>{a.status === "Settled" ? "مسددة" : "نشطة"}</Badge>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}

      <CreateAdvanceDialog open={dialogOpen} onClose={() => setDialogOpen(false)} employees={employees} />
    </div>
  );
}

function CreateAdvanceDialog({ open, onClose, employees }: { open: boolean; onClose: () => void; employees: EmployeeListDTO[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAdvanceFormValues>({
    resolver: zodResolver(createAdvanceSchema),
    defaultValues: { employeeId: 0, totalAmount: 0, installmentAmount: 0, notes: "" },
  });

  const onSubmit = async (data: CreateAdvanceFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await createAdvance({ ...data, notes: data.notes || null });
    setLoading(false);
    if (!result.success) {
      setServerError(result.message ?? "حدث خطأ");
      return;
    }
    reset();
    onClose();
    router.refresh();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="سلفة جديدة"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="create-advance-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "تسليم السلفة"}
          </Button>
        </>
      }
    >
      <form id="create-advance-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="الموظف" error={errors.employeeId?.message}>
          <Controller
            name="employeeId"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value ? String(field.value) : ""}
                onChange={(v) => field.onChange(Number(v))}
                placeholder="اختر موظف"
                options={employees.map((e) => ({ value: String(e.id), label: e.name }))}
              />
            )}
          />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label="قيمة السلفة" error={errors.totalAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("totalAmount", { valueAsNumber: true })} />
          </FieldGroup>
          <FieldGroup label="قيمة القسط الأسبوعي" error={errors.installmentAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("installmentAmount", { valueAsNumber: true })} />
          </FieldGroup>
        </div>
        <FieldGroup label="ملاحظات" error={errors.notes?.message}>
          <Input {...register("notes")} />
        </FieldGroup>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
