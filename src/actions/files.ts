"use server";

import { apiClient, ApiError } from "@/lib/api-client";
import type { ActionResult } from "./auth";

export async function uploadAttachmentFile(
  folder: string,
  formData: FormData,
): Promise<ActionResult<{ fileUrl: string; fileName: string }>> {
  try {
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { success: false, message: "اختر ملف أولاً" };
    }

    const uploadForm = new FormData();
    uploadForm.set("file", file);
    const result = await apiClient.upload<{ fileUrl: string; fileName: string }>(`/Files/upload?folder=${folder}`, uploadForm);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ أثناء رفع الملف" };
  }
}
