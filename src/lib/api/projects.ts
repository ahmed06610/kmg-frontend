import { apiClient } from "@/lib/api-client";
import type { ProjectDetailsDTO, ProjectListDTO } from "@/types/project";

export function getProjects() {
  return apiClient.get<ProjectListDTO[]>("/Project");
}

export function getProjectById(id: number) {
  return apiClient.get<ProjectDetailsDTO>(`/Project/${id}`);
}
