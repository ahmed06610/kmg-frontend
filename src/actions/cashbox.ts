"use server";

import { revalidatePath } from "next/cache";
import { apiClient, ApiError } from "@/lib/api-client";
import type { CreateMiscExpenseDTO, MiscExpenseDTO, UpdateMiscExpenseDTO } from "@/types/cashbox";
import type { ActionResult } from "./auth";

export async function createMiscExpense(data: CreateMiscExpenseDTO): Promise<ActionResult<MiscExpenseDTO>> {
  try {
    const expense = await apiClient.post<MiscExpenseDTO>("/CashBox/misc-expenses", data);
    revalidatePath("/cashbox");
    return { success: true, data: expense };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function updateMiscExpense(data: UpdateMiscExpenseDTO): Promise<ActionResult<MiscExpenseDTO>> {
  try {
    const expense = await apiClient.put<MiscExpenseDTO>("/CashBox/misc-expenses", data);
    revalidatePath("/cashbox");
    return { success: true, data: expense };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function deleteMiscExpense(id: number): Promise<ActionResult> {
  try {
    await apiClient.delete(`/CashBox/misc-expenses/${id}`);
    revalidatePath("/cashbox");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}
