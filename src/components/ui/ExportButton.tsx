"use client";

import { downloadWorkbook, type ExcelColumn, type ExcelSheet } from "@/lib/excel";
import { Button } from "./Button";
import { Icon } from "./Icon";

interface ExportButtonProps {
  filename: string;
  columns: ExcelColumn[];
  rows: Record<string, string | number>[];
}

export function ExportButton({ filename, columns, rows }: ExportButtonProps) {
  function handleExport() {
    downloadWorkbook(filename, [{ name: "بيانات", columns, rows }]);
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleExport} disabled={rows.length === 0}>
      <Icon name="download" size={16} />
      تصدير Excel
    </Button>
  );
}

/** زرار تصدير لملف بأكتر من تاب (شيت) - كل عنصر في sheets بيبقى تاب منفصل في نفس الملف */
export function MultiSheetExportButton({
  filename,
  sheets,
  label = "تصدير Excel",
  disabled,
}: {
  filename: string;
  sheets: ExcelSheet[];
  label?: string;
  disabled?: boolean;
}) {
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
