"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { MultiSheetExportButton } from "@/components/ui/ExportButton";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTableState } from "@/lib/useTableState";
import { movementTypeLabels } from "@/types/enums";
import type { CategoryFieldDefinitionDTO, MaterialDTO, StockMovementDTO } from "@/types/stock";

interface Props {
  title: string;
  materials: MaterialDTO[];
  extraFieldDefinitions: CategoryFieldDefinitionDTO[];
  movements: StockMovementDTO[];
  onBack: () => void;
}

export function CategoryMaterialsTable({ title, materials, extraFieldDefinitions, movements, onBack }: Props) {
  const columnMatchers = useMemo(() => {
    const matchers: Record<string, (m: MaterialDTO, value: string) => boolean> = {
      name: (m, v) => m.name.toLowerCase().includes(v),
      unit: (m, v) => m.unit.toLowerCase().includes(v),
      quantity: (m, v) => String(m.quantity).includes(v),
      unitPrice: (m, v) => String(m.unitPrice).includes(v),
      totalPrice: (m, v) => String(m.totalPrice).includes(v),
      minimumThreshold: (m, v) => String(m.minimumThreshold).includes(v),
      status: (m, v) => (m.isLowStock ? "نقص مخزون" : "متاح").includes(v),
    };
    for (const f of extraFieldDefinitions) {
      matchers[f.key] = (m, v) => (m.extraFieldValues[f.key] ?? "").toLowerCase().includes(v);
    }
    return matchers;
  }, [extraFieldDefinitions]);

  const table = useTableState({
    rows: materials,
    pageSize: 10,
    searchPredicate: (m, term) => m.name.toLowerCase().includes(term) || m.unit.toLowerCase().includes(term),
    columnMatchers,
  });

  const materialIds = useMemo(() => new Set(materials.map((m) => m.id)), [materials]);
  const scopedMovements = useMemo(() => movements.filter((mv) => materialIds.has(mv.materialId)), [movements, materialIds]);

  const baseColumns: { key: string; label: string }[] = [
    { key: "name", label: "الخامة" },
    { key: "unit", label: "الوحدة" },
    { key: "quantity", label: "الكمية المتاحة" },
    { key: "unitPrice", label: "سعر الوحدة" },
    { key: "totalPrice", label: "الإجمالي" },
    { key: "minimumThreshold", label: "الحد الأدنى" },
    { key: "status", label: "الحالة" },
  ];
  const allColumns = [...baseColumns, ...extraFieldDefinitions.map((f) => ({ key: f.key, label: f.label }))];

  function exportSheets() {
    return [
      {
        name: title,
        columns: allColumns.map((c) => ({ header: c.label, key: c.key })),
        rows: table.filteredRows.map((m) => ({
          name: m.name,
          unit: m.unit,
          quantity: m.quantity,
          unitPrice: m.unitPrice,
          totalPrice: m.totalPrice,
          minimumThreshold: m.minimumThreshold,
          status: m.isLowStock ? "نقص مخزون" : "متاح",
          ...Object.fromEntries(extraFieldDefinitions.map((f) => [f.key, m.extraFieldValues[f.key] ?? ""])),
        })),
      },
      {
        name: `${title} - حركات`,
        columns: [
          { header: "الخامة", key: "materialName" },
          { header: "النوع", key: "movementType" },
          { header: "الكمية", key: "quantity" },
          { header: "السعر وقت الحركة", key: "unitPriceAtTime" },
          { header: "المصدر", key: "source" },
          { header: "التاريخ", key: "date" },
          { header: "المستخدم", key: "user" },
        ],
        rows: scopedMovements.map((mv) => ({
          materialName: mv.materialName,
          movementType: movementTypeLabels[mv.movementType] ?? mv.movementType,
          quantity: mv.quantity,
          unitPriceAtTime: mv.unitPriceAtTime,
          source: mv.projectName ?? mv.supplierName ?? "-",
          date: formatDate(mv.movementDate),
          user: mv.createdByEmployeeName,
        })),
      },
    ];
  }

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex items-center justify-between flex-wrap gap-stack-sm">
        <div className="flex items-center gap-stack-sm">
          <Button variant="secondary" size="sm" onClick={onBack}>
            <Icon name="arrow_forward" size={18} />
            كل الأنواع
          </Button>
          <h2 className="text-title-sm text-on-surface font-semibold">{title}</h2>
          <span className="text-xs text-on-surface-variant">({materials.length} صنف)</span>
        </div>
        <div className="flex items-center gap-stack-sm">
          <SearchInput value={table.search} onChange={table.setSearch} placeholder="بحث بالاسم أو الوحدة..." />
          <MultiSheetExportButton filename={title} sheets={exportSheets()} />
        </div>
      </div>

      {materials.length === 0 ? (
        <EmptyState icon="inventory_2" title="لا توجد أصناف في هذا النوع" />
      ) : (
        <>
          <Table>
            <THead>
              <tr>
                {allColumns.map((c) => (
                  <Th key={c.key}>{c.label}</Th>
                ))}
              </tr>
              <tr>
                {allColumns.map((c) => (
                  <th key={c.key} className="p-1.5">
                    <input
                      value={table.filters[c.key] ?? ""}
                      onChange={(e) => table.setFilter(c.key, e.target.value)}
                      placeholder="فلتر..."
                      className="w-full rounded bg-surface-container-low border border-outline-variant px-2 py-1 text-xs outline-none focus:border-primary"
                    />
                  </th>
                ))}
              </tr>
            </THead>
            <TBody>
              {table.pageRows.length === 0 ? (
                <tr>
                  <td colSpan={allColumns.length} className="p-stack-lg text-center text-body-sm text-on-surface-variant">
                    لا توجد نتائج مطابقة للفلاتر
                  </td>
                </tr>
              ) : (
                table.pageRows.map((m) => (
                  <Tr key={m.id}>
                    <Td>
                      <Link href={`/stock/${m.id}`} className="text-primary font-semibold hover:underline">
                        {m.name}
                      </Link>
                    </Td>
                    <Td>{m.unit}</Td>
                    <TdMono>{m.quantity}</TdMono>
                    <TdMono>{formatCurrency(m.unitPrice)}</TdMono>
                    <TdMono>{formatCurrency(m.totalPrice)}</TdMono>
                    <TdMono>{m.minimumThreshold}</TdMono>
                    <Td>{m.isLowStock ? <Badge tone="error">نقص مخزون</Badge> : <Badge tone="success">متاح</Badge>}</Td>
                    {extraFieldDefinitions.map((f) => (
                      <Td key={f.key}>{m.extraFieldValues[f.key] ?? "-"}</Td>
                    ))}
                  </Tr>
                ))
              )}
            </TBody>
          </Table>
          <Pagination page={table.page} pageSize={table.pageSize} totalCount={table.totalCount} onPageChange={table.setPage} />
        </>
      )}
    </div>
  );
}
