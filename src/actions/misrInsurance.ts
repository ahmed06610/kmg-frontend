"use server";

import { revalidatePath } from "next/cache";
import { apiClient, ApiError } from "@/lib/api-client";
import type { MisrInsurancePayoutDTO, PayMisrInsuranceDTO } from "@/types/misrInsurance";
import type { ActionResult } from "./auth";

export async function payMisrInsurance(data: PayMisrInsuranceDTO): Promise<ActionResult<MisrInsurancePayoutDTO>> {
  try {
    const payout = await apiClient.post<MisrInsurancePayoutDTO>("/MisrInsurance/pay", data);
    revalidatePath("/payroll");
    revalidatePath("/cashbox");
    return { success: true, data: payout };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}
