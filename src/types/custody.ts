export interface CustodyDTO {
  id: number;
  amount: number;
  amountCash: number;
  amountCredit: number;
  description: string;
  issueDate: string;
  status: string;
  settledAmount: number | null;
  settledDate: string | null;
  notes: string | null;
  employeeId: number;
  employeeName: string;
  projectId: number | null;
  projectName: string | null;
}

export interface CreateCustodyDTO {
  employeeId: number;
  amountCash: number;
  amountCredit: number;
  description: string;
  issueDate: string;
  projectId?: number | null;
  notes?: string | null;
}

export interface UpdateCustodyDTO {
  id: number;
  employeeId: number;
  amountCash: number;
  amountCredit: number;
  description: string;
  issueDate: string;
  projectId?: number | null;
  notes?: string | null;
}

export interface SettleCustodyDTO {
  custodyId: number;
  settledAmount: number;
  settledDate: string;
  notes?: string | null;
}
