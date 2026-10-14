"use server";

import { revalidatePath } from "next/cache";
import { apiClient, ApiError } from "@/lib/api-client";
import type { AiPromptDTO, UpdateAiPromptDTO } from "@/types/aiContext";
import type { ActionResult } from "./auth";

export async function updateAiPrompt(data: UpdateAiPromptDTO): Promise<ActionResult<AiPromptDTO>> {
  try {
    const result = await apiClient.put<AiPromptDTO>("/AiContext/prompt", data);
    revalidatePath("/ai-settings");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}
