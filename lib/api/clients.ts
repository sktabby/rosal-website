import { apiRequest } from "./http";
import type { Client, PaginatedResponse } from "@/lib/types";

export function checkGstin(gstin: string) {
  return apiRequest<{ available: boolean }>("/clients/check-gst", { query: { gstin } });
}

export function createClient(payload: {
  firstName: string;
  lastName: string;
  phone: string;
  gstin: string;
  address: string;
  assignedSellerId: string;
}) {
  return apiRequest<Client>("/clients", { method: "POST", body: payload });
}

export function listClients(params: { search?: string; page?: number } = {}) {
  return apiRequest<PaginatedResponse<Client>>("/clients", { query: params });
}

export function getClient(id: string) {
  return apiRequest<Client>(`/clients/${id}`);
}

export function updateClient(id: string, payload: Partial<Client>) {
  return apiRequest<Client>(`/clients/${id}`, { method: "PATCH", body: payload });
}

export function deleteClient(id: string) {
  return apiRequest<{ message?: string }>(`/clients/${id}`, { method: "DELETE" });
}
