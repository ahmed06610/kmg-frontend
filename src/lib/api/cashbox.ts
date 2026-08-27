import { apiClient } from "@/lib/api-client";
import type { CashBoxDetailsDTO } from "@/types/cashbox";

export function getCashBox(recentCount = 50) {
  return apiClient.get<CashBoxDetailsDTO>(`/CashBox?recentCount=${recentCount}`);
}
