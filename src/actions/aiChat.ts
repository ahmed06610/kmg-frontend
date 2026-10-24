"use server";

import { apiClient, ApiError } from "@/lib/api-client";
import { getAiChatMessages } from "@/lib/api/aiChat";
import type { AiChatPageDTO, SendAiChatMessageResultDTO } from "@/types/aiChat";
import type { ActionResult } from "./auth";

export async function loadLatestAiChatMessages(): Promise<ActionResult<AiChatPageDTO>> {
  try {
    return { success: true, data: await getAiChatMessages() };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "تعذر تحميل المحادثة" };
  }
}

/** بيجيب الدفعة اللي قبل الرسالة دي - بتتنادى لما المستخدم يسكرول لفوق */
export async function loadOlderAiChatMessages(beforeId: number): Promise<ActionResult<AiChatPageDTO>> {
  try {
    return { success: true, data: await getAiChatMessages(beforeId) };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "تعذر تحميل الرسايل" };
  }
}

export async function sendAiChatMessage(message: string): Promise<ActionResult<SendAiChatMessageResultDTO>> {
  try {
    const result = await apiClient.post<SendAiChatMessageResultDTO>("/AiChat/send", { message });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "تعذر إرسال الرسالة" };
  }
}

export async function clearAiChat(): Promise<ActionResult> {
  try {
    await apiClient.delete("/AiChat/messages");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}
