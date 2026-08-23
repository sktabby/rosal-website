import { apiRequest } from "./http";
import type { PaginatedResponse, SalesOrder } from "@/lib/types";

export type OrderScope = "active" | "history";

/**
 * Centralizes the visibility-window param so it can never be miswired per
 * page. `archived=true` is the confirmed final param name (the backend also
 * still accepts the older `history=true` alias, so this stays correct even
 * if a deployment lags).
 *   - "active"  -> omit the param (default: excludes DISPATCHED orders
 *                  older than 48h; REJECTED/CANCELLED never included here)
 *   - "history" -> archived=true (includes 48h+ DISPATCHED plus all REJECTED)
 */
export function listOrders(params: {
  scope?: OrderScope;
  status?: string;
  search?: string;
  page?: number;
} = {}) {
  const { scope = "active", ...rest } = params;
  return apiRequest<PaginatedResponse<SalesOrder>>("/orders", {
    query: {
      ...rest,
      archived: scope === "history" ? true : undefined,
    },
  });
}

export function getOrder(id: string) {
  return apiRequest<SalesOrder>(`/orders/${id}`);
}

export function acceptOrder(id: string) {
  return apiRequest<SalesOrder>(`/orders/${id}/accept`, { method: "PATCH" });
}

export function completeOrder(id: string) {
  return apiRequest<SalesOrder>(`/orders/${id}/complete`, { method: "PATCH" });
}

export function rejectOrder(id: string) {
  return apiRequest<SalesOrder>(`/orders/${id}/reject`, { method: "PATCH" });
}

export function cancelOrder(id: string) {
  return apiRequest<SalesOrder>(`/orders/${id}/cancel`, { method: "PATCH" });
}
