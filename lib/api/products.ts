import { apiRequest } from "./http";
import type { PaginatedResponse, Product } from "@/lib/types";

export function createProduct(payload: {
  name: string;
  unit: string;
  taxPercent: number;
  hsnCode: string;
}) {
  return apiRequest<Product>("/products", { method: "POST", body: payload });
}

export function listProducts(params: { search?: string; page?: number } = {}) {
  return apiRequest<PaginatedResponse<Product>>("/products", { query: params });
}

export function getProduct(id: string) {
  return apiRequest<Product>(`/products/${id}`);
}

export function updateProduct(id: string, payload: Partial<Product>) {
  return apiRequest<Product>(`/products/${id}`, { method: "PATCH", body: payload });
}

export function deleteProduct(id: string) {
  return apiRequest<{ message?: string }>(`/products/${id}`, { method: "DELETE" });
}
