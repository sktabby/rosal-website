import { apiRequest } from "./http";
import type { DashboardSummary } from "@/lib/types";

export function getAdminDashboardSummary() {
  return apiRequest<DashboardSummary>("/admin/dashboard-summary");
}
