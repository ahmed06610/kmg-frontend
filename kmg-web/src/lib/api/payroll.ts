import { apiClient } from "@/lib/api-client";
import type { AdvanceDTO, PayrollAdjustmentDTO, PayrollPayoutDTO } from "@/types/payroll";

export function getAdvances(employeeId?: number) {
  const qs = employeeId ? `?employeeId=${employeeId}` : "";
  return apiClient.get<AdvanceDTO[]>(`/Payroll/advances${qs}`);
}

export function getAdjustments(employeeId?: number) {
  const qs = employeeId ? `?employeeId=${employeeId}` : "";
  return apiClient.get<PayrollAdjustmentDTO[]>(`/Payroll/adjustments${qs}`);
}

export function getPayrollHistory(employeeId?: number) {
  const qs = employeeId ? `?employeeId=${employeeId}` : "";
  return apiClient.get<PayrollPayoutDTO[]>(`/Payroll/history${qs}`);
}
