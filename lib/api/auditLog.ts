import { apiRequest } from "./http";
import type { AuditLogEntry, PaginatedResponse } from "@/lib/types";

// GET /admin/audit-log — confirmed added to the backend, same pagination
// envelope as every other list endpoint.
export function listAuditLog(params: { page?: number; entityType?: string } = {}) {
  return apiRequest<PaginatedResponse<AuditLogEntry>>("/admin/audit-log", { query: params });
}
