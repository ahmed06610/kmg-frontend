"use server";

import { revalidatePath } from "next/cache";
import { apiClient, ApiError } from "@/lib/api-client";
import type {
  AdvanceDTO,
  CreateAdjustmentDTO,
  CreateAdvanceDTO,
  PayrollAdjustmentDTO,
  PayrollPayoutDTO,
  PayrollPreviewDTO,
  RunPayrollDTO,
  UpdateAdjustmentDTO,
  UpdateAdvanceDTO,
} from "@/types/payroll";
import type { ActionResult } from "./auth";

export async function createAdvance(data: CreateAdvanceDTO): Promise<ActionResult<AdvanceDTO>> {
  try {
    const advance = await apiClient.post<AdvanceDTO>("/Payroll/advances", data);
    revalidatePath("/payroll");
    revalidatePath("/cashbox");
    return { success: true, data: advance };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function updateAdvance(data: UpdateAdvanceDTO): Promise<ActionResult<AdvanceDTO>> {
  try {
    const advance = await apiClient.put<AdvanceDTO>("/Payroll/advances", data);
    revalidatePath("/payroll");
    revalidatePath("/cashbox");
    return { success: true, data: advance };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function deleteAdvance(id: number): Promise<ActionResult> {
  try {
    await apiClient.delete(`/Payroll/advances/${id}`);
    revalidatePath("/payroll");
    revalidatePath("/cashbox");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function createAdjustment(data: CreateAdjustmentDTO): Promise<ActionResult<PayrollAdjustmentDTO>> {
  try {
    const adjustment = await apiClient.post<PayrollAdjustmentDTO>("/Payroll/adjustments", data);
    revalidatePath("/payroll");
    return { success: true, data: adjustment };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function updateAdjustment(data: UpdateAdjustmentDTO): Promise<ActionResult<PayrollAdjustmentDTO>> {
  try {
    const adjustment = await apiClient.put<PayrollAdjustmentDTO>("/Payroll/adjustments", data);
    revalidatePath("/payroll");
    return { success: true, data: adjustment };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function deleteAdjustment(id: number): Promise<ActionResult> {
  try {
    await apiClient.delete(`/Payroll/adjustments/${id}`);
    revalidatePath("/payroll");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function previewPayroll(data: RunPayrollDTO): Promise<ActionResult<PayrollPreviewDTO>> {
  try {
    const preview = await apiClient.post<PayrollPreviewDTO>("/Payroll/preview", data);
    return { success: true, data: preview };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function runPayroll(data: RunPayrollDTO): Promise<ActionResult<PayrollPayoutDTO>> {
  try {
    const payout = await apiClient.post<PayrollPayoutDTO>("/Payroll/run", data);
    revalidatePath("/payroll");
    revalidatePath("/cashbox");
    return { success: true, data: payout };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}
