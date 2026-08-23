import { apiRequest } from "./http";

// Confirmed contract: only `q`, no `scope` param exists.
export interface SearchResult {
  entityType: string;
  id: string;
  label: string;
  meta?: string;
}

export function globalSearch(q: string) {
  return apiRequest<SearchResult[] | { items: SearchResult[] }>("/search", { query: { q } });
}
