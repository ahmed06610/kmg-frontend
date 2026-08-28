"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { createAdjustment } from "@/actions/payroll";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldGroup, Input, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createAdjustmentSchema, type CreateAdjustmentFormValues } from "@/schema/payroll";
import { AdjustmentType, adjustmentTypeLabels } from "@/types/enums";
import type { EmployeeListDTO } from "@/types/employee";
import type { PayrollAdjustmentDTO } from "@/types/payroll";

export function AdjustmentsSection({ adjustments, employees, canManage }: { adjustments: PayrollAdjustmentDTO[]; employees: EmployeeListDTO[]; canManage: boolean }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex items-center justify-end">
        {canManage && (
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Icon name="add" size={18} />
            خصم / حافز جديد
          </Button>
        )}
      </div>

      {adjustments.length === 0 ? (
        <EmptyState icon="tune" title="لا توجد خصومات أو حوافز مسجلة بعد" />
      ) : (
        <Table>
          <THead>
            <tr>
              <Th>الموظف</Th>
              <Th>النوع</Th>
              <Th>القيمة</Th>
              <Th>السبب</Th>
              <Th>التاريخ</Th>
              <Th>مُطبَّق</Th>
            </tr>
          </THead>
          <TBody>
            {adjustments.map((a) => (
              <Tr key={a.id}>
                <Td>{a.employeeName}</Td>
                <Td>
                  <Badge tone={a.type === "Bonus" ? "success" : "error"}>{adjustmentTypeLabels[a.type] ?? a.type}</Badge>
                </Td>
                <TdMono>{formatCurrency(a.amount)}</TdMono>
                <Td>{a.reason}</Td>
                <Td>{formatDate(a.date)}</Td>
                <Td>{a.applied ? "نعم" : "لا"}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}

      <CreateAdjustmentDialog open={dialogOpen} onClose={() => setDialogOpen(false)} employees={employees} />
    </div>
  );
}

function CreateAdjustmentDialog({ open, onClose, employees }: { open: boolean; onClose: () => void; employees: EmployeeListDTO[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAdjustmentFormValues>({
    resolver: zodResolver(createAdjustmentSchema),
    defaultValues: { employeeId: 0, type: 0, amount: 0, reason: "", date: new Date().toISOString().slice(0, 10) },
  });

  const onSubmit = async (data: CreateAdjustmentFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await createAdjustment(data);
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
      title="إضافة خصم أو حافز"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="create-adjustment-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </>
      }
    >
      <form id="create-adjustment-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
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
          <FieldGroup label="النوع" error={errors.type?.message}>
            <Select {...register("type", { valueAsNumber: true })}>
              <option value={0}>اختر النوع</option>
              <option value={AdjustmentType.Deduction}>خصم</option>
              <option value={AdjustmentType.Bonus}>حافز</option>
            </Select>
          </FieldGroup>
          <FieldGroup label="القيمة" error={errors.amount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("amount", { valueAsNumber: true })} />
          </FieldGroup>
        </div>
        <FieldGroup label="السبب" error={errors.reason?.message}>
          <Input {...register("reason")} />
        </FieldGroup>
        <FieldGroup label="التاريخ" error={errors.date?.message}>
          <Input type="date" {...register("date")} />
        </FieldGroup>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
