import { apiClient } from "@/lib/api-client";
import type { AiTenderResultDTO } from "@/types/aiTenderResult";

export function getAiTenderResults() {
  return apiClient.get<AiTenderResultDTO[]>("/AiContext/aiResults");
}

export function getAiTenderResultById(id: number) {
  return apiClient.get<AiTenderResultDTO>(`/AiContext/aiResults/${id}`);
}
