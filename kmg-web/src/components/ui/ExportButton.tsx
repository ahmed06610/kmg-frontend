"use client";

import * as XLSX from "xlsx";
import { Button } from "./Button";
import { Icon } from "./Icon";

interface Column {
  header: string;
  key: string;
}

interface ExportButtonProps {
  filename: string;
  columns: Column[];
  rows: Record<string, string | number>[];
}

// ملحوظة أمان: بنستخدم xlsx للكتابة بس (json_to_sheet/writeFile) على بيانات
// إحنا مصدرها من الـ API، من غير أي XLSX.read لملف خارجي - الثغرات المعروفة في
// المكتبة (Prototype Pollution / ReDoS) بتخص قراءة ملفات غير موثوقة، مش الاستخدام هنا
export function ExportButton({ filename, columns, rows }: ExportButtonProps) {
  function handleExport() {
    const data = rows.map((row) => {
      const record: Record<string, string | number> = {};
      for (const col of columns) record[col.header] = row[col.key];
      return record;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet["!cols"] = columns.map(() => ({ wch: 18 }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "بيانات");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleExport} disabled={rows.length === 0}>
      <Icon name="download" size={16} />
      تصدير Excel
    </Button>
  );
}
