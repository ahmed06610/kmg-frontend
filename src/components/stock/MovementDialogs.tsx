"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteStockMovement, getMaterialPriceBatches, updateStockMovement } from "@/actions/stock";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { formatCurrency } from "@/lib/utils";
import { movementTypeLabels } from "@/types/enums";
import type { MaterialCategoryDTO, MaterialDTO, StockMovementDTO } from "@/types/stock";
import type { ProjectListDTO } from "@/types/project";
import type { SupplierListDTO } from "@/types/supplier";
import { PurchaseDialog } from "./PurchaseDialog";

/** زراير التعديل/الحذف لصف حركة مخزون - بتتعرض بس لمستخدم معاه صلاحية "إدارة المخزن" */
export function MovementActions({
  movement,
  onEdit,
  onDelete,
}: {
  movement: StockMovementDTO;
  onEdit: (m: StockMovementDTO) => void;
  onDelete: (m: StockMovementDTO) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button className="text-on-surface-variant hover:text-on-surface" title="تعديل / تصحيح خطأ" onClick={() => onEdit(movement)}>
        <Icon name="edit" size={18} />
      </button>
      <button className="text-error hover:opacity-80" title="حذف الحركة" onClick={() => onDelete(movement)}>
        <Icon name="delete" size={18} />
      </button>
    </div>
  );
}

const deleteMessages: Record<string, string> = {
  Purchase:
    "الكمية هتتخصم من رصيد الخامة وهتتشال (هي والنقل بتاعها) من مستحقات المورد - الخزنة مش هتتأثر. لو الكمية دي اتصرف منها على مشاريع، الحذف هيترفض لحد ما تعدل حركات الصرف الأول.",
  IssueToProject: "الكمية هترجع لرصيد المخزن وهتتشال من تكلفة خامات المشروع. الخزنة مش هتتأثر.",
  ReturnFromProject: "الكمية هتتخصم من رصيد المخزن وهترجع تتحسب على تكلفة المشروع تاني. الخزنة مش هتتأثر.",
  OpeningBalance: "الكمية هتتخصم من رصيد الخامة. لو اتصرف منها على مشاريع، الحذف هيترفض لحد ما تعدل الصرف الأول.",
  Adjustment: "أثر تسوية الجرد هيتلغي ورصيد الخامة هيرجع زي ما كان قبلها.",
};

/** كل دايلوجات تعديل/حذف حركات المخزون في مكان واحد - الشراء بيتعدل من PurchaseDialog لأنه مربوط بمورد ونقل */
export function MovementDialogs({
  editing,
  deleting,
  onCloseEdit,
  onCloseDelete,
  materials,
  categories,
  suppliers,
  projects,
}: {
  editing: StockMovementDTO | null;
  deleting: StockMovementDTO | null;
  onCloseEdit: () => void;
  onCloseDelete: () => void;
  materials: MaterialDTO[];
  categories: MaterialCategoryDTO[];
  suppliers: SupplierListDTO[];
  projects: ProjectListDTO[];
}) {
  const router = useRouter();
  const isPurchase = editing?.movementType === "Purchase";

  return (
    <>
      <PurchaseDialog
        open={!!editing && isPurchase}
        onClose={onCloseEdit}
        materials={materials}
        suppliers={suppliers}
        categories={categories}
        purchase={isPurchase ? editing! : undefined}
      />
      <EditMovementDialog open={!!editing && !isPurchase} onClose={onCloseEdit} movement={isPurchase ? null : editing} projects={projects} />
      <ConfirmDialog
        open={!!deleting}
        onClose={onCloseDelete}
        title={`حذف حركة ${deleting ? (movementTypeLabels[deleting.movementType] ?? deleting.movementType) : ""}`}
        message={
          deleting
            ? `${deleting.materialName} - كمية ${deleting.quantity}. ${deleteMessages[deleting.movementType] ?? ""} هل أنت متأكد؟`
            : ""
        }
        onConfirm={() => deleteStockMovement(deleting!.id)}
        onConfirmed={() => router.refresh()}
      />
    </>
  );
}

