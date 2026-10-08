import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Table, TBody, Td, TdMono, Th, THead, Tr } from "@/components/ui/Table";
import { aggregateProjectMaterials } from "@/lib/project-materials";
import { formatCurrency } from "@/lib/utils";
import type { MaterialCategoryDTO, MaterialDTO, StockMovementDTO } from "@/types/stock";

/** ملخص الخامات المصروفة على المشروع: كل خامة بسعرها، الكمية الصافية، الإجمالي (الكمية × السعر)، وسطر بالمجموع الكلي */
export function ProjectMaterialsSummary({
  movements,
  materials,
  categories,
  totalMaterialsCost,
}: {
  movements: StockMovementDTO[];
  materials: MaterialDTO[];
  categories: MaterialCategoryDTO[];
  totalMaterialsCost: number;
}) {
  const lines = aggregateProjectMaterials(movements, materials, categories);

  return (
    <Card className="overflow-hidden !p-0">
      <div className="px-gutter py-stack-md border-b border-outline-variant flex items-center justify-between">
        <p className="text-title-sm text-on-surface flex items-center gap-2">
          <Icon name="inventory_2" size={18} className="text-primary" />
          الخامات المصروفة على المشروع
        </p>
        <span className="text-xs text-on-surface-variant">{lines.length} صنف</span>
      </div>
      {lines.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant text-center py-stack-lg">لسه مفيش خامات اتصرفت على المشروع ده</p>
      ) : (
        <Table>
          <THead>
            <tr>
              <Th>الخامة</Th>
              <Th>الكمية الصافية</Th>
              <Th>سعر الوحدة</Th>
              <Th>الإجمالي</Th>
            </tr>
          </THead>
          <TBody>
            {lines.map((l) => (
              <Tr key={l.key}>
                <Td>{l.label}</Td>
                <TdMono>
                  {l.netQuantity} {l.unit}
                </TdMono>
                <TdMono>{formatCurrency(l.unitPrice)}</TdMono>
                <TdMono className="font-semibold">{formatCurrency(l.total)}</TdMono>
              </Tr>
            ))}
            <tr className="bg-surface-container-low font-semibold">
              <td colSpan={3} className="p-stack-md text-body-sm text-on-surface">
                إجمالي تكلفة الخامات
              </td>
              <td dir="ltr" className="p-stack-md text-mono-data text-primary text-right">
                {formatCurrency(totalMaterialsCost)}
              </td>
            </tr>
          </TBody>
        </Table>
      )}
    </Card>
  );
}
