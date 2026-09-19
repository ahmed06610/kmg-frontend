export interface AdvanceDTO {
  id: number;
  employeeId: number;
  employeeName: string;
  totalAmount: number;
  installmentAmount: number;
  remainingAmount: number;
  issueDate: string;
  status: string;
  notes: string | null;
}

export interface CreateAdvanceDTO {
  employeeId: number;
  totalAmount: number;
  installmentAmount: number;
  notes?: string | null;
}

export interface UpdateAdvanceDTO {
  id: number;
  totalAmount: number;
  installmentAmount: number;
  notes?: string | null;
}

export interface PayrollAdjustmentDTO {
  id: number;
  employeeId: number;
  employeeName: string;
  type: string;
  amount: number;
  reason: string;
  date: string;
  applied: boolean;
}

export interface CreateAdjustmentDTO {
  employeeId: number;
  type: number;
  amount: number;
  reason: string;
  date: string;
}

export interface UpdateAdjustmentDTO {
  id: number;
  type: number;
  amount: number;
  reason: string;
  date: string;
}

export interface PayrollPreviewDTO {
  employeeId: number;
  employeeName: string;
  periodStart: string;
  periodEnd: string;
  baseAmount: number;
  missionDoubleUpAmount: number;
  deductionsAmount: number;
  bonusAmount: number;
  advanceInstallmentAmount: number;
  netPaid: number;
}

export interface RunPayrollDTO {
  employeeId: number;
  periodStart: string;
  periodEnd: string;
}

export interface PayrollPayoutDTO extends PayrollPreviewDTO {
  id: number;
  paidDate: string;
}
