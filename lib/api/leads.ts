import { apiRequest } from "./http";
import type { LeadType, PaginatedResponse } from "@/lib/types";

export function listLeads<T>(type: LeadType, params: { page?: number; includeHidden?: boolean } = {}) {
  return apiRequest<PaginatedResponse<T>>(`/leads/${type}`, { query: params });
}

export function setLeadHidden(type: LeadType, id: string, hidden: boolean) {
  return apiRequest(`/leads/${type}/${id}`, { method: "PATCH", body: { hidden } });
}
