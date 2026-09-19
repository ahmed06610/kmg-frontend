import * as XLSX from "xlsx";

// ملحوظة أمان: بنستخدم xlsx للكتابة بس (json_to_sheet/writeFile) على بيانات إحنا مصدرها
// من الـ API، من غير أي XLSX.read لملف خارجي - نفس ملحوظة ExportButton.tsx

export interface ExcelColumn {
  header: string;
  key: string;
}

export interface ExcelSheet {
  name: string;
  columns: ExcelColumn[];
  rows: Record<string, string | number | null | undefined>[];
}

function sanitizeSheetName(name: string, used: Set<string>): string {
  const cleaned = name.replace(/[:\\/?*[\]]/g, " ").trim().slice(0, 31) || "Sheet";
  let candidate = cleaned;
  let i = 2;
  while (used.has(candidate)) {
    const suffix = ` ${i}`;
    candidate = cleaned.slice(0, 31 - suffix.length) + suffix;
    i++;
  }
  used.add(candidate);
  return candidate;
}

/** يبني ملف Excel بتاب واحد أو أكتر ويبدأ تنزيله على جهاز المستخدم */
export function downloadWorkbook(filename: string, sheets: ExcelSheet[]) {
  const workbook = XLSX.utils.book_new();
  const usedNames = new Set<string>();

  for (const sheet of sheets) {
    const data = sheet.rows.map((row) => {
      const record: Record<string, string | number> = {};
      for (const col of sheet.columns) record[col.header] = row[col.key] ?? "";
      return record;
    });

    const worksheet =
      data.length > 0 ? XLSX.utils.json_to_sheet(data) : XLSX.utils.aoa_to_sheet([sheet.columns.map((c) => c.header)]);
    worksheet["!cols"] = sheet.columns.map(() => ({ wch: 18 }));

    XLSX.utils.book_append_sheet(workbook, worksheet, sanitizeSheetName(sheet.name, usedNames));
  }

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
