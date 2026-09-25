import { apiClient } from "@/lib/api-client";
import type { EmployeeInsuranceDTO, InsurancePayoutDTO } from "@/types/insurance";

export function getEmployeeInsuranceSummary() {
  return apiClient.get<EmployeeInsuranceDTO[]>("/Insurance/summary");
}

export function getInsurancePayoutHistory() {
  return apiClient.get<InsurancePayoutDTO[]>("/Insurance/payouts");
}
