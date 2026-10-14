"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createStockAdjustment, deleteMaterial, getMaterialDeleteImpact, mergeMaterials } from "@/actions/stock";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { Dialog } from "@/components/ui/Dialog";
import { FieldGroup, Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { formatMaterialLabel } from "@/lib/material-label";
import { formatCurrency } from "@/lib/utils";
import type { MaterialCategoryDTO, MaterialDeleteImpactDTO, MaterialDTO } from "@/types/stock";

function ErrorBox({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className="rounded bg-error-container text-on-error-container text-body-sm px-stack-md py-2">{message}</div>;
}

/**
 * حذف خامة: بيجيب الأول ملخص أثر الحذف من الباك اند (عدد الحركات والمشاريع والموردين المتأثرين)،
 * ولو الخامة عليها حركات بيطلب تأكيد صريح للحذف الكامل - أو يقترح الدمج لو الخامة مكررة.
 */
export function DeleteMaterialDialog({
  open,
  onClose,
  material,
  onDeleted,
  onSuggestMerge,
}: {
  open: boolean;
  onClose: () => void;
  material: MaterialDTO | null;
  onDeleted?: () => void;
  onSuggestMerge?: () => void;
}) {
  const router = useRouter();
  const [impact, setImpact] = useState<MaterialDeleteImpactDTO | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !material) return;
    setImpact(null);
    setConfirmText("");
    setServerError(null);
    getMaterialDeleteImpact(material.id).then((result) => {
      if (result.success && result.data) setImpact(result.data);
      else setServerError(result.message ?? "تعذر تحميل أثر الحذف");
    });
  }, [open, material]);

  if (!material) return null;
  const hasMovements = (impact?.movementsCount ?? 0) > 0;
  const canConfirm = impact !== null && (!hasMovements || confirmText.trim() === "حذف");

  const handleDelete = async () => {
    setLoading(true);
    setServerError(null);
    const result = await deleteMaterial(material.id, hasMovements);
    setLoading(false);
    if (!result.success) {
      setServerError(result.message ?? "حدث خطأ");
      return;
    }
    onClose();
    if (onDeleted) onDeleted();
    else router.refresh();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`حذف خامة "${material.name}"`}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button variant="danger" type="button" onClick={handleDelete} disabled={!canConfirm || loading}>
            {loading ? "جاري الحذف..." : hasMovements ? "حذف الخامة وكل حركاتها" : "حذف الخامة"}
          </Button>
        </>
      }
    >
      {impact === null && !serverError && <p className="text-body-sm text-on-surface-variant">جاري حساب أثر الحذف...</p>}

      {impact && !hasMovements && <p className="text-body-sm text-on-surface">الخامة دي مفيش عليها أي حركات، وحذفها مش هيأثر على أي حاجة تانية.</p>}

      {impact && hasMovements && (
        <div className="flex flex-col gap-stack-sm text-body-sm">
          <div className="rounded-lg border border-warning/40 bg-warning-container/40 p-stack-md text-on-surface">
            <p className="font-semibold mb-1 flex items-center gap-1">
              <Icon name="warning" size={18} className="text-warning" />
              الخامة دي عليها {impact.movementsCount} حركة وهتتمسح كلها
            </p>
            <ul className="list-disc pr-5 space-y-0.5 text-on-surface-variant">
              <li>{impact.purchasesCount} عملية شراء — هتتشال من مستحقات الموردين{impact.affectedSuppliers.length > 0 && `: ${impact.affectedSuppliers.join("، ")}`}</li>
              <li>
                {impact.issuesCount} صرف و {impact.returnsCount} مرتجع — هيتشالوا من تكلفة المشاريع
                {impact.affectedProjects.length > 0 && `: ${impact.affectedProjects.join("، ")}`}
              </li>
              {impact.transportCostToReverse > 0 && <li>مصاريف نقل بقيمة {formatCurrency(impact.transportCostToReverse)} هتتشال من مستحقات الموردين</li>}
            </ul>
          </div>
          {onSuggestMerge && (
            <p className="text-on-surface-variant">
              لو الخامة دي متسجلة مرتين بالغلط، الأفضل{" "}
              <button
                type="button"
                className="text-primary font-semibold hover:underline"
                onClick={() => {
                  onClose();
                  onSuggestMerge();
                }}
              >
                تدمجها في الخامة الصح
              </button>{" "}
              بدل الحذف، عشان الحركات متضيعش.
            </p>
          )}
          <FieldGroup label='للتأكيد اكتب كلمة "حذف"'>
            <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
          </FieldGroup>
        </div>
      )}
      <ErrorBox message={serverError} />
    </Dialog>
  );
}

