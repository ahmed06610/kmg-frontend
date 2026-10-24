import { tr } from "@/lib/i18n/global";
import type { ExcelSheet } from "@/lib/excel";
import { formatCurrency, formatDate } from "@/lib/utils";
import { expenseCategoryLabels, movementTypeLabels, projectStatusLabels, projectTypeLabels } from "@/types/enums";
import type { MissionListDTO } from "@/types/mission";
import type { ProjectDetailsDTO } from "@/types/project";

/** بيبني كل تابات ملف تصدير Excel الشامل لمشروع واحد (نظرة عامة، دفعات، مصاريف، مأموريات، خامات، خصومات، مرفقات، تدقيق) */
export function buildProjectExportSheets(project: ProjectDetailsDTO, missions: MissionListDTO[]): ExcelSheet[] {
  const sheets: ExcelSheet[] = [];

  sheets.push({
    name: tr("نظرة عامة"),
    columns: [
      { header: tr("البيان"), key: "label" },
      { header: tr("القيمة"), key: "value" },
    ],
    rows: [
      { label: tr("اسم المشروع"), value: project.name },
      { label: tr("الكود"), value: project.projectCode },
      { label: tr("النوع"), value: tr(projectTypeLabels[project.projectType] ?? project.projectType) },
      { label: tr("الحالة"), value: tr(projectStatusLabels[project.status] ?? project.status) },
      { label: tr("العميل"), value: project.clientName },
      { label: tr("تاريخ الإنشاء"), value: formatDate(project.createdAt) },
      { label: tr("قيمة العقد"), value: formatCurrency(project.contractValue) },
      { label: tr("إجمالي المحصَّل"), value: formatCurrency(project.totalCollected) },
      { label: tr("إجمالي خصم الأعمال"), value: formatCurrency(project.totalWriteOffs) },
      { label: tr("المتبقي"), value: formatCurrency(project.remainingBalance) },
      { label: tr("تكلفة الخامات"), value: formatCurrency(project.totalMaterialsCost) },
      { label: tr("المصاريف النثرية"), value: formatCurrency(project.totalPettyExpenses) },
      { label: tr("تكلفة العمالة"), value: formatCurrency(project.totalLaborCost) },
      { label: tr("عهد المأموريات"), value: formatCurrency(project.totalMissionCustodyCost) },
      { label: tr("العهد الجانبية"), value: formatCurrency(project.totalSideCustodyCost) },
      { label: tr("إجمالي التكلفة"), value: formatCurrency(project.totalCost) },
      { label: tr("صافي الربح"), value: formatCurrency(project.netProfit) },
      { label: tr("الوصف"), value: project.description ?? "-" },
    ],
  });

  sheets.push({
    name: tr("الدفعات"),
    columns: [
      { header: tr("المبلغ"), key: "amount" },
      { header: tr("كاش"), key: "amountCash" },
      { header: tr("كريديت"), key: "amountCredit" },
      { header: tr("التاريخ"), key: "date" },
      { header: tr("ملاحظات"), key: "notes" },
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
    name: tr("المصاريف"),
    columns: [
      { header: tr("التصنيف"), key: "category" },
      { header: tr("القيمة"), key: "amount" },
      { header: tr("الوصف"), key: "description" },
      { header: tr("التاريخ"), key: "date" },
    ],
    rows: project.expenses.map((e) => ({
      category: tr(expenseCategoryLabels[e.category] ?? e.category),
      amount: e.amount,
      description: e.description ?? "-",
      date: formatDate(e.expenseDate),
    })),
  });

  sheets.push({
    name: tr("المأموريات"),
    columns: [
      { header: tr("رئيس العمال"), key: "foreman" },
      { header: tr("البداية"), key: "startDate" },
      { header: tr("النهاية"), key: "endDate" },
      { header: tr("العهدة"), key: "advanceAmount" },
      { header: tr("المصروف الفعلي"), key: "actualSpent" },
      { header: tr("الحالة"), key: "status" },
    ],
    rows: missions.map((m) => ({
      foreman: m.foremanName,
      startDate: formatDate(m.startDate),
      endDate: m.endDate ? formatDate(m.endDate) : "-",
      advanceAmount: m.advanceAmount,
      actualSpent: m.status === "Settled" ? m.actualSpent : "-",
      status: m.status === "Settled" ? tr("متسواة") : tr("مفتوحة"),
    })),
  });

  sheets.push({
    name: tr("الخامات"),
    columns: [
      { header: tr("الخامة"), key: "materialName" },
      { header: tr("النوع"), key: "movementType" },
      { header: tr("الكمية"), key: "quantity" },
      { header: tr("السعر وقت الحركة"), key: "unitPriceAtTime" },
      { header: tr("الإجمالي"), key: "total" },
      { header: tr("التاريخ"), key: "date" },
      { header: tr("ملاحظات"), key: "notes" },
    ],
    rows: project.stockMovements.map((m) => ({
      materialName: m.materialName,
      movementType: tr(movementTypeLabels[m.movementType] ?? m.movementType),
      quantity: m.quantity,
      unitPriceAtTime: m.unitPriceAtTime,
      total: m.quantity * m.unitPriceAtTime,
      date: formatDate(m.movementDate),
      notes: m.notes ?? "-",
    })),
  });

  sheets.push({
    name: tr("العهد"),
    columns: [
      { header: tr("الموظف"), key: "employee" },
      { header: tr("الوصف"), key: "description" },
      { header: tr("القيمة"), key: "amount" },
      { header: tr("المصروف الفعلي"), key: "settledAmount" },
      { header: tr("تاريخ الصرف"), key: "date" },
      { header: tr("الحالة"), key: "status" },
    ],
    rows: project.custodies.map((c) => ({
      employee: c.employeeName,
      description: c.description,
      amount: c.amount,
      settledAmount: c.settledAmount ?? "-",
      date: formatDate(c.issueDate),
      status: c.status === "Settled" ? tr("متسواة") : tr("نشطة"),
    })),
  });

  sheets.push({
    name: tr("خصم أعمال المشروع"),
    columns: [
      { header: tr("القيمة"), key: "amount" },
      { header: tr("السبب"), key: "reason" },
      { header: tr("التاريخ"), key: "date" },
    ],
    rows: project.writeOffs.map((w) => ({ amount: w.amount, reason: w.reason, date: formatDate(w.writeOffDate) })),
  });

  sheets.push({
    name: tr("المرفقات"),
    columns: [
      { header: tr("اسم الملف"), key: "fileName" },
      { header: tr("الوصف"), key: "description" },
      { header: tr("رفعه"), key: "uploadedBy" },
      { header: tr("التاريخ"), key: "date" },
      { header: tr("الرابط"), key: "url" },
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
    name: tr("سجل التدقيق"),
    columns: [
      { header: tr("الإجراء"), key: "action" },
      { header: tr("بواسطة"), key: "employee" },
      { header: tr("التاريخ"), key: "date" },
    ],
    rows: project.auditLogs.map((a) => ({ action: a.actionDescription, employee: a.employeeName, date: formatDate(a.actionDate) })),
  });

  return sheets;
}
