"use server";

import { apiClient, ApiError } from "@/lib/api-client";
import type { NotificationDTO } from "@/types/notification";
import type { ActionResult } from "./auth";

export async function getNotifications(): Promise<ActionResult<NotificationDTO[]>> {
  try {
    const data = await apiClient.get<NotificationDTO[]>("/Notification");
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function markNotificationRead(id: number): Promise<ActionResult> {
  try {
    await apiClient.post(`/Notification/${id}/read`);
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  try {
    await apiClient.post("/Notification/read-all");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function dismissNotification(id: number): Promise<ActionResult> {
  try {
    await apiClient.post(`/Notification/${id}/dismiss`);
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}
