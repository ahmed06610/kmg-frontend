export interface EmployeeListDTO {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  employeeType: number;
  wageType: number;
  wageAmount: number;
  managerName: string | null;
  suspended: boolean;
  hasLoginAccount: boolean;
}

export interface CreateWorkerDTO {
  name: string;
  phone?: string | null;
  employeeType: number;
  wageType: number;
  wageAmount: number;
  managerId?: number | null;
}
