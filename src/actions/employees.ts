"use server";

import { revalidatePath } from "next/cache";
import { apiClient, ApiError } from "@/lib/api-client";
import type { AuthResponseDTO, EditEmployeeDTO, RegisterEmployeeDTO } from "@/types/auth";
import type { CreateWorkerDTO, UpdateWorkerDTO } from "@/types/employee";
import type { ActionResult } from "./auth";

export async function createWorker(data: CreateWorkerDTO): Promise<ActionResult<number>> {
  try {
    const id = await apiClient.post<number>("/Employee/workers", data);
    revalidatePath("/employees");
    return { success: true, data: id };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function updateWorker(data: UpdateWorkerDTO): Promise<ActionResult> {
  try {
    await apiClient.put("/Employee/workers", data);
    revalidatePath("/employees");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function registerEmployee(data: RegisterEmployeeDTO): Promise<ActionResult> {
  try {
    const result = await apiClient.post<AuthResponseDTO>("/Auth/register-employee", data);
    if (!result.isAuthenticated) return { success: false, message: result.message };
    revalidatePath("/employees");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function editEmployee(data: EditEmployeeDTO): Promise<ActionResult> {
  try {
    const result = await apiClient.put<AuthResponseDTO>("/Auth/edit-employee", data);
    if (!result.isAuthenticated) return { success: false, message: result.message };
    revalidatePath("/employees");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}
