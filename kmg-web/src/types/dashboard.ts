export interface ProjectsByTypeDTO {
  projectType: string;
  count: number;
  totalValue: number;
}

export interface ProjectsPipelineDTO {
  newCount: number;
  inProgressCount: number;
  completedCount: number;
}

export interface ActiveProjectSummaryDTO {
  id: number;
  name: string;
  projectCode: string;
  clientName: string;
  status: string;
  contractValue: number;
  totalCollected: number;
  actualCost: number;
  netProfit: number;
  progressPercent: number;
}

export interface MonthlyTrendDTO {
  monthLabel: string;
  income: number;
  expenses: number;
  netProfit: number;
}

export interface LowStockMaterialDTO {
  name: string;
  quantity: number;
  unit: string;
  minimumThreshold: number;
}

export interface TopOutstandingDTO {
  name: string;
  amount: number;
}

export interface RecentActivityDTO {
  description: string;
  amount: number;
  date: string;
}

export interface DashboardDTO {
  totalContractValue: number;
  totalContractValueChangePercent: number;

  totalIncome: number;
  incomeChangePercent: number;

  totalExpenses: number;
  expensesChangePercent: number;

  netProfit: number;
  netProfitChangePercent: number;

  cashBoxCash: number;
  cashBoxCredit: number;
  cashBoxTotal: number;

  totalReceivables: number;
  totalPayables: number;

  activeProjectsCount: number;
  completedProjectsCount: number;
  projectsByType: ProjectsByTypeDTO[];
  projectsPipeline: ProjectsPipelineDTO;
  activeProjectsSummary: ActiveProjectSummaryDTO[];

  monthlyTrend: MonthlyTrendDTO[];

  lowStockMaterialsCount: number;
  lowStockMaterials: LowStockMaterialDTO[];

  suppliersWithOutstandingBalanceCount: number;
  supplierPaymentsThisMonth: number;
  topOutstandingSupplier: TopOutstandingDTO | null;

  clientsWithOutstandingBalanceCount: number;
  topOutstandingClient: TopOutstandingDTO | null;

  openMissionsCount: number;
  totalOutstandingAdvances: number;

  recentActivity: RecentActivityDTO[];
}
