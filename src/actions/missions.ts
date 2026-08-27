"use server";

import { revalidatePath } from "next/cache";
import { apiClient, ApiError } from "@/lib/api-client";
import type { CreateMissionDTO, MissionDetailsDTO, SettleMissionDTO } from "@/types/mission";
import type { ActionResult } from "./auth";

export async function createMission(data: CreateMissionDTO): Promise<ActionResult<number>> {
  try {
    const id = await apiClient.post<number>("/Mission", data);
    revalidatePath(`/projects/${data.projectId}`);
    revalidatePath("/cashbox");
    return { success: true, data: id };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function settleMission(data: SettleMissionDTO, projectId: number): Promise<ActionResult<MissionDetailsDTO>> {
  try {
    const mission = await apiClient.post<MissionDetailsDTO>("/Mission/settle", data);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/cashbox");
    return { success: true, data: mission };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}
