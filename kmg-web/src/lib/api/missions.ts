import { apiClient } from "@/lib/api-client";
import type { MissionDetailsDTO, MissionListDTO } from "@/types/mission";

export function getMissionsByProject(projectId: number) {
  return apiClient.get<MissionListDTO[]>(`/Mission/by-project/${projectId}`);
}

export function getMissionById(id: number) {
  return apiClient.get<MissionDetailsDTO>(`/Mission/${id}`);
}
