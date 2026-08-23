import { apiRequest } from "./http";
import type { PaginatedResponse, Transport } from "@/lib/types";

export function createTransport(payload: { name: string; gstin?: string }) {
  return apiRequest<Transport>("/transport", { method: "POST", body: payload });
}

export function listTransport(params: { search?: string; page?: number } = {}) {
  return apiRequest<PaginatedResponse<Transport>>("/transport", { query: params });
}

export function getTransport(id: string) {
  return apiRequest<Transport>(`/transport/${id}`);
}

export function updateTransport(id: string, payload: Partial<Transport>) {
  return apiRequest<Transport>(`/transport/${id}`, { method: "PATCH", body: payload });
}

export function deleteTransport(id: string) {
  return apiRequest<{ message?: string }>(`/transport/${id}`, { method: "DELETE" });
}
