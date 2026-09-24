import type { StockMovementDTO } from "./stock";
import type { CheckStatus } from "./supplier";

export interface ProjectListDTO {
  id: number;
  name: string;
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
  attachmentUrl: string | null;
  attachmentFileName: string | null;
  isCheck: boolean;
  checkDueDate: string | null;
  checkStatus: CheckStatus | null;
}

export interface ProjectExpenseDTO {
  id: number;
  amount: number;
  category: string;
  description: string | null;
  expenseDate: string;
  attachmentUrl: string | null;
  attachmentFileName: string | null;
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
  tenderInsurancePercent: number | null;
  tenderInsuranceAmount: number;
  insuranceDueDate: string | null;
  insuranceRecovered: boolean;
  tenderTaxPercent: number | null;
  tenderTaxAmount: number;
  workGuaranteePercent: number | null;
  workGuaranteeAmount: number;
  workGuaranteeDueDate: string | null;
  workGuaranteeRecovered: boolean;
  contractValueWithTax: number;
  supplyProfitMargin: number | null;
  totalMaterialsCost: number;
  totalPettyExpenses: number;
  totalLaborCost: number;
  totalWriteOffs: number;
  payments: ProjectPaymentDTO[];
  expenses: ProjectExpenseDTO[];
  stockMovements: StockMovementDTO[];
  attachments: ProjectAttachmentDTO[];
  auditLogs: ProjectAuditDTO[];
  writeOffs: ProjectWriteOffDTO[];
  canDelete: boolean;
}

export interface ProjectWriteOffDTO {
  id: number;
  amount: number;
  reason: string;
  writeOffDate: string;
}

export interface CreateProjectWriteOffDTO {
  projectId: number;
  amount: number;
  reason: string;
  writeOffDate: string;
}

export interface UpdateProjectWriteOffDTO {
  id: number;
  amount: number;
  reason: string;
  writeOffDate: string;
}

export interface CreateProjectDTO {
  name: string;
  projectType: number;
  clientId: number;
  contractValue: number;
  description?: string | null;
  tenderInsurancePercent?: number | null;
  insuranceDueDate?: string | null;
  tenderTaxPercent?: number | null;
  workGuaranteePercent?: number | null;
  workGuaranteeDueDate?: string | null;
  supplyProfitMargin?: number | null;
}

export interface UpdateProjectDTO {
  id: number;
  name: string;
  description?: string | null;
  clientId: number;
  contractValue: number;
  tenderInsurancePercent?: number | null;
  insuranceDueDate?: string | null;
  tenderTaxPercent?: number | null;
  workGuaranteePercent?: number | null;
  workGuaranteeDueDate?: string | null;
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
  attachmentUrl?: string | null;
  attachmentFileName?: string | null;
  isCheck: boolean;
  checkDueDate?: string | null;
}

export interface UpdateProjectPaymentDTO {
  id: number;
  amountCash: number;
  amountCredit: number;
  paymentDate: string;
  notes?: string | null;
  attachmentUrl?: string | null;
  attachmentFileName?: string | null;
  isCheck: boolean;
  checkDueDate?: string | null;
}

export interface ResolveProjectPaymentCheckDTO {
  paymentId: number;
  action: number;
  newDueDate?: string | null;
}

export interface CreateProjectExpenseDTO {
  projectId: number;
  amount: number;
  category: number;
  description?: string | null;
  expenseDate: string;
  attachmentUrl?: string | null;
  attachmentFileName?: string | null;
  paidFromCashBox: boolean;
}

export interface UpdateProjectExpenseDTO {
  id: number;
  amount: number;
  category: number;
  description?: string | null;
  expenseDate: string;
}

export interface CreateProjectAttachmentDTO {
  projectId: number;
  fileUrl: string;
  fileName?: string | null;
  description?: string | null;
}

export interface UpdateProjectAttachmentDTO {
  id: number;
  description?: string | null;
}
