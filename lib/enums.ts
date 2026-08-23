// Single source of truth for every enum string value.
// These match the Prisma schema exactly, as confirmed against the live backend.
// If the backend ever changes a value, this is the one file to fix.

export const UserRole = {
  SELLER: "SELLER",
  DISPATCHER: "DISPATCHER",
  ACCOUNTS: "ACCOUNTS",
  ADMIN: "ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const PiStatus = {
  DRAFT: "DRAFT",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  ARCHIVED: "ARCHIVED",
} as const;
export type PiStatus = (typeof PiStatus)[keyof typeof PiStatus];

export const SalesOrderStatus = {
  PLACED: "PLACED",
  PENDING: "PENDING", // some backend list/filter params still use PENDING as the initial-state alias — accepted on read
  PROCESSING: "PROCESSING",
  DISPATCHED: "DISPATCHED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  BILLED: "BILLED",
} as const;
export type SalesOrderStatus = (typeof SalesOrderStatus)[keyof typeof SalesOrderStatus];

export const BillStatus = {
  PENDING: "PENDING",
  INVOICED: "INVOICED",
} as const;
export type BillStatus = (typeof BillStatus)[keyof typeof BillStatus];

export const TransportType = {
  GODOWN: "GODOWN",
  DOOR_DELIVERY: "DOOR_DELIVERY",
} as const;
export type TransportType = (typeof TransportType)[keyof typeof TransportType];

export const GstType = {
  CGST_SGST: "CGST_SGST",
  IGST: "IGST",
} as const;
export type GstType = (typeof GstType)[keyof typeof GstType];

export const STATUS_CHIP_STYLES: Record<
  string,
  { bg: string; fg: string; label: string }
> = {
  DRAFT: { bg: "bg-status-cancelled-bg", fg: "text-status-cancelled-fg", label: "Draft" },
  PENDING: { bg: "bg-status-pending-bg", fg: "text-status-pending-fg", label: "Pending" },
  PLACED: { bg: "bg-status-pending-bg", fg: "text-status-pending-fg", label: "Pending" },
  PROCESSING: { bg: "bg-status-processing-bg", fg: "text-status-processing-fg", label: "Processing" },
  DISPATCHED: { bg: "bg-status-dispatched-bg", fg: "text-status-dispatched-fg", label: "Dispatched" },
  BILLED: { bg: "bg-status-done-bg", fg: "text-status-done-fg", label: "Billed" },
  INVOICED: { bg: "bg-status-done-bg", fg: "text-status-done-fg", label: "Invoiced" },
  CONFIRMED: { bg: "bg-status-done-bg", fg: "text-status-done-fg", label: "Confirmed" },
  ACTIVE: { bg: "bg-status-done-bg", fg: "text-status-done-fg", label: "Active" },
  REJECTED: { bg: "bg-status-rejected-bg", fg: "text-status-rejected-fg", label: "Rejected" },
  CANCELLED: { bg: "bg-status-cancelled-bg", fg: "text-status-cancelled-fg", label: "Cancelled" },
  ARCHIVED: { bg: "bg-status-cancelled-bg", fg: "text-status-cancelled-fg", label: "Archived" },
};
