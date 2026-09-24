"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { updateMission } from "@/actions/missions";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/utils";
import { updateMissionSchema, type UpdateMissionFormValues } from "@/schema/mission";
import type { EmployeeListDTO } from "@/types/employee";
import type { MissionDetailsDTO } from "@/types/mission";

export function MissionEditDialog({
  open,
  onClose,
  mission,
  projectId,
  workers,
}: {
  open: boolean;
  onClose: () => void;
  mission: MissionDetailsDTO | null;
  projectId: number;
  workers: EmployeeListDTO[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateMissionFormValues>({
    resolver: zodResolver(updateMissionSchema),
    defaultValues: { foremanEmployeeId: 0, startDate: formatDate(new Date()), advanceAmount: 0, notes: "", workers: [{ employeeId: 0, daysCount: 1 }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "workers" });

  useEffect(() => {
    if (open && mission) {
      reset({
        foremanEmployeeId: mission.foremanEmployeeId,
        startDate: mission.startDate.slice(0, 10),
        advanceAmount: mission.advanceAmount,
        notes: "",
        workers: mission.workers.length > 0 ? mission.workers.map((w) => ({ employeeId: w.employeeId, daysCount: w.daysCount })) : [{ employeeId: 0, daysCount: 1 }],
      });
      setServerError(null);
    }
  }, [open, mission, reset]);

  if (!mission) return null;

  const onSubmit = async (data: UpdateMissionFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await updateMission({ missionId: mission.id, ...data, notes: data.notes || null }, projectId);
    setLoading(false);
    if (!result.success) {
      setServerError(result.message ?? "حدث خطأ");
      return;
    }
    onClose();
    router.refresh();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="تعديل بيانات المأمورية"
      maxWidth="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="edit-mission-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </>
      }
    >
      <form id="edit-mission-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="رئيس العمال" error={errors.foremanEmployeeId?.message}>
          <Controller
            name="foremanEmployeeId"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value ? String(field.value) : ""}
                onChange={(v) => field.onChange(Number(v))}
                placeholder="اختر رئيس عمال"
                options={workers.map((w) => ({ value: String(w.id), label: w.name }))}
              />
            )}
          />
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

          {fields.length > 0 && (
            <div className="flex items-center gap-stack-sm px-1">
              <span className="flex-1 text-xs text-on-surface-variant">العامل</span>
              <span className="w-28 text-xs text-on-surface-variant">عدد الأيام</span>
              <span className="w-[18px]" />
            </div>
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-stack-sm">
              <div className="flex-1">
                <Controller
                  name={`workers.${index}.employeeId`}
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      value={field.value ? String(field.value) : ""}
                      onChange={(v) => field.onChange(Number(v))}
                      placeholder="اختر عامل"
                      options={workers.map((w) => ({ value: String(w.id), label: w.name }))}
                    />
                  )}
                />
              </div>
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
