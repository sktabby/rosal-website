// Types below are built directly from the real Swagger contract + the real
// GET /orders/:id, GET /bills/:id, GET /clients response payloads confirmed
// against the live backend (see the "response shapes" thread). Where a type
// covers an endpoint that was NOT confirmed with a real payload (Users,
// Products, Transport, FactoryUnits list/detail, dashboards, search,
// audit-log), it is marked with a VERIFY comment — the shape is inferred
// from the original spec docs and is defensively optional in places so an
// unexpected/missing field never crashes the page, it just renders blank.

import { GstType, PiStatus, SalesOrderStatus, TransportType, UserRole } from "./enums";

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Prisma Decimal fields are serialized as strings over JSON. Always read
// money/qty/percent fields through `num()` in lib/utils.ts before doing math.
export type DecimalString = string;

export interface AuthUser {
  id: string;
  role: UserRole;
  employeeCode: string;
  generatedId?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  assignedFactoryUnitId?: string | null;
  status?: "ACTIVE" | "DEACTIVATED";
  lastLoginAt?: string | null;
  lastLoginDevice?: string | null;
  pushNotificationsEnabled?: boolean;
  emailNotificationsEnabled?: boolean;
}

// VERIFY: list/detail shape for Users inferred from spec docs, not a confirmed payload.
export interface UserRecord {
  id: string;
  role: UserRole;
  employeeCode: string;
  generatedId?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  status?: "ACTIVE" | "DEACTIVATED";
  assignedFactoryUnitId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  gstin: string;
  address: string;
  assignedSellerId: string;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  // Not present on the confirmed list payload today — only populate if a
  // future join adds it; code must not assume it exists.
  assignedSeller?: Pick<UserRecord, "id" | "firstName" | "lastName" | "employeeCode"> | null;
}

