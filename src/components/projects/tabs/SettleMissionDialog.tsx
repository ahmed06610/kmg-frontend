"use client";

import { useT } from "@/lib/i18n/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { settleMission } from "@/actions/missions";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input } from "@/components/ui/Field";
import { formatDate } from "@/lib/utils";
import { settleMissionSchema, type SettleMissionFormValues } from "@/schema/mission";
import type { MissionListDTO } from "@/types/mission";

export function SettleMissionDialog({ open, onClose, mission, projectId }: { open: boolean; onClose: () => void; mission: MissionListDTO; projectId: number }) {
  const t = useT();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettleMissionFormValues>({
    resolver: zodResolver(settleMissionSchema),
    defaultValues: { endDate: formatDate(new Date()), actualSpent: mission.advanceAmount, notes: "" },
  });

  const onSubmit = async (data: SettleMissionFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = await settleMission({ missionId: mission.id, ...data, notes: data.notes || null }, projectId);
    setLoading(false);
    if (!result.success) {
      setServerError(result.message ?? t("حدث خطأ"));
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
      title={t("تسوية عهدة المأمورية - {0}", [mission.foremanName])}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t("إلغاء")}</Button>
          <Button type="submit" form="settle-mission-form" disabled={loading}>
            {loading ? t("جاري التسوية...") : t("تسوية العهدة")}
          </Button>
        </>
      }
    >
      <p className="text-body-sm text-on-surface-variant">
        {t("قيمة العهدة المسلمة: ")}<span dir="ltr" className="font-mono-data text-on-surface">{mission.advanceAmount.toFixed(2)}</span>
      </p>
      <form id="settle-mission-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label={t("تاريخ الانتهاء")} error={errors.endDate?.message}>
          <Input type="date" {...register("endDate")} />
        </FieldGroup>
        <FieldGroup label={t("المصروف الفعلي")} error={errors.actualSpent?.message}>
          <Input type="number" step="0.01" dir="ltr" {...register("actualSpent", { valueAsNumber: true })} />
        </FieldGroup>
        <FieldGroup label={t("ملاحظات")} error={errors.notes?.message}>
          <Input {...register("notes")} />
        </FieldGroup>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{t(serverError)}</div>}
      </form>
    </Dialog>
  );
}
