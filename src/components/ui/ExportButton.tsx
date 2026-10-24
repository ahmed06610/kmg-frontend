"use client";

import { useT } from "@/lib/i18n/client";
import { downloadWorkbook, type ExcelColumn, type ExcelSheet } from "@/lib/excel";
import { Button } from "./Button";
import { Icon } from "./Icon";

interface ExportButtonProps {
  filename: string;
  columns: ExcelColumn[];
  rows: Record<string, string | number>[];
}

export function ExportButton({ filename, columns, rows }: ExportButtonProps) {
  const t = useT();
  function handleExport() {
    downloadWorkbook(filename, [{ name: t("بيانات"), columns, rows }]);
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleExport} disabled={rows.length === 0}>
      <Icon name="download" size={16} />
      {t("تصدير Excel")}</Button>
  );
}

/** زرار تصدير لملف بأكتر من تاب (شيت) - كل عنصر في sheets بيبقى تاب منفصل في نفس الملف */
export function MultiSheetExportButton({
  filename,
  sheets,
  label,
  disabled,
}: {
  filename: string;
  sheets: ExcelSheet[];
  label?: string;
  disabled?: boolean;
}) {
  const t = useT();
  label ??= t("تصدير Excel");
  function handleExport() {
    downloadWorkbook(filename, sheets);
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleExport} disabled={disabled ?? sheets.every((s) => s.rows.length === 0)}>
      <Icon name="download" size={16} />
      {label}
    </Button>
  );
}
