import ExcelJS from "exceljs";
import { sanitizeSheetName } from "./excel";
import { getGlobalLocale, tr } from "./i18n/global";

// ألوان معبّرة بنفس منطق Excel القياسي (Good/Bad/Neutral): خصومات بالأحمر، حوافز/إضافي بالأخضر،
// صافي بالأصفر، اسم الموظف بلون مميز، وباقي الأعمدة بألوان محايدة حسب الفئة - زي الشيت اليدوي اللي المحاسب متعود عليه
type ColumnCategory = "name" | "neutral" | "total" | "advance" | "bad" | "good" | "net";

const PALETTE: Record<ColumnCategory, { headerFill: string; headerFont: string; cellFill: string; cellFont: string }> = {
  name: { headerFill: "FFBF8F00", headerFont: "FFFFFFFF", cellFill: "FFFFD966", cellFont: "FF3B3000" },
  neutral: { headerFill: "FFD9D9D9", headerFont: "FF000000", cellFill: "FFF2F2F2", cellFont: "FF000000" },
  total: { headerFill: "FF9DC3E6", headerFont: "FF1F3864", cellFill: "FFDDEBF7", cellFont: "FF1F3864" },
  advance: { headerFill: "FFF4B183", headerFont: "FF7F3200", cellFill: "FFFCE4D6", cellFont: "FF7F3200" },
  bad: { headerFill: "FFE06666", headerFont: "FFFFFFFF", cellFill: "FFFFC7CE", cellFont: "FF9C0006" },
  good: { headerFill: "FF93C47D", headerFont: "FF1E4620", cellFill: "FFC6EFCE", cellFont: "FF006100" },
  net: { headerFill: "FFF1C232", headerFont: "FF5C4400", cellFill: "FFFFEB9C", cellFont: "FF9C6500" },
};

const TITLE_FILL = "FF1F4E78";

export interface StyledPayrollRow {
  name: string;
  workshop: number;
  travel: number;
  totalDays: number;
  rate: number;
  gross: number;
  advanceBalance: number;
  advanceDeducted: number;
  netAfterAdvance: number;
  insurance: number;
  misrInsurance: number;
  hourlyDeduction: number;
  hourlyBonus: number;
  net: number;
}

export interface StyledPayrollWeek {
  sheetName: string;
  periodLabel: string;
  rows: StyledPayrollRow[];
}

interface ColumnSpec {
  header: string;
  key: keyof StyledPayrollRow;
  category: ColumnCategory;
  width: number;
}

const COLUMNS: ColumnSpec[] = [
  { header: "الاسم", key: "name", category: "name", width: 22 },
  { header: "ورشة", key: "workshop", category: "neutral", width: 9 },
  { header: "سفر", key: "travel", category: "neutral", width: 9 },
  { header: "الإجمالي", key: "totalDays", category: "neutral", width: 10 },
  { header: "الراتب", key: "rate", category: "neutral", width: 10 },
  { header: "الإجمالي", key: "gross", category: "total", width: 12 },
  { header: "سلف", key: "advanceBalance", category: "advance", width: 12 },
  { header: "خ/سلف", key: "advanceDeducted", category: "bad", width: 12 },
  { header: "صافي سلف", key: "netAfterAdvance", category: "net", width: 12 },
  { header: "تأمين اجتماعي", key: "insurance", category: "bad", width: 14 },
  { header: "مصر للتأمين", key: "misrInsurance", category: "bad", width: 14 },
  { header: "خصم ساعات", key: "hourlyDeduction", category: "bad", width: 12 },
  { header: "اضافي ساعات", key: "hourlyBonus", category: "good", width: 12 },
  { header: "صافي الراتب", key: "net", category: "net", width: 14 },
];

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFBFBFBF" } },
  left: { style: "thin", color: { argb: "FFBFBFBF" } },
  bottom: { style: "thin", color: { argb: "FFBFBFBF" } },
  right: { style: "thin", color: { argb: "FFBFBFBF" } },
};

/** يبني ملف Excel معبّر بالألوان - شيت لكل أسبوع، وبلوك مستقل لكل موظف بعنوانه الخاص، بدل جدول نمطي واحد */
export async function downloadStyledWeeklyPayroll(filename: string, weeks: StyledPayrollWeek[]) {
  const workbook = new ExcelJS.Workbook();
  const usedNames = new Set<string>();

  for (const week of weeks) {
    const sheet = workbook.addWorksheet(sanitizeSheetName(week.sheetName, usedNames), {
      views: [{ rightToLeft: getGlobalLocale() === "ar" }],
    });
    sheet.columns = COLUMNS.map((c) => ({ width: c.width }));

    let rowIndex = 1;
    for (const row of week.rows) {
      sheet.mergeCells(rowIndex, 1, rowIndex, COLUMNS.length);
      const titleCell = sheet.getCell(rowIndex, 1);
      titleCell.value = week.periodLabel;
      titleCell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
      titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TITLE_FILL } };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      sheet.getRow(rowIndex).height = 22;
      rowIndex++;

      const headerRow = sheet.getRow(rowIndex);
      COLUMNS.forEach((col, i) => {
        const cell = headerRow.getCell(i + 1);
        const palette = PALETTE[col.category];
        cell.value = tr(col.header);
        cell.font = { bold: true, color: { argb: palette.headerFont } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: palette.headerFill } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = THIN_BORDER;
      });
      rowIndex++;

      const dataRow = sheet.getRow(rowIndex);
      COLUMNS.forEach((col, i) => {
        const cell = dataRow.getCell(i + 1);
        const palette = PALETTE[col.category];
        cell.value = row[col.key];
        cell.font = { bold: col.category === "name" || col.category === "net", color: { argb: palette.cellFont } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: palette.cellFill } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = THIN_BORDER;
        if (col.key !== "name") cell.numFmt = "#,##0.00";
      });
      rowIndex += 2; // صف فاضي بين كل موظف والتاني
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
