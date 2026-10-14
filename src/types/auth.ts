export interface AbilityDTO {
  id: number;
  label: string;
  href: string | null;
}

export interface AuthResponseDTO {
  isAuthenticated: boolean;
  message: string;
  token: string;
  expiresOn: string;
  userId: string;
  email: string | null;
  name: string | null;
  employeeId: number;
  roleName: string;
  abilities: AbilityDTO[];
}

export interface LoginDTO {
  usernameOrEmail: string;
  password: string;
}

export interface RoleDto {
  id: string;
  name: string;
}

export interface RegisterEmployeeDTO {
  userName: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  password: string;
  roleId: string;
  employeeType: number;
  wageType: number;
  wageAmount: number;
  insuranceAmount: number;
  managerId?: number | null;
  abilityIds?: number[] | null;
}

export interface EditEmployeeDTO {
  id: number;
  name: string;
  userName: string;
  email?: string | null;
  phone?: string | null;
  password?: string | null;
  roleId: string;
  managerId?: number | null;
  suspended: boolean;
  employeeType: number;
  wageType: number;
  wageAmount: number;
  insuranceAmount: number;
  abilityIds?: number[] | null;
}
