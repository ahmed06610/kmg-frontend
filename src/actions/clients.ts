"use server";

import { revalidatePath } from "next/cache";
import { apiClient, ApiError } from "@/lib/api-client";
import type { CreateClientDTO, UpdateClientDTO } from "@/types/client";
import type { ActionResult } from "./auth";

export async function createClient(data: CreateClientDTO): Promise<ActionResult<number>> {
  try {
    const id = await apiClient.post<number>("/Client", data);
    revalidatePath("/clients");
    return { success: true, data: id };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function updateClient(data: UpdateClientDTO): Promise<ActionResult> {
  try {
    await apiClient.put("/Client", data);
    revalidatePath("/clients");
    revalidatePath(`/clients/${data.id}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function deleteClient(id: number): Promise<ActionResult> {
  try {
    await apiClient.delete(`/Client/${id}`);
    revalidatePath("/clients");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}
