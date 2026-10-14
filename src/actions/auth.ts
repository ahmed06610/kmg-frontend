"use server";

import { redirect } from "next/navigation";
import { apiClient, ApiError } from "@/lib/api-client";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";
import type { AuthResponseDTO, LoginDTO } from "@/types/auth";

export interface ActionResult<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
}

export async function login(data: LoginDTO): Promise<ActionResult> {
  try {
    const result = await apiClient.post<AuthResponseDTO>("/Auth/login", data);
    await setSessionCookie(result.token);
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    return { success: false, message: "تعذر الاتصال بالخادم" };
  }
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
