"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createClient, updateClient } from "@/actions/clients";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input } from "@/components/ui/Field";
import { clientSchema, type ClientFormValues } from "@/schema/client";
import type { ClientListDTO } from "@/types/client";

interface Props {
  open: boolean;
  onClose: () => void;
  client?: ClientListDTO & { address?: string | null };
}

export function ClientFormDialog({ open, onClose, client }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: client?.name ?? "", phone: client?.phone ?? "", email: client?.email ?? "", address: client?.address ?? "" },
  });

  useEffect(() => {
    if (open) {
      reset({ name: client?.name ?? "", phone: client?.phone ?? "", email: client?.email ?? "", address: client?.address ?? "" });
      setServerError(null);
    }
  }, [open, client, reset]);

  const onSubmit = async (data: ClientFormValues) => {
    setLoading(true);
    setServerError(null);

    const payload = { name: data.name, phone: data.phone || null, email: data.email || null, address: data.address || null };
    const result = client ? await updateClient({ id: client.id, ...payload }) : await createClient(payload);

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
      title={client ? "تعديل بيانات العميل" : "عميل جديد"}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="client-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </>
      }
    >
      <form id="client-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="اسم الشركة / العميل" error={errors.name?.message}>
          <Input {...register("name")} />
        </FieldGroup>
        <FieldGroup label="رقم الهاتف" error={errors.phone?.message}>
          <Input {...register("phone")} />
        </FieldGroup>
        <FieldGroup label="البريد الإلكتروني" error={errors.email?.message}>
          <Input {...register("email")} />
        </FieldGroup>
        <FieldGroup label="العنوان" error={errors.address?.message}>
          <Input {...register("address")} />
        </FieldGroup>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
