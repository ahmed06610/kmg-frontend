"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { createMaterialCategory, deleteMaterialCategory, updateMaterialCategory } from "@/actions/stock";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/Table";
import { materialCategorySchema, type MaterialCategoryFormValues } from "@/schema/stock";
import type { MaterialCategoryDTO } from "@/types/stock";

export function CategoryManagerDialog({ open, onClose, categories }: { open: boolean; onClose: () => void; categories: MaterialCategoryDTO[] }) {
  const router = useRouter();
  const [editingCategory, setEditingCategory] = useState<MaterialCategoryDTO | undefined>(undefined);
  const [formOpen, setFormOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<MaterialCategoryDTO | null>(null);

  return (
    <Dialog open={open} onClose={onClose} title="إدارة أنواع المخزون" maxWidth="max-w-2xl">
      <div className="flex flex-col gap-stack-md">
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => {
              setEditingCategory(undefined);
              setFormOpen(true);
            }}
          >
            <Icon name="add" size={18} />
            نوع جديد
          </Button>
        </div>

        {categories.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant text-center py-stack-lg">لا توجد أنواع مضافة بعد</p>
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>الاسم</Th>
                <Th>الحقول الإضافية</Th>
                <Th>عدد الأصناف</Th>
                <Th>إجراءات</Th>
              </tr>
            </THead>
            <TBody>
              {categories.map((c) => (
                <Tr key={c.id}>
                  <Td>{c.name}</Td>
                  <Td>{c.extraFieldDefinitions.length > 0 ? c.extraFieldDefinitions.map((f) => f.label).join("، ") : "-"}</Td>
                  <Td>{c.materialsCount}</Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <button
                        className="text-on-surface-variant hover:text-on-surface"
                        title="تعديل"
                        onClick={() => {
                          setEditingCategory(c);
                          setFormOpen(true);
                        }}
                      >
                        <Icon name="edit" size={18} />
                      </button>
                      <button className="text-error hover:opacity-80" title="حذف" onClick={() => setDeletingCategory(c)}>
                        <Icon name="delete" size={18} />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </div>

      <CategoryFormDialog open={formOpen} onClose={() => setFormOpen(false)} category={editingCategory} />
      <ConfirmDialog
        open={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        title="حذف النوع"
        message={`هل أنت متأكد من حذف نوع "${deletingCategory?.name}"؟`}
        onConfirm={() => deleteMaterialCategory(deletingCategory!.id)}
        onConfirmed={() => router.refresh()}
      />
    </Dialog>
  );
}

function CategoryFormDialog({ open, onClose, category }: { open: boolean; onClose: () => void; category?: MaterialCategoryDTO }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!category;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MaterialCategoryFormValues>({
    resolver: zodResolver(materialCategorySchema),
    defaultValues: { name: "", extraFieldDefinitions: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "extraFieldDefinitions" });

  useEffect(() => {
    if (open) {
      reset({
        name: category?.name ?? "",
        extraFieldDefinitions: category?.extraFieldDefinitions.map((f) => ({ key: f.key, label: f.label, fieldType: f.fieldType as "text" | "number" })) ?? [],
      });
      setServerError(null);
    }
  }, [open, category, reset]);

  const existingKeys = new Set(category?.extraFieldDefinitions.map((f) => f.key) ?? []);

  const onSubmit = async (data: MaterialCategoryFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = isEdit ? await updateMaterialCategory({ id: category!.id, ...data }) : await createMaterialCategory(data);
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
      title={isEdit ? "تعديل النوع" : "نوع جديد"}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="category-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="اسم النوع" error={errors.name?.message}>
          <Input {...register("name")} />
        </FieldGroup>

        <div className="flex flex-col gap-stack-sm">
          <div className="flex items-center justify-between">
            <span className="text-label-caps text-on-surface-variant">الحقول الإضافية</span>
            <button
              type="button"
              onClick={() => append({ key: "", label: "", fieldType: "text" })}
              className="text-primary text-body-sm font-semibold flex items-center gap-1"
            >
              <Icon name="add" size={16} />
              إضافة حقل
            </button>
          </div>

          {fields.map((field, index) => {
            const isLocked = existingKeys.has(field.key);
            return (
              <div key={field.id} className="flex items-center gap-stack-sm">
                <Input placeholder="المفتاح (بالإنجليزي)" dir="ltr" disabled={isLocked} className="w-32" {...register(`extraFieldDefinitions.${index}.key`)} />
                <Input placeholder="الاسم الظاهر" className="flex-1" {...register(`extraFieldDefinitions.${index}.label`)} />
                <Select className="w-28" {...register(`extraFieldDefinitions.${index}.fieldType`)}>
                  <option value="text">نص</option>
                  <option value="number">رقم</option>
                </Select>
                {!isLocked && (
                  <button type="button" onClick={() => remove(index)} className="text-error shrink-0" aria-label="حذف">
                    <Icon name="delete" size={18} />
                  </button>
                )}
              </div>
            );
          })}
          {errors.extraFieldDefinitions && <p className="text-error text-xs">تأكد من صحة بيانات الحقول الإضافية</p>}
        </div>

        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
