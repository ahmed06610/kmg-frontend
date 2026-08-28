import type { StockMovementDTO } from "./stock";

export interface ProjectListDTO {
  id: number;
  projectCode: string;
  projectType: string;
  status: string;
  clientName: string;
  contractValue: number;
  totalCollected: number;
  remainingBalance: number;
  netProfit: number;
  createdAt: string;
}

export interface ProjectPaymentDTO {
  id: number;
  amount: number;
  amountCash: number;
  amountCredit: number;
  paymentDate: string;
  notes: string | null;
}

export interface ProjectExpenseDTO {
  id: number;
  amount: number;
  category: string;
  description: string | null;
  expenseDate: string;
  attachmentUrl: string | null;
}

export interface ProjectAttachmentDTO {
  id: number;
  fileUrl: string;
  fileName: string | null;
  description: string | null;
  uploadedAt: string;
  uploadedByEmployeeName: string;
}

export interface ProjectAuditDTO {
  id: number;
  actionDescription: string;
  actionDate: string;
  employeeName: string;
}

export interface ProjectDetailsDTO extends ProjectListDTO {
  clientId: number;
  clientPhone: string | null;
  clientEmail: string | null;
  clientAddress: string | null;
  description: string | null;
  tenderInsuranceAmount: number | null;
  tenderTaxAmount: number | null;
  supplyProfitMargin: number | null;
  totalMaterialsCost: number;
  totalPettyExpenses: number;
  totalLaborCost: number;
  payments: ProjectPaymentDTO[];
  expenses: ProjectExpenseDTO[];
  stockMovements: StockMovementDTO[];
  attachments: ProjectAttachmentDTO[];
  auditLogs: ProjectAuditDTO[];
}

export interface CreateProjectDTO {
  projectType: number;
  clientId: number;
  contractValue: number;
  description?: string | null;
  tenderInsuranceAmount?: number | null;
  tenderTaxAmount?: number | null;
  supplyProfitMargin?: number | null;
}

export interface UpdateProjectStatusDTO {
  projectId: number;
  status: number;
}

export interface CreateProjectPaymentDTO {
  projectId: number;
  amountCash: number;
  amountCredit: number;
  paymentDate: string;
  notes?: string | null;
}

export interface CreateProjectExpenseDTO {
  projectId: number;
  amount: number;
  category: number;
  description?: string | null;
  expenseDate: string;
  attachmentUrl?: string | null;
  paidFromCashBox: boolean;
}

export interface CreateProjectAttachmentDTO {
  projectId: number;
  fileUrl: string;
  fileName?: string | null;
  description?: string | null;
}
