import { apiRequest } from "./http";

export interface UploadResponse {
  url: string;
}

// Confirmed contract: multipart/form-data, field name "file", PDF only,
// 10MB max (enforced server-side, mirrored client-side for a fast error).
export function uploadFile(file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiRequest<UploadResponse>("/uploads", { method: "POST", body: form, isForm: true });
}
