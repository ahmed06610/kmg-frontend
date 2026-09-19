"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { MultiSheetExportButton } from "@/components/ui/ExportButton";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/utils";
import { movementTypeLabels } from "@/types/enums";
import type { MaterialCategoryDTO, MaterialDTO, StockMovementDTO } from "@/types/stock";
import type { SupplierListDTO } from "@/types/supplier";
import type { ProjectListDTO } from "@/types/project";
import { CategoryCard } from "./CategoryCard";
import { CategoryManagerDialog } from "./CategoryManagerDialog";
import { CategoryMaterialsTable } from "./CategoryMaterialsTable";
import { MaterialFormDialog } from "./MaterialFormDialog";
import { PurchaseDialog } from "./PurchaseDialog";
import { IssueReturnDialog } from "./IssueReturnDialog";

const UNCATEGORIZED = "__uncategorized__";
const ALL = "__all__";

export function StockView({
  materials,
  suppliers,
  projects,
  categories,
  movements,
  canManage,
}: {
  materials: MaterialDTO[];
  suppliers: SupplierListDTO[];
  projects: ProjectListDTO[];
  categories: MaterialCategoryDTO[];
  movements: StockMovementDTO[];
  canManage: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [view, setView] = useState<number | typeof UNCATEGORIZED | typeof ALL | null>(null);

  const uncategorized = materials.filter((m) => m.categoryId == null);

  const categoryStats = useMemo(
    () =>
      categories.map((c) => {
        const items = materials.filter((m) => m.categoryId === c.id);
        return { category: c, itemsCount: items.length, totalValue: items.reduce((sum, m) => sum + m.totalPrice, 0) };
      }),
    [categories, materials],
  );

  function fullExportSheets() {
    const sheets = [];
    for (const { category } of categoryStats) {
      const items = materials.filter((m) => m.categoryId === category.id);
      const ids = new Set(items.map((m) => m.id));
      sheets.push({
        name: category.name,
        columns: [
          { header: "الخامة", key: "name" },
          { header: "الوحدة", key: "unit" },
          { header: "الكمية المتاحة", key: "quantity" },
          { header: "سعر الوحدة", key: "unitPrice" },
          { header: "الإجمالي", key: "totalPrice" },
          { header: "الحد الأدنى", key: "minimumThreshold" },
          { header: "الحالة", key: "status" },
          ...category.extraFieldDefinitions.map((f) => ({ header: f.label, key: f.key })),
        ],
        rows: items.map((m) => ({
          name: m.name,
          unit: m.unit,
          quantity: m.quantity,
          unitPrice: m.unitPrice,
          totalPrice: m.totalPrice,
          minimumThreshold: m.minimumThreshold,
          status: m.isLowStock ? "نقص مخزون" : "متاح",
          ...Object.fromEntries(category.extraFieldDefinitions.map((f) => [f.key, m.extraFieldValues[f.key] ?? ""])),
        })),
      });
      sheets.push({
        name: `${category.name} - حركات`,
        columns: [
          { header: "الخامة", key: "materialName" },
          { header: "النوع", key: "movementType" },
          { header: "الكمية", key: "quantity" },
          { header: "السعر وقت الحركة", key: "unitPriceAtTime" },
          { header: "المصدر", key: "source" },
          { header: "التاريخ", key: "date" },
          { header: "المستخدم", key: "user" },
        ],
        rows: movements
          .filter((mv) => ids.has(mv.materialId))
          .map((mv) => ({
            materialName: mv.materialName,
            movementType: movementTypeLabels[mv.movementType] ?? mv.movementType,
            quantity: mv.quantity,
            unitPriceAtTime: mv.unitPriceAtTime,
            source: mv.projectName ?? mv.supplierName ?? "-",
            date: formatDate(mv.movementDate),
            user: mv.createdByEmployeeName,
          })),
      });
    }

    if (uncategorized.length > 0) {
      const ids = new Set(uncategorized.map((m) => m.id));
      sheets.push({
        name: "بدون نوع",
        columns: [
          { header: "الخامة", key: "name" },
          { header: "الوحدة", key: "unit" },
          { header: "الكمية المتاحة", key: "quantity" },
          { header: "سعر الوحدة", key: "unitPrice" },
          { header: "الإجمالي", key: "totalPrice" },
          { header: "الحد الأدنى", key: "minimumThreshold" },
          { header: "الحالة", key: "status" },
        ],
        rows: uncategorized.map((m) => ({
          name: m.name,
          unit: m.unit,
          quantity: m.quantity,
          unitPrice: m.unitPrice,
          totalPrice: m.totalPrice,
          minimumThreshold: m.minimumThreshold,
          status: m.isLowStock ? "نقص مخزون" : "متاح",
        })),
      });
      sheets.push({
        name: "بدون نوع - حركات",
        columns: [
          { header: "الخامة", key: "materialName" },
          { header: "النوع", key: "movementType" },
          { header: "الكمية", key: "quantity" },
          { header: "السعر وقت الحركة", key: "unitPriceAtTime" },
          { header: "المصدر", key: "source" },
          { header: "التاريخ", key: "date" },
          { header: "المستخدم", key: "user" },
        ],
        rows: movements
          .filter((mv) => ids.has(mv.materialId))
          .map((mv) => ({
            materialName: mv.materialName,
            movementType: movementTypeLabels[mv.movementType] ?? mv.movementType,
            quantity: mv.quantity,
            unitPriceAtTime: mv.unitPriceAtTime,
            source: mv.projectName ?? mv.supplierName ?? "-",
            date: formatDate(mv.movementDate),
            user: mv.createdByEmployeeName,
          })),
      });
    }

    return sheets;
  }

  if (view !== null) {
    let title: string;
    let scopedMaterials: MaterialDTO[];
    let extraFieldDefinitions: MaterialCategoryDTO["extraFieldDefinitions"] = [];

    if (view === ALL) {
      title = "كل الأصناف";
      scopedMaterials = materials;
    } else if (view === UNCATEGORIZED) {
      title = "بدون نوع";
      scopedMaterials = uncategorized;
    } else {
      const category = categories.find((c) => c.id === view)!;
      title = category.name;
      scopedMaterials = materials.filter((m) => m.categoryId === view);
      extraFieldDefinitions = category.extraFieldDefinitions;
    }

    return (
      <div className="flex flex-col gap-stack-lg">
        <CategoryMaterialsTable
          title={title}
          materials={scopedMaterials}
          extraFieldDefinitions={extraFieldDefinitions}
          movements={movements}
          onBack={() => setView(null)}
        />

        <MaterialFormDialog open={createOpen} onClose={() => setCreateOpen(false)} categories={categories} />
        <PurchaseDialog open={purchaseOpen} onClose={() => setPurchaseOpen(false)} materials={materials} suppliers={suppliers} />
        <IssueReturnDialog open={issueOpen} onClose={() => setIssueOpen(false)} mode="issue" materials={materials} projects={projects} />
        <IssueReturnDialog open={returnOpen} onClose={() => setReturnOpen(false)} mode="return" materials={materials} projects={projects} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="flex items-center justify-between flex-wrap gap-stack-sm">
        <div>
          <h1 className="text-headline-md text-on-surface">المخزون</h1>
          <p className="text-body-sm text-on-surface-variant">{materials.length} خامة</p>
        </div>
        <div className="flex flex-wrap gap-stack-sm">
          {canManage && (
            <>
              <Button variant="secondary" onClick={() => setCategoriesOpen(true)}>
                <Icon name="category" size={18} />
                إدارة الأنواع
              </Button>
              <Button variant="secondary" onClick={() => setReturnOpen(true)}>
                <Icon name="undo" size={18} />
                مرتجع
              </Button>
              <Button variant="secondary" onClick={() => setIssueOpen(true)}>
                <Icon name="output" size={18} />
                صرف لمشروع
              </Button>
              <Button variant="secondary" onClick={() => setPurchaseOpen(true)}>
                <Icon name="shopping_cart" size={18} />
                شراء
              </Button>
              <Button onClick={() => setCreateOpen(true)}>
                <Icon name="add" />
                خامة جديدة
              </Button>
            </>
          )}
          <MultiSheetExportButton filename="المخزون" sheets={fullExportSheets()} label="تصدير كل المخزون" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-gutter">
        <CategoryCard name="كل الأصناف" icon="apps" itemsCount={materials.length} totalValue={materials.reduce((s, m) => s + m.totalPrice, 0)} onClick={() => setView(ALL)} />
        {categoryStats.map(({ category, itemsCount, totalValue }) => (
          <CategoryCard key={category.id} name={category.name} icon="category" itemsCount={itemsCount} totalValue={totalValue} onClick={() => setView(category.id)} />
        ))}
        {uncategorized.length > 0 && (
          <CategoryCard
            name="بدون نوع"
            icon="widgets"
            itemsCount={uncategorized.length}
            totalValue={uncategorized.reduce((s, m) => s + m.totalPrice, 0)}
            onClick={() => setView(UNCATEGORIZED)}
          />
        )}
      </div>

      <MaterialFormDialog open={createOpen} onClose={() => setCreateOpen(false)} categories={categories} />
      <PurchaseDialog open={purchaseOpen} onClose={() => setPurchaseOpen(false)} materials={materials} suppliers={suppliers} />
      <IssueReturnDialog open={issueOpen} onClose={() => setIssueOpen(false)} mode="issue" materials={materials} projects={projects} />
      <IssueReturnDialog open={returnOpen} onClose={() => setReturnOpen(false)} mode="return" materials={materials} projects={projects} />
      <CategoryManagerDialog open={categoriesOpen} onClose={() => setCategoriesOpen(false)} categories={categories} />
    </div>
  );
}
