import { apiClient } from "@/lib/api-client";
import type { RoleDto } from "@/types/auth";

export function getRoles() {
  return apiClient.get<RoleDto[]>("/Auth/roles");
}
