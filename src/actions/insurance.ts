"use server";

import { revalidatePath } from "next/cache";
import { apiClient, ApiError } from "@/lib/api-client";
import type { InsurancePayoutDTO, PayInsuranceDTO } from "@/types/insurance";
import type { ActionResult } from "./auth";

export async function payInsurance(data: PayInsuranceDTO): Promise<ActionResult<InsurancePayoutDTO>> {
  try {
    const payout = await apiClient.post<InsurancePayoutDTO>("/Insurance/pay", data);
    revalidatePath("/payroll");
    revalidatePath("/cashbox");
    return { success: true, data: payout };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}
