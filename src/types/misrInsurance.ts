export interface EmployeeMisrInsuranceDTO {
  employeeId: number;
  employeeName: string;
  misrInsuranceAmount: number;
}

export interface MisrInsurancePayoutDTO {
  id: number;
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  paidDate: string;
  notes: string | null;
  createdByEmployeeName: string;
}

export interface PayMisrInsuranceDTO {
  periodStart: string;
  periodEnd: string;
  notes?: string | null;
}
