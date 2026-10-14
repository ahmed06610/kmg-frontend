"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiClient, ApiError } from "@/lib/api-client";
import type {
  CreateProjectAttachmentDTO,
  CreateProjectDTO,
  CreateProjectExpenseDTO,
  CreateProjectPaymentDTO,
  CreateProjectWriteOffDTO,
  ProjectAttachmentDTO,
  ProjectExpenseDTO,
  ProjectPaymentDTO,
  ProjectWriteOffDTO,
  ResolveProjectPaymentCheckDTO,
  UpdateProjectAttachmentDTO,
  UpdateProjectDTO,
  UpdateProjectExpenseDTO,
  UpdateProjectPaymentDTO,
  UpdateProjectStatusDTO,
  UpdateProjectWriteOffDTO,
} from "@/types/project";
import type { ActionResult } from "./auth";

export async function createProject(data: CreateProjectDTO): Promise<ActionResult<number>> {
  try {
    const id = await apiClient.post<number>("/Project", data);
    revalidatePath("/projects");
    return { success: true, data: id };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function createProjectAndRedirect(data: CreateProjectDTO) {
  const result = await createProject(data);
  if (result.success && result.data) {
    redirect(`/projects/${result.data}`);
  }
  return result;
}

export async function updateProject(data: UpdateProjectDTO): Promise<ActionResult> {
  try {
    await apiClient.put("/Project", data);
    revalidatePath("/projects");
    revalidatePath(`/projects/${data.id}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function deleteProject(id: number): Promise<ActionResult> {
  try {
    await apiClient.delete(`/Project/${id}`);
    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function updateProjectStatus(data: UpdateProjectStatusDTO): Promise<ActionResult> {
  try {
    await apiClient.put("/Project/status", data);
    revalidatePath("/projects");
    revalidatePath(`/projects/${data.projectId}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function recoverInsurance(projectId: number): Promise<ActionResult> {
  try {
    await apiClient.post(`/Project/${projectId}/recover-insurance`);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/cashbox");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function recoverGuarantee(projectId: number): Promise<ActionResult> {
  try {
    await apiClient.post(`/Project/${projectId}/recover-guarantee`);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/cashbox");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function recordProjectPayment(data: CreateProjectPaymentDTO): Promise<ActionResult<ProjectPaymentDTO>> {
  try {
    const payment = await apiClient.post<ProjectPaymentDTO>("/Project/payments", data);
    revalidatePath(`/projects/${data.projectId}`);
    revalidatePath("/projects");
    revalidatePath("/cashbox");
    return { success: true, data: payment };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function updateProjectPayment(data: UpdateProjectPaymentDTO, projectId: number): Promise<ActionResult<ProjectPaymentDTO>> {
  try {
    const payment = await apiClient.put<ProjectPaymentDTO>("/Project/payments", data);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/projects");
    revalidatePath("/cashbox");
    return { success: true, data: payment };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function resolveProjectCheck(data: ResolveProjectPaymentCheckDTO, projectId: number): Promise<ActionResult<ProjectPaymentDTO>> {
  try {
    const payment = await apiClient.post<ProjectPaymentDTO>("/Project/payments/resolve-check", data);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/projects");
    revalidatePath("/cashbox");
    return { success: true, data: payment };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function deleteProjectPayment(id: number, projectId: number): Promise<ActionResult> {
  try {
    await apiClient.delete(`/Project/payments/${id}`);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/projects");
    revalidatePath("/cashbox");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function recordProjectExpense(data: CreateProjectExpenseDTO): Promise<ActionResult<ProjectExpenseDTO>> {
  try {
    const expense = await apiClient.post<ProjectExpenseDTO>("/Project/expenses", data);
    revalidatePath(`/projects/${data.projectId}`);
    revalidatePath("/projects");
    revalidatePath("/cashbox");
    return { success: true, data: expense };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function updateProjectExpense(data: UpdateProjectExpenseDTO, projectId: number): Promise<ActionResult<ProjectExpenseDTO>> {
  try {
    const expense = await apiClient.put<ProjectExpenseDTO>("/Project/expenses", data);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/cashbox");
    return { success: true, data: expense };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function deleteProjectExpense(id: number, projectId: number): Promise<ActionResult> {
  try {
    await apiClient.delete(`/Project/expenses/${id}`);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/cashbox");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function addProjectAttachment(data: CreateProjectAttachmentDTO): Promise<ActionResult<ProjectAttachmentDTO>> {
  try {
    const attachment = await apiClient.post<ProjectAttachmentDTO>("/Project/attachments", data);
    revalidatePath(`/projects/${data.projectId}`);
    return { success: true, data: attachment };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function updateProjectAttachment(data: UpdateProjectAttachmentDTO, projectId: number): Promise<ActionResult> {
  try {
    await apiClient.put("/Project/attachments", data);
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function deleteProjectAttachment(id: number, projectId: number): Promise<ActionResult> {
  try {
    await apiClient.delete(`/Project/attachments/${id}`);
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function createProjectWriteOff(data: CreateProjectWriteOffDTO): Promise<ActionResult<ProjectWriteOffDTO>> {
  try {
    const writeOff = await apiClient.post<ProjectWriteOffDTO>("/Project/write-offs", data);
    revalidatePath(`/projects/${data.projectId}`);
    revalidatePath("/projects");
    return { success: true, data: writeOff };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function updateProjectWriteOff(data: UpdateProjectWriteOffDTO, projectId: number): Promise<ActionResult<ProjectWriteOffDTO>> {
  try {
    const writeOff = await apiClient.put<ProjectWriteOffDTO>("/Project/write-offs", data);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/projects");
    return { success: true, data: writeOff };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function deleteProjectWriteOff(id: number, projectId: number): Promise<ActionResult> {
  try {
    await apiClient.delete(`/Project/write-offs/${id}`);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ" };
  }
}

export async function uploadProjectAttachment(
  projectId: number,
  formData: FormData,
): Promise<ActionResult<ProjectAttachmentDTO>> {
  try {
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { success: false, message: "اختر ملف أولاً" };
    }

    const uploadForm = new FormData();
    uploadForm.set("file", file);
    const { fileUrl, fileName } = await apiClient.upload<{ fileUrl: string; fileName: string }>(
      "/Project/attachments/upload",
      uploadForm,
    );

    const description = (formData.get("description") as string) || null;
    const attachment = await apiClient.post<ProjectAttachmentDTO>("/Project/attachments", {
      projectId,
      fileUrl,
      fileName,
      description,
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: attachment };
  } catch (error) {
    return { success: false, message: error instanceof ApiError ? error.message : "حدث خطأ أثناء رفع الملف" };
  }
}
