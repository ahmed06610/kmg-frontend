import { apiClient } from "@/lib/api-client";
import type { MaterialCategoryDTO, MaterialDTO, StockMovementDTO } from "@/types/stock";

export function getMaterials() {
  return apiClient.get<MaterialDTO[]>("/Stock/materials");
}

export function getMaterialCategories() {
  return apiClient.get<MaterialCategoryDTO[]>("/Stock/categories");
}

export function getMaterialById(id: number) {
  return apiClient.get<MaterialDTO>(`/Stock/materials/${id}`);
}

export function getMovements(params?: { materialId?: number; projectId?: number }) {
  const query = new URLSearchParams();
  if (params?.materialId) query.set("materialId", String(params.materialId));
  if (params?.projectId) query.set("projectId", String(params.projectId));
  const qs = query.toString();
  return apiClient.get<StockMovementDTO[]>(`/Stock/movements${qs ? `?${qs}` : ""}`);
}
