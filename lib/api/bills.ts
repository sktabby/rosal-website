import { apiRequest } from "./http";
import type { Bill, PaginatedResponse } from "@/lib/types";

/** status: PENDING = waiting for an invoice, INVOICED = done; omit for all. */
export function listBills(params: { search?: string; page?: number; status?: "PENDING" | "INVOICED" } = {}) {
  return apiRequest<PaginatedResponse<Bill>>("/bills", { query: params });
}

export function getBill(id: string) {
  return apiRequest<Bill>(`/bills/${id}`);
}
