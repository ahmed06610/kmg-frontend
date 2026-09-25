import { apiClient } from "@/lib/api-client";
import type { DashboardDTO } from "@/types/dashboard";

export function getDashboard(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  return apiClient.get<DashboardDTO>(`/Dashboard${qs ? `?${qs}` : ""}`);
}
