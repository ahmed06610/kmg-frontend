import { apiClient } from "@/lib/api-client";
import type { ClientDetailsDTO, ClientListDTO } from "@/types/client";

export function getClients() {
  return apiClient.get<ClientListDTO[]>("/Client");
}

export function getClientById(id: number) {
  return apiClient.get<ClientDetailsDTO>(`/Client/${id}`);
}
