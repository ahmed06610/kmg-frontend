export interface ProjectsByTypeDTO {
  projectType: string;
  count: number;
  totalValue: number;
}

export interface RecentActivityDTO {
  description: string;
  amount: number;
  date: string;
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
  openMissionsCount: number;
  totalOutstandingAdvances: number;
  clientsWithOutstandingBalanceCount: number;
  recentActivity: RecentActivityDTO[];
}
