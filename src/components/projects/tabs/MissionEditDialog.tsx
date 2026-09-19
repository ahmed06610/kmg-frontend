"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { updateMission } from "@/actions/missions";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input } from "@/components/ui/Field";
import { formatDate } from "@/lib/utils";
import { updateMissionSchema, type UpdateMissionFormValues } from "@/schema/mission";
import type { EmployeeListDTO } from "@/types/employee";
import type { MissionListDTO } from "@/types/mission";

export function MissionEditDialog({
  open,
  onClose,
  mission,
  projectId,
  workers,
}: {
  open: boolean;
  onClose: () => void;
  mission: MissionListDTO | null;
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
    defaultValues: { foremanEmployeeId: 0, startDate: formatDate(new Date()), advanceAmount: 0, notes: "" },
  });

  useEffect(() => {
    if (open && mission) {
      reset({
        foremanEmployeeId: mission.foremanEmployeeId,
        startDate: mission.startDate.slice(0, 10),
        advanceAmount: mission.advanceAmount,
        notes: "",
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

        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
