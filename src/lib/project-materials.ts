import { formatMaterialLabelWithPrice } from "@/lib/material-label";
import type { MaterialCategoryDTO, MaterialDTO, StockMovementDTO } from "@/types/stock";

export interface ProjectMaterialLine {
  key: string;
  materialId: number;
  label: string;
  unit: string;
  netQuantity: number;
  unitPrice: number;
  total: number;
}

/**
 * صافي الخامات المصروفة على مشروع، مجمعة بالخامة + سعر الصرف - نفس الشكل المعروض في تابة الخامات
 * (اسم الخامة بالخانات الإضافية + السعر). مجموع total لكل السطور = TotalMaterialsCost في الباك اند بالظبط
 * (صرف - مرتجع، كل حركة بسعرها وقتها).
 */
export function aggregateProjectMaterials(
  movements: StockMovementDTO[],
  materials: MaterialDTO[],
  categories: MaterialCategoryDTO[],
): ProjectMaterialLine[] {
  const lines = new Map<string, ProjectMaterialLine>();

  for (const m of movements) {
    if (m.movementType !== "IssueToProject" && m.movementType !== "ReturnFromProject") continue;
    const sign = m.movementType === "IssueToProject" ? 1 : -1;
    const key = `${m.materialId}@${m.unitPriceAtTime}`;
    const material = materials.find((x) => x.id === m.materialId);
    const line = lines.get(key) ?? {
      key,
      materialId: m.materialId,
      label: material ? formatMaterialLabelWithPrice(material, categories, m.unitPriceAtTime) : m.materialName,
      unit: material?.unit ?? "",
      netQuantity: 0,
      unitPrice: m.unitPriceAtTime,
      total: 0,
    };
    line.netQuantity += sign * m.quantity;
    line.total += sign * m.quantity * m.unitPriceAtTime;
    lines.set(key, line);
  }

  return Array.from(lines.values())
    .filter((l) => l.netQuantity !== 0)
    .sort((a, b) => b.total - a.total);
}
