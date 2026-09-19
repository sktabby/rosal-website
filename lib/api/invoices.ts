import { apiRequest } from "./http";
import type { GstType } from "@/lib/enums";
import type { Invoice, PaginatedResponse } from "@/lib/types";

export interface CreateInvoicePayload {
  billId: string;
  gstType: GstType;
  eWayBillNo?: string;
  dispatchDocNo?: string;
  termsOfDelivery?: string;
  remarks?: string;
  buyerName?: string;
  buyerAddress?: string;
  buyerState?: string;
  buyerGstin?: string;
  buyerContact?: string;
  consigneeState?: string;
  externalFileUrl?: string;
}

export function createInvoice(payload: CreateInvoicePayload) {
  return apiRequest<Invoice>("/invoices", { method: "POST", body: payload });
}

export function listInvoices(params: { search?: string; page?: number } = {}) {
  return apiRequest<PaginatedResponse<Invoice>>("/invoices", { query: params });
}

export function getInvoice(id: string) {
  return apiRequest<Invoice>(`/invoices/${id}`);
}

/** The backend renders the tax invoice PDF on request (auth header required). */
export function getInvoicePdfUrl(id: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";
  return `${base}/invoices/${id}/pdf`;
}
