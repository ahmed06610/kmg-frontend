import { apiClient } from "@/lib/api-client";
import type { AiChatPageDTO } from "@/types/aiChat";

export const AI_CHAT_PAGE_SIZE = 20;

export function getAiChatMessages(beforeId?: number) {
  const query = new URLSearchParams({ take: String(AI_CHAT_PAGE_SIZE) });
  if (beforeId) query.set("beforeId", String(beforeId));
  return apiClient.get<AiChatPageDTO>(`/AiChat/messages?${query.toString()}`);
}
