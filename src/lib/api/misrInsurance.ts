import { apiClient } from "@/lib/api-client";
import type { EmployeeMisrInsuranceDTO, MisrInsurancePayoutDTO } from "@/types/misrInsurance";

export function getEmployeeMisrInsuranceSummary() {
  return apiClient.get<EmployeeMisrInsuranceDTO[]>("/MisrInsurance/summary");
}

export function getMisrInsurancePayoutHistory() {
  return apiClient.get<MisrInsurancePayoutDTO[]>("/MisrInsurance/payouts");
}
