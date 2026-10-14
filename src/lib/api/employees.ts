import { apiClient } from "@/lib/api-client";
import type { EmployeeListDTO } from "@/types/employee";

export function getEmployees() {
  return apiClient.get<EmployeeListDTO[]>("/Employee");
}

export function getEmployeeById(id: number) {
  return apiClient.get<EmployeeListDTO>(`/Employee/${id}`);
}
