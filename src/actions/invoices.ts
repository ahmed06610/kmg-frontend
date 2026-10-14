"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiClient, ApiError } from "@/lib/api-client";
import type { CreateGeneratedInvoiceDTO, GeneratedInvoiceDTO } from "@/types/invoice";
import type { ActionResult } from "./auth";

export async function createGeneratedInvoice(data: CreateGeneratedInvoiceDTO): Promise<ActionResult<GeneratedInvoiceDTO>> {
  try {
    const invoice = await apiClient.post<GeneratedInvoiceDTO>("/Invoice/generated", data);
    revalidatePath("/invoices");
    return { success: true, data: invoice };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function createGeneratedInvoiceAndRedirect(data: CreateGeneratedInvoiceDTO) {
  const result = await createGeneratedInvoice(data);
  if (result.success && result.data) {
    redirect(`/invoices/generated/${result.data.id}`);
  }
  return result;
}

export async function deleteGeneratedInvoice(id: number): Promise<ActionResult> {
  try {
    await apiClient.delete(`/Invoice/generated/${id}`);
    revalidatePath("/invoices");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}
