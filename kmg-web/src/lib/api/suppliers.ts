import { apiClient } from "@/lib/api-client";
import type { SupplierDetailsDTO, SupplierListDTO } from "@/types/supplier";

export function getSuppliers() {
  return apiClient.get<SupplierListDTO[]>("/Supplier");
}

export function getSupplierById(id: number) {
  return apiClient.get<SupplierDetailsDTO>(`/Supplier/${id}`);
}
