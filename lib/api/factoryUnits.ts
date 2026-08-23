import { apiRequest } from "./http";
import type { FactoryUnit, PaginatedResponse, UserRecord } from "@/lib/types";

// Real confirmed route — NOT /users?role=dispatcher&unassigned=true as the
// original spec doc assumed.
export function listUnassignedDispatchers() {
  return apiRequest<UserRecord[]>("/factory-units/unassigned-dispatchers");
}

export function createFactoryUnit(payload: {
  name: string;
  assignedDispatcherId: string;
  address?: string;
}) {
  return apiRequest<FactoryUnit>("/factory-units", { method: "POST", body: payload });
}

export function listFactoryUnits(params: { search?: string; page?: number } = {}) {
  return apiRequest<PaginatedResponse<FactoryUnit>>("/factory-units", { query: params });
}

export function getFactoryUnit(id: string) {
  return apiRequest<FactoryUnit>(`/factory-units/${id}`);
}

export function updateFactoryUnit(id: string, payload: Partial<FactoryUnit>) {
  return apiRequest<FactoryUnit>(`/factory-units/${id}`, { method: "PATCH", body: payload });
}

export function deleteFactoryUnit(id: string) {
  return apiRequest<{ message?: string }>(`/factory-units/${id}`, { method: "DELETE" });
}
