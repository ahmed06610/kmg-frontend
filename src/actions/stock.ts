"use server";

import { revalidatePath } from "next/cache";
import { apiClient, ApiError } from "@/lib/api-client";
import type {
  CreateIssueDTO,
  CreateMaterialDTO,
  CreatePurchaseDTO,
  CreateReturnDTO,
  StockMovementDTO,
  UpdateMaterialDTO,
} from "@/types/stock";
import type { ActionResult } from "./auth";

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
