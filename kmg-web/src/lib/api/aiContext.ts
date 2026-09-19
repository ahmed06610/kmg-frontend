import { apiClient } from "@/lib/api-client";
import type { AiPromptDTO } from "@/types/aiContext";

export function getAiPrompt() {
  return apiClient.get<AiPromptDTO>("/AiContext/prompt");
}
