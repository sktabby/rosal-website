import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely converts a Prisma Decimal-as-string (or a plain number) into a JS
 * number for arithmetic/formatting. Returns 0 for null/undefined/invalid
 * input rather than throwing, since these values render inside tables that
 * must never crash on one bad row.
 */
export function num(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/** ₹ symbol + 2 decimals, consistently, everywhere. */
export function formatINR(value: string | number | null | undefined): string {
  const n = num(value);
  return `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "6h ago", "2d ago" — used on Dispatched order cards per the v1.1 patch. */
export function relativeTime(value: string | null | undefined): string {
  if (!value) return "";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function fullName(p?: { firstName?: string; lastName?: string } | null): string {
  if (!p) return "—";
  return [p.firstName, p.lastName].filter(Boolean).join(" ") || "—";
}

export function initials(p?: { firstName?: string; lastName?: string } | null): string {
  if (!p) return "?";
  const a = p.firstName?.[0] ?? "";
  const b = p.lastName?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}
