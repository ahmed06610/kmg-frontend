import { apiClient } from "@/lib/api-client";
import type { DashboardDTO } from "@/types/dashboard";

export function getDashboard() {
  return apiClient.get<DashboardDTO>("/Dashboard");
}
