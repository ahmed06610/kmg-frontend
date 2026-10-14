export interface EmployeeInsuranceDTO {
  employeeId: number;
  employeeName: string;
  insuranceAmount: number;
}

export interface InsurancePayoutDTO {
  id: number;
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  paidDate: string;
  notes: string | null;
  createdByEmployeeName: string;
}

export interface PayInsuranceDTO {
  periodStart: string;
  periodEnd: string;
  notes?: string | null;
}
