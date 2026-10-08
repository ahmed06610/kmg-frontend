"use server";

import { revalidatePath } from "next/cache";
import { apiClient, ApiError } from "@/lib/api-client";
import type {
  CreateIssueDTO,
  CreateMaterialCategoryDTO,
  CreateMaterialDTO,
  CreatePurchaseDTO,
  CreateReturnDTO,
  CreateStockAdjustmentDTO,
  MaterialDeleteImpactDTO,
  MaterialDTO,
  MergeMaterialsDTO,
  StockMovementDTO,
  UpdateStockMovementDTO,
  StockPriceBatchDTO,
  UpdateMaterialCategoryDTO,
  UpdateMaterialDTO,
  UpdatePurchaseDTO,
} from "@/types/stock";
import type { ActionResult } from "./auth";

export async function getMaterialPriceBatches(materialId: number): Promise<ActionResult<StockPriceBatchDTO[]>> {
  try {
    const batches = await apiClient.get<StockPriceBatchDTO[]>(`/Stock/materials/${materialId}/price-batches`);
    return { success: true, data: batches };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function createMaterial(data: CreateMaterialDTO): Promise<ActionResult<number>> {
  try {
    const id = await apiClient.post<number>("/Stock/materials", data);
    revalidatePath("/stock");
    return { success: true, data: id };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function updateMaterial(data: UpdateMaterialDTO): Promise<ActionResult> {
  try {
    await apiClient.put("/Stock/materials", data);
    revalidatePath("/stock");
    revalidatePath(`/stock/${data.id}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

/** تعديل/حذف حركة قديمة بيأثر على تكلفة المشاريع ومستحقات الموردين والخزنة، فلازم كل الصفحات تتحدث */
function revalidateStockDependents() {
  revalidatePath("/", "layout");
}

export async function getMaterialDeleteImpact(id: number): Promise<ActionResult<MaterialDeleteImpactDTO>> {
  try {
    const impact = await apiClient.get<MaterialDeleteImpactDTO>(`/Stock/materials/${id}/delete-impact`);
    return { success: true, data: impact };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function deleteMaterial(id: number, force = false): Promise<ActionResult> {
  try {
    await apiClient.delete(`/Stock/materials/${id}${force ? "?force=true" : ""}`);
    revalidateStockDependents();
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function mergeMaterials(data: MergeMaterialsDTO): Promise<ActionResult<MaterialDTO>> {
  try {
    const material = await apiClient.post<MaterialDTO>("/Stock/materials/merge", data);
    revalidateStockDependents();
    return { success: true, data: material };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function createStockAdjustment(data: CreateStockAdjustmentDTO): Promise<ActionResult<StockMovementDTO>> {
  try {
    const movement = await apiClient.post<StockMovementDTO>("/Stock/adjustment", data);
    revalidatePath("/stock", "layout");
    return { success: true, data: movement };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function updateStockMovement(data: UpdateStockMovementDTO): Promise<ActionResult<StockMovementDTO>> {
  try {
    const movement = await apiClient.put<StockMovementDTO>("/Stock/movements", data);
    revalidateStockDependents();
    return { success: true, data: movement };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function deleteStockMovement(id: number): Promise<ActionResult> {
  try {
    await apiClient.delete(`/Stock/movements/${id}`);
    revalidateStockDependents();
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function createMaterialCategory(data: CreateMaterialCategoryDTO): Promise<ActionResult<number>> {
  try {
    const id = await apiClient.post<number>("/Stock/categories", data);
    revalidatePath("/stock");
    return { success: true, data: id };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function updateMaterialCategory(data: UpdateMaterialCategoryDTO): Promise<ActionResult> {
  try {
    await apiClient.put("/Stock/categories", data);
    revalidatePath("/stock");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function deleteMaterialCategory(id: number): Promise<ActionResult> {
  try {
    await apiClient.delete(`/Stock/categories/${id}`);
    revalidatePath("/stock");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function recordPurchase(data: CreatePurchaseDTO): Promise<ActionResult<StockMovementDTO>> {
  try {
    const movement = await apiClient.post<StockMovementDTO>("/Stock/purchase", data);
    revalidatePath("/stock");
    revalidatePath(`/stock/${data.materialId}`);
    revalidatePath("/suppliers");
    return { success: true, data: movement };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function updatePurchase(data: UpdatePurchaseDTO): Promise<ActionResult<StockMovementDTO>> {
  try {
    const movement = await apiClient.put<StockMovementDTO>("/Stock/purchase", data);
    revalidatePath("/stock");
    revalidatePath(`/stock/${movement.materialId}`);
    revalidatePath("/suppliers");
    if (movement.supplierId) revalidatePath(`/suppliers/${movement.supplierId}`);
    return { success: true, data: movement };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function issueToProject(data: CreateIssueDTO): Promise<ActionResult<StockMovementDTO>> {
  try {
    const movement = await apiClient.post<StockMovementDTO>("/Stock/issue", data);
    revalidatePath("/stock");
    revalidatePath(`/stock/${data.materialId}`);
    revalidatePath(`/projects/${data.projectId}`);
    return { success: true, data: movement };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function returnFromProject(data: CreateReturnDTO): Promise<ActionResult<StockMovementDTO>> {
  try {
    const movement = await apiClient.post<StockMovementDTO>("/Stock/return", data);
    revalidatePath("/stock");
    revalidatePath(`/stock/${data.materialId}`);
    revalidatePath(`/projects/${data.projectId}`);
    return { success: true, data: movement };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}
