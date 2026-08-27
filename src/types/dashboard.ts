export interface ProjectsByTypeDTO {
  projectType: string;
  count: number;
  totalValue: number;
}

export interface DashboardDTO {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  activeProjectsCount: number;
  completedProjectsCount: number;
  projectsByType: ProjectsByTypeDTO[];
  lowStockMaterialsCount: number;
  lowStockMaterialNames: string[];
  cashBoxCash: number;
  cashBoxCredit: number;
  cashBoxTotal: number;
  suppliersWithOutstandingBalanceCount: number;
  supplierPaymentsThisMonth: number;
}
