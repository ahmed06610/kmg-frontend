import { formatCurrency } from "@/lib/utils";
import type { MaterialCategoryDTO, MaterialDTO } from "@/types/stock";

/** بيرجع اسم الخامة متضمن قيم الخانات الإضافية بترتيب تعريفها في الفئة، مثال: "كلادينج (2×2) (أحمر)" */
export function formatMaterialLabel(material: MaterialDTO, categories: MaterialCategoryDTO[]): string {
  const category = categories.find((c) => c.id === material.categoryId);
  if (!category || category.extraFieldDefinitions.length === 0) return material.name;

  const extras = category.extraFieldDefinitions
    .map((f) => material.extraFieldValues[f.key])
    .filter((v): v is string => !!v && v.trim() !== "");

  return extras.length === 0 ? material.name : `${material.name} ${extras.map((v) => `(${v})`).join(" ")}`;
}

/** نفس formatMaterialLabel بس مع سعر الوحدة ملحق في الآخر - نفس الشكل المستخدم وقت الصرف/الشراء */
export function formatMaterialLabelWithPrice(material: MaterialDTO, categories: MaterialCategoryDTO[], unitPrice: number): string {
  return `${formatMaterialLabel(material, categories)} - ${formatCurrency(unitPrice)}`;
}
