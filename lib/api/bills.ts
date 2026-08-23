import { apiRequest } from "./http";
import type { Bill, PaginatedResponse } from "@/lib/types";

export function listBills(params: { search?: string; page?: number } = {}) {
  return apiRequest<PaginatedResponse<Bill>>("/bills", { query: params });
}

export function getBill(id: string) {
  return apiRequest<Bill>(`/bills/${id}`);
}
