"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { updateProject } from "@/actions/projects";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input, Textarea } from "@/components/ui/Field";
import { updateProjectSchema, type UpdateProjectFormValues } from "@/schema/project";
import type { ClientListDTO } from "@/types/client";
import type { ProjectDetailsDTO } from "@/types/project";

interface Props {
  open: boolean;
  onClose: () => void;
  project: ProjectDetailsDTO;
  clients: ClientListDTO[];
}

export function ProjectEditDialog({ open, onClose, project, clients }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name: project.name,
      clientId: project.clientId,
      contractValue: project.contractValue,
      description: project.description ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: project.name,
        clientId: project.clientId,
        contractValue: project.contractValue,
        description: project.description ?? "",
      });
      setServerError(null);
    }
  }, [open, project, reset]);

  const onSubmit = async (data: UpdateProjectFormValues) => {
    setLoading(true);
    setServerError(null);

    const result = await updateProject({
      id: project.id,
      name: data.name,
      clientId: data.clientId,
      contractValue: data.contractValue,
      description: data.description || null,
    });

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
      title="تعديل بيانات المشروع"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="edit-project-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </>
      }
    >
      <form id="edit-project-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="اسم المشروع" error={errors.name?.message}>
          <Input {...register("name")} />
        </FieldGroup>

        <FieldGroup label="العميل" error={errors.clientId?.message}>
          <Controller
            name="clientId"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value ? String(field.value) : ""}
                onChange={(v) => field.onChange(Number(v))}
                placeholder="اختر العميل"
                options={clients.map((c) => ({ value: String(c.id), label: c.name }))}
              />
            )}
          />
        </FieldGroup>

        <FieldGroup label="قيمة العقد" error={errors.contractValue?.message}>
          <Input type="number" step="0.01" dir="ltr" {...register("contractValue", { valueAsNumber: true })} />
        </FieldGroup>

        <FieldGroup label="وصف المشروع" error={errors.description?.message}>
          <Textarea rows={2} {...register("description")} />
        </FieldGroup>

        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
