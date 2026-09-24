export interface EmployeeListDTO {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  userName: string | null;
  employeeType: number;
  wageType: number;
  wageAmount: number;
  managerId: number | null;
  managerName: string | null;
  suspended: boolean;
  hasLoginAccount: boolean;
  roleId: string | null;
  remainingAdvances: number;
}

export interface CreateWorkerDTO {
  name: string;
  phone?: string | null;
  employeeType: number;
  wageType: number;
  wageAmount: number;
  managerId?: number | null;
}

export interface UpdateWorkerDTO {
  id: number;
  name: string;
  phone?: string | null;
  employeeType: number;
  wageType: number;
  wageAmount: number;
  managerId?: number | null;
  suspended: boolean;
}
