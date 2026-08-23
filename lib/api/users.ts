import { apiRequest } from "./http";
import type { PaginatedResponse, UserRecord } from "@/lib/types";
import type { UserRole } from "@/lib/enums";

export function checkEmployeeCode(code: string) {
  return apiRequest<{ available: boolean }>("/users/check-code", { query: { code } });
}

export function createUser(payload: {
  role: UserRole;
  employeeCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
}) {
  return apiRequest<UserRecord>("/admin/users", { method: "POST", body: payload });
}

export function listUsers(params: {
  role?: UserRole;
  unassigned?: boolean;
  page?: number;
  search?: string;
} = {}) {
  return apiRequest<PaginatedResponse<UserRecord>>("/users", { query: params });
}

export function getUser(id: string) {
  return apiRequest<UserRecord>(`/users/${id}`);
}

export function updateUser(id: string, payload: Partial<UserRecord>) {
  return apiRequest<UserRecord>(`/users/${id}`, { method: "PATCH", body: payload });
}

export function deleteUser(id: string) {
  return apiRequest<{ message?: string }>(`/users/${id}`, { method: "DELETE" });
}
