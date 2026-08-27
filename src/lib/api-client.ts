import "server-only";
import { getSession } from "./session";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:5266/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      if (typeof data === "string") return data;
      if (data?.message) return data.message as string;
      if (data?.title) return data.title as string;
      if (data?.errors) {
        const values = Object.values(data.errors as Record<string, string[]>).flat();
        if (values.length) return values.join(" ");
      }
    } else {
      const text = await response.text();
      if (text) return text;
    }
  } catch {
    // تجاهل - هنستخدم رسالة افتراضية تحت
  }
  return response.statusText || "حدث خطأ غير متوقع";
}

interface RequestOptions {
  /** استخدمها بس للطلبات اللي بتحصل قبل ما يبقى فيه Session (زي Login نفسه) */
  tokenOverride?: string;
}

async function request<T>(method: string, path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json; charset=utf-8" };

  const token = options?.tokenOverride ?? (await getSession())?.token;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(await extractErrorMessage(response), response.status);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("POST", path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PUT", path, body, options),
};
