"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createSupplier, updateSupplier } from "@/actions/suppliers";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input } from "@/components/ui/Field";
import { supplierSchema, type SupplierFormValues } from "@/schema/supplier";
import type { SupplierListDTO } from "@/types/supplier";

interface Props {
  open: boolean;
  onClose: () => void;
  supplier?: SupplierListDTO & { address?: string | null };
}

export function SupplierFormDialog({ open, onClose, supplier }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier?.name ?? "",
      phone: supplier?.phone ?? "",
      email: supplier?.email ?? "",
      address: supplier?.address ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({ name: supplier?.name ?? "", phone: supplier?.phone ?? "", email: supplier?.email ?? "", address: supplier?.address ?? "" });
      setServerError(null);
    }
  }, [open, supplier, reset]);

  const onSubmit = async (data: SupplierFormValues) => {
    setLoading(true);
    setServerError(null);

    const payload = { name: data.name, phone: data.phone || null, email: data.email || null, address: data.address || null };
    const result = supplier ? await updateSupplier({ id: supplier.id, ...payload }) : await createSupplier(payload);

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
      title={supplier ? "تعديل بيانات المورد" : "مورد جديد"}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="supplier-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </>
      }
    >
      <form id="supplier-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="اسم المورد" error={errors.name?.message}>
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
