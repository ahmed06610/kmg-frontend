"use server";

import { revalidatePath } from "next/cache";
import { apiClient, ApiError } from "@/lib/api-client";
import type {
  CreateSupplierDTO,
  CreateSupplierPaymentDTO,
  ResolveCheckDTO,
  SupplierPaymentDTO,
  UpdateSupplierDTO,
  UpdateSupplierPaymentDTO,
} from "@/types/supplier";
import type { ActionResult } from "./auth";

export async function createSupplier(data: CreateSupplierDTO): Promise<ActionResult<number>> {
  try {
    const id = await apiClient.post<number>("/Supplier", data);
    revalidatePath("/suppliers");
    return { success: true, data: id };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function updateSupplier(data: UpdateSupplierDTO): Promise<ActionResult> {
  try {
    await apiClient.put("/Supplier", data);
    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${data.id}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function deleteSupplier(id: number): Promise<ActionResult> {
  try {
    await apiClient.delete(`/Supplier/${id}`);
    revalidatePath("/suppliers");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function recordSupplierPayment(data: CreateSupplierPaymentDTO): Promise<ActionResult<SupplierPaymentDTO>> {
  try {
    const payment = await apiClient.post<SupplierPaymentDTO>("/Supplier/payments", data);
    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${data.supplierId}`);
    revalidatePath("/cashbox");
    return { success: true, data: payment };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function updateSupplierPayment(data: UpdateSupplierPaymentDTO, supplierId: number): Promise<ActionResult<SupplierPaymentDTO>> {
  try {
    const payment = await apiClient.put<SupplierPaymentDTO>("/Supplier/payments", data);
    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${supplierId}`);
    revalidatePath("/cashbox");
    return { success: true, data: payment };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function deleteSupplierPayment(id: number, supplierId: number): Promise<ActionResult> {
  try {
    await apiClient.delete(`/Supplier/payments/${id}`);
    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${supplierId}`);
    revalidatePath("/cashbox");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function resolveCheck(data: ResolveCheckDTO, supplierId: number): Promise<ActionResult<SupplierPaymentDTO>> {
  try {
    const payment = await apiClient.post<SupplierPaymentDTO>("/Supplier/payments/checks/resolve", data);
    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${supplierId}`);
    revalidatePath("/cashbox");
    return { success: true, data: payment };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}
