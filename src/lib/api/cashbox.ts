import { apiClient } from "@/lib/api-client";
import type { CashBoxDetailsDTO, CashBoxTransactionFilter, CashBoxTransactionsResultDTO } from "@/types/cashbox";

export function getCashBox(recentCount = 50) {
  return apiClient.get<CashBoxDetailsDTO>(`/CashBox?recentCount=${recentCount}`);
}

export function getCashBoxTransactions(filter: CashBoxTransactionFilter) {
  const params = new URLSearchParams();
  if (filter.page) params.set("page", String(filter.page));
  if (filter.pageSize) params.set("pageSize", String(filter.pageSize));
  if (filter.dateFrom) params.set("dateFrom", filter.dateFrom);
  if (filter.dateTo) params.set("dateTo", filter.dateTo);
  if (filter.type) params.set("type", String(filter.type));
  if (filter.isIn !== undefined) params.set("isIn", String(filter.isIn));
  if (filter.search) params.set("search", filter.search);

  return apiClient.get<CashBoxTransactionsResultDTO>(`/CashBox/transactions?${params.toString()}`);
}
