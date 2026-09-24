"use server";

import { revalidatePath } from "next/cache";
import { apiClient, ApiError } from "@/lib/api-client";
import type { CreateCustodyDTO, CustodyDTO, SettleCustodyDTO, UpdateCustodyDTO } from "@/types/custody";
import type { ActionResult } from "./auth";

export async function createCustody(data: CreateCustodyDTO): Promise<ActionResult<CustodyDTO>> {
  try {
    const custody = await apiClient.post<CustodyDTO>("/Custody", data);
    revalidatePath("/cashbox");
    return { success: true, data: custody };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function updateCustody(data: UpdateCustodyDTO): Promise<ActionResult<CustodyDTO>> {
  try {
    const custody = await apiClient.put<CustodyDTO>("/Custody", data);
    revalidatePath("/cashbox");
    return { success: true, data: custody };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function deleteCustody(id: number): Promise<ActionResult> {
  try {
    await apiClient.delete(`/Custody/${id}`);
    revalidatePath("/cashbox");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function settleCustody(data: SettleCustodyDTO): Promise<ActionResult<CustodyDTO>> {
  try {
    const custody = await apiClient.post<CustodyDTO>("/Custody/settle", data);
    revalidatePath("/cashbox");
    return { success: true, data: custody };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}
