"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createProjectWriteOff, deleteProjectWriteOff, updateProjectWriteOff } from "@/actions/projects";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { FieldGroup, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTableState } from "@/lib/useTableState";
import { projectWriteOffSchema, type ProjectWriteOffFormValues } from "@/schema/project";
import type { ProjectWriteOffDTO } from "@/types/project";

export function WriteOffsTab({
  projectId,
  writeOffs,
  remainingBalance,
  canManage,
}: {
  projectId: number;
  writeOffs: ProjectWriteOffDTO[];
  remainingBalance: number;
  canManage: boolean;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWriteOff, setEditingWriteOff] = useState<ProjectWriteOffDTO | null>(null);
  const [deletingWriteOff, setDeletingWriteOff] = useState<ProjectWriteOffDTO | null>(null);
  const total = writeOffs.reduce((sum, w) => sum + w.amount, 0);

  const table = useTableState({
    rows: writeOffs,
    pageSize: 10,
    searchPredicate: (w, term) => w.reason.toLowerCase().includes(term),
  });

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex items-center justify-between flex-wrap gap-stack-sm">
        <div className="flex flex-col gap-1">
          <p className="text-body-sm text-on-surface-variant">
            إجمالي خصم الأعمال: <span dir="ltr" className="font-mono-data text-on-surface font-semibold">{formatCurrency(total)}</span>
          </p>
          <p className="text-body-sm text-on-surface-variant">
            المتبقي بعد الخصم: <span dir="ltr" className="font-mono-data text-on-surface font-semibold">{formatCurrency(remainingBalance)}</span>
          </p>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Icon name="add" size={18} />
            إضافة خصم
          </Button>
        )}
      </div>

      {writeOffs.length > 0 && <SearchInput value={table.search} onChange={table.setSearch} placeholder="بحث بالسبب..." />}

      {writeOffs.length === 0 ? (
        <EmptyState
          icon="money_off"
          title="لا توجد خصومات أعمال مسجلة"
          description="سجّل هنا أي مبلغ متعذر تحصيله من العميل عشان المتبقي يبقى صحيح"
        />
      ) : table.totalCount === 0 ? (
        <EmptyState icon="search_off" title="لا توجد نتائج مطابقة" />
      ) : (
        <>
        <Table>
          <THead>
            <tr>
              <Th>القيمة</Th>
              <Th>السبب</Th>
              <Th>التاريخ</Th>
              {canManage && <Th>إجراءات</Th>}
            </tr>
          </THead>
          <TBody>
            {table.pageRows.map((w) => (
              <Tr key={w.id}>
                <TdMono>{formatCurrency(w.amount)}</TdMono>
                <Td>{w.reason}</Td>
                <Td>{formatDate(w.writeOffDate)}</Td>
                {canManage && (
                  <Td>
                    <div className="flex items-center gap-1">
                      <button className="text-on-surface-variant hover:text-on-surface" title="تعديل" onClick={() => setEditingWriteOff(w)}>
                        <Icon name="edit" size={18} />
                      </button>
                      <button className="text-error hover:opacity-80" title="حذف" onClick={() => setDeletingWriteOff(w)}>
                        <Icon name="delete" size={18} />
                      </button>
                    </div>
                  </Td>
                )}
              </Tr>
            ))}
          </TBody>
        </Table>
        <Pagination page={table.page} pageSize={table.pageSize} totalCount={table.totalCount} onPageChange={table.setPage} />
        </>
      )}

      <WriteOffDialog open={dialogOpen} onClose={() => setDialogOpen(false)} projectId={projectId} />
      <WriteOffDialog
        open={!!editingWriteOff}
        onClose={() => setEditingWriteOff(null)}
        projectId={projectId}
        writeOff={editingWriteOff ?? undefined}
      />
      <ConfirmDialog
        open={!!deletingWriteOff}
        onClose={() => setDeletingWriteOff(null)}
        title="حذف خصم الأعمال"
        message="هل أنت متأكد من حذف هذا الخصم؟ سيرجع المبلغ للمتبقي على المشروع."
        onConfirm={() => deleteProjectWriteOff(deletingWriteOff!.id, projectId)}
        onConfirmed={() => router.refresh()}
      />
    </div>
  );
}

function WriteOffDialog({
  open,
  onClose,
  projectId,
  writeOff,
}: {
  open: boolean;
  onClose: () => void;
  projectId: number;
  writeOff?: ProjectWriteOffDTO;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!writeOff;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectWriteOffFormValues>({
    resolver: zodResolver(projectWriteOffSchema),
    defaultValues: { amount: 0, reason: "", writeOffDate: new Date().toISOString().slice(0, 10) },
  });

  useEffect(() => {
    if (open) {
      reset({
        amount: writeOff?.amount ?? 0,
        reason: writeOff?.reason ?? "",
        writeOffDate: writeOff ? writeOff.writeOffDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
      });
      setServerError(null);
    }
  }, [open, writeOff, reset]);

  const onSubmit = async (data: ProjectWriteOffFormValues) => {
    setLoading(true);
    setServerError(null);
    const result = isEdit
      ? await updateProjectWriteOff({ id: writeOff!.id, ...data }, projectId)
      : await createProjectWriteOff({ projectId, ...data });
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
      title={isEdit ? "تعديل خصم أعمال" : "إضافة خصم أعمال"}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="project-writeoff-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </>
      }
    >
      <form id="project-writeoff-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <FieldGroup label="القيمة" error={errors.amount?.message}>
          <Input type="number" step="0.01" dir="ltr" {...register("amount", { valueAsNumber: true })} />
        </FieldGroup>
        <FieldGroup label="السبب" error={errors.reason?.message}>
          <Input placeholder="مبلغ متعذر تحصيله من العميل..." {...register("reason")} />
        </FieldGroup>
        <FieldGroup label="التاريخ" error={errors.writeOffDate?.message}>
          <Input type="date" {...register("writeOffDate")} />
        </FieldGroup>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