// VERIFY: inferred from spec docs.
export interface Product {
  id: string;
  name: string;
  unit: string;
  taxPercent: DecimalString | number;
  hsnCode: string;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Transport {
  id: string;
  name: string;
  gstin?: string | null;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface FactoryUnit {
  id: string;
  name: string;
  address?: string | null;
  dispatchFrom?: string[];
  assignedDispatcherId: string;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  assignedDispatcher?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
    phone?: string;
    email?: string;
    // Set once the dispatcher's own account is soft-deleted. The FactoryUnit
    // row still points at them (nothing clears assignedDispatcherId on
    // delete), so this is what tells the UI the assignment has gone stale.
    deletedAt?: string | null;
  } | null;
}

export interface CompanySettings {
  id?: string;
  name: string;
  gstin: string;
  address: string;
  udyamNumber?: string | null;
  panNumber?: string | null;
  bankName?: string | null;
  bankAccountNo?: string | null;
  bankIFSC?: string | null;
  bankBranch?: string | null;
  authorisedSignatory?: string | null;
  officeAddress?: string | null;
  declaration?: string | null;
}

export interface PiLineItem {
  productId: string;
  productName?: string;
  brand: string;
  qty: DecimalString | number;
  price: DecimalString | number;
  discountPercent?: DecimalString | number;
  hsnCode?: string;
  unit?: string;
  taxPercent?: DecimalString | number;
}

// VERIFY: PI detail nesting inferred from spec docs (PI is Android-authored;
// web only ever reads it nested under an Order).
export interface ProformaInvoice {
  id: string;
  piNumber: string;
  clientId: string;
  sellerId: string;
  shipToAddress: string;
  modeOfPayment: string;
  transportId: string;
  transportType: TransportType;
  status: PiStatus;
  editLocked: boolean;
  lineItems?: PiLineItem[];
  createdAt?: string;
  updatedAt?: string;
  client?: Client;
  transport?: Transport;
}

// Confirmed shape from real GET /orders/:id payload.
export interface SalesOrder {
  id: string;
  orderNumber: string;
  piId: string;
  lineItemsSnapshot: PiLineItem[];
  factoryUnitId: string;
  sellerId: string;
  status: SalesOrderStatus;
  cancelledBy: string | null;
  acceptedAt: string | null;
  completedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  proformaInvoice?: ProformaInvoice;
  factoryUnit?: FactoryUnit;
  // NOT present on the confirmed real GET /orders/:id payload today (only
  // sellerId, no nested seller). The v1.1 patch asked for the seller's name
  // on Kanban cards — flagged back to backend to add to the include. Card
  // rendering checks for this and simply omits the line if absent, so nothing
  // breaks either way.
  seller?: Pick<UserRecord, "id" | "firstName" | "lastName">;
}

// A Bill's nested `order`. GET /bills/:id also includes order.proformaInvoice
// (for ship-to and the transport type); the /bills list does not.
export interface BillOrderSummary {
  id: string;
  orderNumber: string;
  piId: string;
  lineItemsSnapshot: PiLineItem[];
  factoryUnitId: string;
  sellerId: string;
  status: SalesOrderStatus;
  cancelledBy: string | null;
  acceptedAt: string | null;
  completedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  proformaInvoice?: ProformaInvoice;
}

/** Set once Accounts has invoiced the bill. */
export interface BillInvoiceRef {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  grandTotal?: DecimalString;
}

export interface BillLineItem {
  id: string;
  billId: string;
  productId: string;
  brand: string;
  qty: DecimalString;
  price: DecimalString;
  hsnCode: string;
  taxPercent: DecimalString;
  discountPercent: DecimalString;
  product?: Product;
}

export interface Bill {
  id: string;
  orderId: string;
  clientId: string;
  amount: DecimalString;
  status: "PENDING" | "INVOICED";
  createdBySellerId: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  lineItems?: BillLineItem[];
  order?: BillOrderSummary;
  createdBySeller?: Pick<UserRecord, "id" | "firstName" | "lastName" | "employeeCode">;
  invoice?: BillInvoiceRef | null;
}

export interface InvoiceLineItem {
  description: string;
  hsnCode: string;
  qty: DecimalString | number;
  unit: string;
  rate: DecimalString | number;
  discountPercent: DecimalString | number;
  amount: DecimalString | number;
}

// VERIFY: Invoice detail response shape inferred from the CreateInvoiceDto +
// the v1.1 patch's described response fields — not a confirmed real payload.
export interface Invoice {
  id: string;
  billId: string;
  invoiceNumber?: string;
  gstType: GstType;
  eWayBillNo?: string | null;
  dispatchDocNo?: string | null;
  termsOfDelivery?: string | null;
  remarks?: string | null;
  buyerName?: string | null;
  buyerAddress?: string | null;
  buyerState?: string | null;
  buyerGstin?: string | null;
  buyerContact?: string | null;
  consigneeState?: string | null;
  taxableValue?: DecimalString | number;
  taxRate?: DecimalString | number;
  cgst?: DecimalString | number;
  sgst?: DecimalString | number;
  igst?: DecimalString | number;
  roundOff?: DecimalString | number;
  grandTotal?: DecimalString | number;
  amountInWords?: string;
  lineItems?: InvoiceLineItem[];
  pdfUrl?: string | null;
  externalFileUrl?: string | null;
  createdByAccountsId?: string;
  createdAt?: string;
  bill?: Bill;
}

// Matches OrderEvent + its `actor` include in the backend's order-events
// service. The actor select only carries name and role today; the identity
// fields are optional so a backend that adds them is picked up with no
// extra lookup.
export interface AuditLogEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  actor?: {
    firstName: string;
    lastName: string;
    role: UserRole;
    employeeCode?: string;
    email?: string;
    phone?: string;
  } | null;
  metadata?: Record<string, unknown> | null;
  timestamp: string;
}

export interface DashboardSummary {
  [key: string]: unknown;
}
