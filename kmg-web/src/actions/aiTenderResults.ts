"use server";

import { revalidatePath } from "next/cache";
import { apiClient, ApiError } from "@/lib/api-client";
import type { ActionResult } from "./auth";

export async function dismissAiTenderResult(id: number): Promise<ActionResult> {
  try {
    await apiClient.post(`/AiContext/aiResults/${id}/dismiss`);
    revalidatePath("/ai-tenders");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}
