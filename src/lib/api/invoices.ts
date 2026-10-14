import { apiClient } from "@/lib/api-client";
import type { GeneratedInvoiceDTO, GeneratedInvoiceListDTO, InvoiceDTO, InvoiceFilter, PagedResultDTO } from "@/types/invoice";

export function getInvoices(filter: InvoiceFilter) {
  const params = new URLSearchParams();
  if (filter.page) params.set("page", String(filter.page));
  if (filter.pageSize) params.set("pageSize", String(filter.pageSize));
  if (filter.sourceType) params.set("sourceType", filter.sourceType);
  if (filter.direction) params.set("direction", filter.direction);
  if (filter.dateFrom) params.set("dateFrom", filter.dateFrom);
  if (filter.dateTo) params.set("dateTo", filter.dateTo);
  if (filter.projectId) params.set("projectId", String(filter.projectId));
  if (filter.supplierId) params.set("supplierId", String(filter.supplierId));
  if (filter.search) params.set("search", filter.search);

  return apiClient.get<PagedResultDTO<InvoiceDTO>>(`/Invoice?${params.toString()}`);
}

export function getGeneratedInvoices() {
  return apiClient.get<GeneratedInvoiceListDTO[]>("/Invoice/generated");
}

export function getGeneratedInvoiceById(id: number) {
  return apiClient.get<GeneratedInvoiceDTO>(`/Invoice/generated/${id}`);
}
