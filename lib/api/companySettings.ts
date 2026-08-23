import { apiRequest } from "./http";
import type { CompanySettings } from "@/lib/types";

export function getCompanySettings() {
  return apiRequest<CompanySettings>("/company-settings");
}

// Confirmed as a true partial patch — only send changed fields.
export function updateCompanySettings(payload: Partial<CompanySettings>) {
  return apiRequest<CompanySettings>("/company-settings", { method: "PATCH", body: payload });
}
