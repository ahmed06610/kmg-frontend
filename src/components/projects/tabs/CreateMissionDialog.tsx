"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { createMission } from "@/actions/missions";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/utils";
import { createMissionSchema, type CreateMissionFormValues } from "@/schema/mission";
import type { EmployeeListDTO } from "@/types/employee";

export function CreateMissionDialog({ open, onClose, projectId, workers }: { open: boolean; onClose: () => void; projectId: number; workers: EmployeeListDTO[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateMissionFormValues>({
    resolver: zodResolver(createMissionSchema),
    defaultValues: { foremanEmployeeId: 0, startDate: formatDate(new Date()), advanceAmount: 0, notes: "", workers: [{ employeeId: 0, daysCount: 1 }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "workers" });

  const onSubmit = async (data: CreateMissionFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await createMission({ projectId, ...data, notes: data.notes || null });
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
      title="مأمورية جديدة"
      maxWidth="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="create-mission-form" disabled={loading}>
            {loading ? "جاري الإنشاء..." : "إنشاء المأمورية"}
          </Button>
        </>
      }
    >
      <form id="create-mission-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="رئيس العمال" error={errors.foremanEmployeeId?.message}>
          <Select {...register("foremanEmployeeId", { valueAsNumber: true })}>
            <option value={0}>اختر رئيس عمال</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <div className="grid grid-cols-2 gap-stack-md">
          <FieldGroup label="تاريخ البداية" error={errors.startDate?.message}>
            <Input type="date" {...register("startDate")} />
          </FieldGroup>
          <FieldGroup label="قيمة العهدة" error={errors.advanceAmount?.message}>
            <Input type="number" step="0.01" dir="ltr" {...register("advanceAmount", { valueAsNumber: true })} />
          </FieldGroup>
        </div>

        <FieldGroup label="ملاحظات" error={errors.notes?.message}>
          <Input {...register("notes")} />
        </FieldGroup>

        <div className="flex flex-col gap-stack-sm">
          <div className="flex items-center justify-between">
            <span className="text-label-caps text-on-surface-variant">العمال المشاركين</span>
            <button
              type="button"
              onClick={() => append({ employeeId: 0, daysCount: 1 })}
              className="text-primary text-body-sm font-semibold flex items-center gap-1"
            >
              <Icon name="add" size={16} />
              إضافة عامل
            </button>
          </div>
          {errors.workers?.message && <p className="text-error text-xs">{errors.workers.message}</p>}

          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-stack-sm">
              <Select {...register(`workers.${index}.employeeId`, { valueAsNumber: true })} className="flex-1">
                <option value={0}>اختر عامل</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </Select>
              <Input
                type="number"
                dir="ltr"
                placeholder="عدد الأيام"
                className="w-28"
                {...register(`workers.${index}.daysCount`, { valueAsNumber: true })}
              />
              <button type="button" onClick={() => remove(index)} className="text-error shrink-0" aria-label="حذف">
                <Icon name="delete" size={18} />
              </button>
            </div>
          ))}
        </div>

        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
