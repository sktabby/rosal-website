import { apiRequest } from "./http";
import type { PaginatedResponse, ProformaInvoice } from "@/lib/types";

// Included for completeness / future Admin visibility into PIs. PI
// creation/editing itself is Android-only (Seller role), not part of this
// web portal's page set.
export function listPis(params: {
  search?: string;
  status?: string;
  page?: number;
  clientId?: string;
} = {}) {
  return apiRequest<PaginatedResponse<ProformaInvoice>>("/pi", { query: params });
}

export function getPi(id: string) {
  return apiRequest<ProformaInvoice>(`/pi/${id}`);
}