function EditMovementDialog({
  open,
  onClose,
  movement,
  projects,
}: {
  open: boolean;
  onClose: () => void;
  movement: StockMovementDTO | null;
  projects: ProjectListDTO[];
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [projectId, setProjectId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [priceOptions, setPriceOptions] = useState<{ price: number; available: number }[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const type = movement?.movementType;
  const isIssue = type === "IssueToProject";
  const hasProject = isIssue || type === "ReturnFromProject";
  const hasPrice = isIssue || type === "OpeningBalance";
  const isAdjustment = type === "Adjustment";

  useEffect(() => {
    if (!open || !movement) return;
    setQuantity(String(movement.quantity));
    setUnitPrice(String(movement.unitPriceAtTime));
    setProjectId(movement.projectId);
    setNotes(movement.notes ?? "");
    setDate(movement.movementDate.slice(0, 10));
    setServerError(null);
    setPriceOptions([]);

    // الصرف لازم يبقى بسعر دفعة موجودة فعلًا - بنعرض الدفعات المتاحة + الكمية اللي الحركة دي نفسها حاجزاها
    if (movement.movementType === "IssueToProject") {
      getMaterialPriceBatches(movement.materialId).then((result) => {
        const batches = result.success && result.data ? result.data : [];
        const options = batches.map((b) => ({
          price: b.unitPrice,
          available: b.availableQuantity + (b.unitPrice === movement.unitPriceAtTime ? movement.quantity : 0),
        }));
        if (!options.some((o) => o.price === movement.unitPriceAtTime)) options.unshift({ price: movement.unitPriceAtTime, available: movement.quantity });
        setPriceOptions(options);
      });
    }
  }, [open, movement]);

  if (!movement) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty === 0 || (!isAdjustment && qty < 0)) {
      setServerError(isAdjustment ? "الفرق لازم يكون رقم غير صفر" : "الكمية يجب أن تكون أكبر من صفر");
      return;
    }
    if (hasProject && !projectId) {
      setServerError("اختر المشروع");
      return;
    }
    setLoading(true);
    setServerError(null);
    const result = await updateStockMovement({
      id: movement.id,
      quantity: qty,
      unitPrice: Number(unitPrice) || 0,
      projectId: hasProject ? projectId : null,
      notes: notes || null,
      // التاريخ بيتبعت بس لو اتغير فعلًا - عشان منضيعش وقت الحركة الأصلي (بيأثر على ترتيب آخر سعر شراء)
      movementDate: date && date !== movement.movementDate.slice(0, 10) ? date : null,
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
      title={`تعديل حركة ${movementTypeLabels[movement.movementType] ?? movement.movementType} - ${movement.materialName}`}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="edit-movement-form" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ التعديل"}
          </Button>
        </>
      }
    >
      <form id="edit-movement-form" onSubmit={onSubmit} className="flex flex-col gap-stack-md">
        <FieldGroup label={isAdjustment ? "فرق الجرد (موجب = زيادة، سالب = عجز)" : "الكمية"}>
          <Input type="number" step="0.01" dir="ltr" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </FieldGroup>

        {isIssue && (
          <FieldGroup label="سعر الصرف (دفعة السعر)">
            <Select value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} dir="ltr">
              {priceOptions.length === 0 && <option value={unitPrice}>{formatCurrency(Number(unitPrice))}</option>}
              {priceOptions.map((o) => (
                <option key={o.price} value={o.price}>
                  {formatCurrency(o.price)} — متاح {o.available}
                </option>
              ))}
            </Select>
          </FieldGroup>
        )}
        {hasPrice && !isIssue && (
          <FieldGroup label="سعر الوحدة">
            <Input type="number" step="0.01" dir="ltr" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
          </FieldGroup>
        )}

        {hasProject && (
          <FieldGroup label="المشروع">
            <Combobox
              value={projectId ? String(projectId) : ""}
              onChange={(v) => setProjectId(v ? Number(v) : null)}
              placeholder="اختر مشروع"
              options={projects.map((p) => ({ value: String(p.id), label: p.projectCode ? `${p.name} (${p.projectCode})` : p.name }))}
            />
          </FieldGroup>
        )}

        <FieldGroup label="تاريخ الحركة">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </FieldGroup>
        <FieldGroup label="ملاحظات">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FieldGroup>

        <p className="text-xs text-on-surface-variant">
          رصيد الخامة وتكلفة المشروع بيتعاد حسابهم تلقائيًا بعد الحفظ. لو التعديل هيخلي أي رصيد بالسالب (المخزن أو دفعة السعر أو
          المرتجع أكبر من المصروف) هيترفض برسالة توضح السبب.
        </p>
        {serverError && <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{serverError}</div>}
      </form>
    </Dialog>
  );
}