/** دمج خامة مكررة في خامة تانية: كل الحركات بتتنقل والرصيد بيتعاد حسابه والخامة المكررة بتتمسح */
export function MergeMaterialDialog({
  open,
  onClose,
  source,
  materials,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  source: MaterialDTO;
  materials: MaterialDTO[];
  categories: MaterialCategoryDTO[];
}) {
  const router = useRouter();
  const [targetId, setTargetId] = useState<number | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTargetId(null);
      setServerError(null);
    }
  }, [open]);

  const target = materials.find((m) => m.id === targetId);
  const unitMismatch = target && target.unit.trim() !== source.unit.trim();

  const handleMerge = async () => {
    if (!targetId) return;
    setLoading(true);
    setServerError(null);
    const result = await mergeMaterials({ sourceMaterialId: source.id, targetMaterialId: targetId });
    setLoading(false);
    if (!result.success) {
      setServerError(result.message ?? "حدث خطأ");
      return;
    }
    onClose();
    router.push(`/stock/${targetId}`);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`دمج "${source.name}" في خامة تانية`}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="button" onClick={handleMerge} disabled={!targetId || loading}>
            {loading ? "جاري الدمج..." : "دمج الخامتين"}
          </Button>
        </>
      }
    >
      <p className="text-body-sm text-on-surface-variant">
        استخدم الدمج لو الخامة دي اتسجلت مرتين بالغلط. كل حركاتها (شراء/صرف/مرتجع) هتتنقل للخامة اللي هتختارها، والرصيد هيتجمع، وبعدين
        الخامة الحالية هتتمسح. تكلفة المشاريع ومستحقات الموردين والخزنة مش هيتغيروا.
      </p>
      <FieldGroup label="الخامة الصح (اللي هتفضل)">
        <Combobox
          value={targetId ? String(targetId) : ""}
          onChange={(v) => setTargetId(v ? Number(v) : null)}
          placeholder="اختر الخامة"
          options={materials
            .filter((m) => m.id !== source.id)
            .map((m) => ({ value: String(m.id), label: formatMaterialLabel(m, categories), hint: `${m.quantity} ${m.unit}` }))}
        />
      </FieldGroup>
      {target && (
        <p className="text-body-sm text-on-surface">
          الرصيد بعد الدمج:{" "}
          <span dir="ltr" className="font-mono-data font-semibold">
            {target.quantity + source.quantity} {target.unit}
          </span>
        </p>
      )}
      {unitMismatch && (
        <div className="rounded bg-warning-container text-on-warning-container text-body-sm px-stack-md py-2">
          تنبيه: وحدة الخامتين مختلفة (&quot;{source.unit}&quot; و &quot;{target!.unit}&quot;). اتأكد إنهم فعلًا نفس الخامة قبل الدمج.
        </div>
      )}
      <ErrorBox message={serverError} />
    </Dialog>
  );
}

/** تسوية جرد: المستخدم بيدخل الكمية الموجودة فعلًا في المخزن، والفرق بيتسجل كحركة "تسوية جرد" قابلة للتعديل/الحذف */
export function StockAdjustmentDialog({ open, onClose, material }: { open: boolean; onClose: () => void; material: MaterialDTO }) {
  const router = useRouter();
  const [actualQuantity, setActualQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setActualQuantity(String(material.quantity));
      setNotes("");
      setServerError(null);
    }
  }, [open, material]);

  const actual = Number(actualQuantity);
  const difference = Number.isFinite(actual) ? actual - material.quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(actual) || actual < 0) {
      setServerError("الكمية الفعلية لازم تكون رقم صفر أو أكبر");
      return;
    }
    setLoading(true);
    setServerError(null);
    const result = await createStockAdjustment({ materialId: material.id, actualQuantity: actual, notes: notes || null });
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
      title={`تسوية جرد - ${material.name}`}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" form="stock-adjustment-form" disabled={loading || difference === 0}>
            {loading ? "جاري الحفظ..." : "تسجيل التسوية"}
          </Button>
        </>
      }
    >
      <form id="stock-adjustment-form" onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
        <p className="text-body-sm text-on-surface-variant">
          الرصيد المسجل حاليًا:{" "}
          <span dir="ltr" className="font-mono-data text-on-surface">
            {material.quantity} {material.unit}
          </span>
          . دخّل الكمية اللي لقيتها فعلًا في المخزن، والفرق هيتسجل كحركة &quot;تسوية جرد&quot; (من غير أي أثر على الخزنة أو المشاريع).
        </p>
        <FieldGroup label="الكمية الفعلية في المخزن">
          <Input type="number" step="0.01" dir="ltr" value={actualQuantity} onChange={(e) => setActualQuantity(e.target.value)} />
        </FieldGroup>
        {difference !== 0 && (
          <p className={`text-body-sm font-semibold ${difference > 0 ? "text-success" : "text-error"}`}>
            {difference > 0 ? "زيادة" : "عجز"} بمقدار{" "}
            <span dir="ltr" className="font-mono-data">
              {Math.abs(difference)} {material.unit}
            </span>
          </p>
        )}
        <FieldGroup label="السبب / ملاحظات (اختياري)">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="مثلًا: جرد آخر الشهر، تالف، خطأ في التسجيل..." />
        </FieldGroup>
        <ErrorBox message={serverError} />
      </form>
    </Dialog>
  );
}
