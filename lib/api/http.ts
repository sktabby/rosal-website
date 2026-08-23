import { clearSession, getToken } from "@/lib/session";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  statusCode: number;
  correlationId?: string;
  fieldErrors?: string[];

  constructor(statusCode: number, message: string, correlationId?: string, fieldErrors?: string[]) {
    super(message);
    this.statusCode = statusCode;
    this.correlationId = correlationId;
    this.fieldErrors = fieldErrors;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  isForm?: boolean;
}

function buildQuery(query?: RequestOptions["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * One shared request function used by every lib/api/*.ts wrapper.
 * - Attaches the bearer token automatically.
 * - Normalizes the backend's { statusCode, message, error } shape into a
 *   single ApiError so every page can catch one type.
 * - 401 clears the session and forces a redirect to /login — no page needs
 *   to handle "am I logged out" itself.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, isForm = false } = options;
  const token = getToken();

  const headers: Record<string, string> = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}${buildQuery(query)}`, {
    method,
    headers,
    body: isForm ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (res.status === 204) return undefined as T;

  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!res.ok) {
    const p = (payload ?? {}) as {
      statusCode?: number;
      message?: string | string[];
      correlationId?: string;
    };
    const message = Array.isArray(p.message)
      ? p.message.join(", ")
      : p.message ?? `Request failed (${res.status})`;
    const fieldErrors = Array.isArray(p.message) ? p.message : undefined;

    if (res.status === 401 && token) {
      const onAuthPage =
        typeof window !== "undefined" &&
        (window.location.pathname === "/login" || window.location.pathname === "/otp");
      if (!onAuthPage) {
        clearSession();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    throw new ApiError(res.status, message, p.correlationId, fieldErrors);
  }

  return payload as T;
}
