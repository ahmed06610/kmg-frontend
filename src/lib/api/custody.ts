import { apiClient } from "@/lib/api-client";
import type { CustodyDTO } from "@/types/custody";

export function getCustodies() {
  return apiClient.get<CustodyDTO[]>("/Custody");
}
