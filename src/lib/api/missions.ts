import { apiClient } from "@/lib/api-client";
import type { MissionDetailsDTO } from "@/types/mission";

export function getMissionsByProject(projectId: number) {
  return apiClient.get<MissionDetailsDTO[]>(`/Mission/by-project/${projectId}`);
}

export function getMissionById(id: number) {
  return apiClient.get<MissionDetailsDTO>(`/Mission/${id}`);
}
