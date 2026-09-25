// نفس قيم الـ Enums في الباك اند (KMG.Core/Enums/*) - رقمية عشان دي طريقة الإرسال الافتراضية لـ System.Text.Json

export const EmployeeType = { Admin: 1, Worker: 2 } as const;
export const WageType = { Monthly: 1, Daily: 2 } as const;

export const ProjectType = { ManufactureExecution: 1, Subcontracting: 2, Supply: 3 } as const;
export const ProjectStatus = {
  New: 1,
  MaterialsReview: 2,
  PurchaseOrder: 3,
  Manufacturing: 4,
  Mission: 5,
  Completed: 6,
  Closed: 7,
} as const;
export const ExpenseCategory = {
  TenderInsurance: 1,
  TenderTax: 2,
  Procedural: 3,
  MissionSettlementDiff: 4,
  Breakdown: 5,
  Other: 6,
} as const;

export const AdjustmentType = { Deduction: 1, Bonus: 2 } as const;

export const CheckResolutionAction = { Clear: 1, Reschedule: 2, Cancel: 3 } as const;

export const MiscExpenseCategory = { Administrative: 1, Operational: 2, Other: 3 } as const;

export const TransactionType = {
  ProjectPaymentIn: 1,
  SupplierPaymentOut: 2,
  ProjectExpenseOut: 3,
  MissionAdvanceOut: 4,
  MissionSettlementIn: 5,
  PayrollOut: 6,
  StockPurchaseOut: 7,
  AdvanceOut: 8,
  MissionSettlementOut: 9,
  MiscExpenseOut: 10,
  InsuranceRecoveredIn: 11,
  GuaranteeRecoveredIn: 12,
  CustodyOut: 13,
  CustodySettlementIn: 14,
  CustodySettlementOut: 15,
  EmployeeInsuranceOut: 16,
} as const;

export const projectTypeLabels: Record<string, string> = {
  ManufactureExecution: "تصنيع وتنفيذ",
  Subcontracting: "مقاولات من الباطن",
  Supply: "توريد",
};

export const projectStatusLabels: Record<string, string> = {
  New: "جديد",
  MaterialsReview: "مراجعة الخامات",
  PurchaseOrder: "أمر شراء",
  Manufacturing: "تصنيع",
  Mission: "مأمورية",
  Completed: "مكتمل",
  Closed: "مغلق",
};

export const expenseCategoryLabels: Record<string, string> = {
  TenderInsurance: "تأمين مناقصة",
  TenderTax: "ضريبة مناقصة",
  Procedural: "دفعة إجرائية",
  MissionSettlementDiff: "فرق تسوية عهدة",
  Breakdown: "عطل",
  Other: "أخرى",
  WorkGuarantee: "ضمان أعمال",
};

export const movementTypeLabels: Record<string, string> = {
  Purchase: "شراء",
  IssueToProject: "صرف لمشروع",
  ReturnFromProject: "مرتجع من مشروع",
  OpeningBalance: "رصيد افتتاحي",
};

export const transactionTypeLabels: Record<string, string> = {
  ProjectPaymentIn: "تحصيل دفعة مشروع",
  SupplierPaymentOut: "سداد مورد",
  ProjectExpenseOut: "مصروف نثري",
  MissionAdvanceOut: "عهدة مأمورية",
  MissionSettlementIn: "استرجاع فارق عهدة",
  MissionSettlementOut: "سداد فارق عهدة",
  PayrollOut: "صرف راتب",
  StockPurchaseOut: "دفع شراء خامة",
  AdvanceOut: "سلفة موظف",
  MiscExpenseOut: "مصروف نثري عام",
  InsuranceRecoveredIn: "استرداد تأمين مناقصة",
  GuaranteeRecoveredIn: "استرداد ضمان أعمال",
  CustodyOut: "صرف عهدة جانبية",
  CustodySettlementIn: "استرجاع فارق عهدة جانبية",
  CustodySettlementOut: "سداد فارق عهدة جانبية",
  EmployeeInsuranceOut: "صرف تأمينات الموظفين",
};

export const miscExpenseCategoryLabels: Record<string, string> = {
  Administrative: "إداري",
  Operational: "تشغيلي",
  Other: "أخرى",
};

export const employeeTypeLabels: Record<string, string> = {
  Admin: "إداري",
  Worker: "عامل",
};

export const wageTypeLabels: Record<string, string> = {
  Monthly: "شهري",
  Daily: "يومي",
};

export const adjustmentTypeLabels: Record<string, string> = {
  Deduction: "خصم",
  Bonus: "حافز",
};

export const checkStatusLabels: Record<string, string> = {
  Pending: "معلّق",
  Cleared: "متحصّل",
  Cancelled: "ملغي",
};

export const invoiceSourceTypeLabels: Record<string, string> = {
  ProjectPayment: "دفعة مشروع",
  ProjectExpense: "مصروف مشروع",
  StockPurchase: "شراء مخزون",
  StockIssue: "صرف مخزون",
  SupplierPayment: "دفعة مورد",
  MiscExpense: "مصروف نثري",
};
