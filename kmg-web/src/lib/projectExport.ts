import type { ExcelSheet } from "@/lib/excel";
import { formatCurrency, formatDate } from "@/lib/utils";
import { expenseCategoryLabels, movementTypeLabels, projectStatusLabels, projectTypeLabels } from "@/types/enums";
import type { MissionListDTO } from "@/types/mission";
import type { ProjectDetailsDTO } from "@/types/project";

/** بيبني كل تابات ملف تصدير Excel الشامل لمشروع واحد (نظرة عامة، دفعات، مصاريف، مأموريات، خامات، خصومات، مرفقات، تدقيق) */
export function buildProjectExportSheets(project: ProjectDetailsDTO, missions: MissionListDTO[]): ExcelSheet[] {
  const sheets: ExcelSheet[] = [];

  sheets.push({
    name: "نظرة عامة",
    columns: [
      { header: "البيان", key: "label" },
      { header: "القيمة", key: "value" },
    ],
    rows: [
      { label: "اسم المشروع", value: project.name },
      { label: "الكود", value: project.projectCode },
      { label: "النوع", value: projectTypeLabels[project.projectType] ?? project.projectType },
      { label: "الحالة", value: projectStatusLabels[project.status] ?? project.status },
      { label: "العميل", value: project.clientName },
      { label: "تاريخ الإنشاء", value: formatDate(project.createdAt) },
      { label: "قيمة العقد", value: formatCurrency(project.contractValue) },
      { label: "إجمالي المحصَّل", value: formatCurrency(project.totalCollected) },
      { label: "إجمالي خصم الأعمال", value: formatCurrency(project.totalWriteOffs) },
      { label: "المتبقي", value: formatCurrency(project.remainingBalance) },
      { label: "تكلفة الخامات", value: formatCurrency(project.totalMaterialsCost) },
      { label: "المصاريف النثرية", value: formatCurrency(project.totalPettyExpenses) },
      { label: "تكلفة العمالة", value: formatCurrency(project.totalLaborCost) },
      { label: "صافي الربح", value: formatCurrency(project.netProfit) },
      { label: "الوصف", value: project.description ?? "-" },
    ],
  });

  sheets.push({
    name: "الدفعات",
    columns: [
      { header: "المبلغ", key: "amount" },
      { header: "كاش", key: "amountCash" },
      { header: "كريديت", key: "amountCredit" },
      { header: "التاريخ", key: "date" },
      { header: "ملاحظات", key: "notes" },
    ],
    rows: project.payments.map((p) => ({
      amount: p.amount,
      amountCash: p.amountCash,
      amountCredit: p.amountCredit,
      date: formatDate(p.paymentDate),
      notes: p.notes ?? "-",
    })),
  });

  sheets.push({
    name: "المصاريف",
    columns: [
      { header: "التصنيف", key: "category" },
      { header: "القيمة", key: "amount" },
      { header: "الوصف", key: "description" },
      { header: "التاريخ", key: "date" },
    ],
    rows: project.expenses.map((e) => ({
      category: expenseCategoryLabels[e.category] ?? e.category,
      amount: e.amount,
      description: e.description ?? "-",
      date: formatDate(e.expenseDate),
    })),
  });

  sheets.push({
    name: "المأموريات",
    columns: [
      { header: "رئيس العمال", key: "foreman" },
      { header: "البداية", key: "startDate" },
      { header: "النهاية", key: "endDate" },
      { header: "العهدة", key: "advanceAmount" },
      { header: "المصروف الفعلي", key: "actualSpent" },
      { header: "الحالة", key: "status" },
    ],
    rows: missions.map((m) => ({
      foreman: m.foremanName,
      startDate: formatDate(m.startDate),
      endDate: m.endDate ? formatDate(m.endDate) : "-",
      advanceAmount: m.advanceAmount,
      actualSpent: m.status === "Settled" ? m.actualSpent : "-",
      status: m.status === "Settled" ? "متسواة" : "مفتوحة",
    })),
  });

  sheets.push({
    name: "الخامات",
    columns: [
      { header: "الخامة", key: "materialName" },
      { header: "النوع", key: "movementType" },
      { header: "الكمية", key: "quantity" },
      { header: "السعر وقت الحركة", key: "unitPriceAtTime" },
      { header: "التاريخ", key: "date" },
      { header: "ملاحظات", key: "notes" },
    ],
    rows: project.stockMovements.map((m) => ({
      materialName: m.materialName,
      movementType: movementTypeLabels[m.movementType] ?? m.movementType,
      quantity: m.quantity,
      unitPriceAtTime: m.unitPriceAtTime,
      date: formatDate(m.movementDate),
      notes: m.notes ?? "-",
    })),
  });

  sheets.push({
    name: "خصم أعمال المشروع",
    columns: [
      { header: "القيمة", key: "amount" },
      { header: "السبب", key: "reason" },
      { header: "التاريخ", key: "date" },
    ],
    rows: project.writeOffs.map((w) => ({ amount: w.amount, reason: w.reason, date: formatDate(w.writeOffDate) })),
  });

  sheets.push({
    name: "المرفقات",
    columns: [
      { header: "اسم الملف", key: "fileName" },
      { header: "الوصف", key: "description" },
      { header: "رفعه", key: "uploadedBy" },
      { header: "التاريخ", key: "date" },
      { header: "الرابط", key: "url" },
    ],
    rows: project.attachments.map((a) => ({
      fileName: a.fileName ?? "-",
      description: a.description ?? "-",
      uploadedBy: a.uploadedByEmployeeName,
      date: formatDate(a.uploadedAt),
      url: a.fileUrl,
    })),
  });

  sheets.push({
    name: "سجل التدقيق",
    columns: [
      { header: "الإجراء", key: "action" },
      { header: "بواسطة", key: "employee" },
      { header: "التاريخ", key: "date" },
    ],
    rows: project.auditLogs.map((a) => ({ action: a.actionDescription, employee: a.employeeName, date: formatDate(a.actionDate) })),
  });

  return sheets;
}
