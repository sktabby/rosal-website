"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  ChevronRight,
  ClipboardList,
  Factory,
  FileCheck2,
  FileText,
  Package,
  Receipt,
  Truck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Pagination from "@/components/shared/Pagination";
import EmptyState from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listAuditLog } from "@/lib/api/auditLog";
import { getUser } from "@/lib/api/users";
import { getClient } from "@/lib/api/clients";
import { getProduct } from "@/lib/api/products";
import { getTransport } from "@/lib/api/transport";
import { getFactoryUnit } from "@/lib/api/factoryUnits";
import { getBill } from "@/lib/api/bills";
import { getInvoice } from "@/lib/api/invoices";
import type { AuditLogEntry, UserRecord } from "@/lib/types";
import { cn, formatDateTime, formatINR, relativeTime } from "@/lib/utils";

// ---- Human labels for the backend's internal identifiers --------------------

const ENTITY: Record<string, { label: string; icon: LucideIcon; article: string }> = {
  SalesOrder: { label: "sales order", icon: ClipboardList, article: "a" },
  ProformaInvoice: { label: "proforma invoice", icon: FileText, article: "a" },
  Bill: { label: "bill", icon: Receipt, article: "a" },
  Invoice: { label: "tax invoice", icon: FileCheck2, article: "a" },
  User: { label: "user", icon: UserRound, article: "a" },
  Client: { label: "client", icon: Users, article: "a" },
  Product: { label: "product", icon: Package, article: "a" },
  Transport: { label: "transport option", icon: Truck, article: "a" },
  FactoryUnit: { label: "factory unit", icon: Factory, article: "a" },
  CompanySettings: { label: "company details", icon: Building2, article: "the" },
};

function entityInfo(type: string) {
  return (
    ENTITY[type] ?? {
      label: type.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase(),
      icon: FileText,
      article: "a",
    }
  );
}

type Tone = "done" | "processing" | "rejected" | "cancelled" | "dispatched";

// `completed` on a sales order is the dispatcher marking it dispatched.
const ACTION: Record<string, { verb: string; chip: string; tone: Tone }> = {
  created: { verb: "created", chip: "Created", tone: "done" },
  edited: { verb: "updated", chip: "Updated", tone: "processing" },
  deleted: { verb: "deleted", chip: "Deleted", tone: "rejected" },
  accepted: { verb: "accepted", chip: "Accepted", tone: "processing" },
  completed: { verb: "dispatched", chip: "Dispatched", tone: "dispatched" },
  rejected: { verb: "rejected", chip: "Rejected", tone: "rejected" },
  cancelled: { verb: "cancelled", chip: "Cancelled", tone: "cancelled" },
};

function actionInfo(action: string) {
  return ACTION[action] ?? { verb: action, chip: action.charAt(0).toUpperCase() + action.slice(1), tone: "cancelled" as Tone };
}

const TONE_CLASS: Record<Tone, string> = {
  done: "bg-status-done-bg text-status-done-fg",
  processing: "bg-status-processing-bg text-status-processing-fg",
  dispatched: "bg-status-dispatched-bg text-status-dispatched-fg",
  rejected: "bg-status-rejected-bg text-status-rejected-fg",
  cancelled: "bg-status-cancelled-bg text-status-cancelled-fg",
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  SELLER: "Seller",
  DISPATCHER: "Dispatcher",
  ACCOUNTS: "Accounts",
};

const FILTERS = [
  { value: "", label: "All activity" },
  { value: "User", label: "Users" },
  { value: "Client", label: "Clients" },
  { value: "Product", label: "Products" },
  { value: "Transport", label: "Transport" },
  { value: "FactoryUnit", label: "Factory units" },
  { value: "SalesOrder", label: "Sales orders" },
  { value: "ProformaInvoice", label: "Proforma invoices" },
  { value: "Bill", label: "Bills" },
  { value: "Invoice", label: "Tax invoices" },
  { value: "CompanySettings", label: "Company" },
];

// ---- Identity ---------------------------------------------------------------

/**
 * The audit feed only carries the actor's name and role, and two people can
 * share a name. The employee code is what actually identifies someone, so it
 * is fetched once per distinct actor (react-query dedupes and caches by id).
 * Admin can read /users/:id, and it still resolves users who were deleted.
 */
function useActor(entry: AuditLogEntry) {
  const hasIdentity = !!entry.actor?.employeeCode;
  const { data, isLoading } = useQuery({
    queryKey: ["user", entry.actorId],
    queryFn: () => getUser(entry.actorId),
    enabled: !hasIdentity,
    staleTime: 10 * 60 * 1000,
    retry: 0,
  });

  const firstName = data?.firstName ?? entry.actor?.firstName ?? "";
  const lastName = data?.lastName ?? entry.actor?.lastName ?? "";
  const name = [firstName, lastName].filter(Boolean).join(" ") || "Unknown user";
  const role = data?.role ?? entry.actor?.role;

  return {
    name,
    initials: ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase() || "?",
    role: role ? ROLE_LABEL[role] ?? role : undefined,
    employeeCode: entry.actor?.employeeCode ?? data?.employeeCode,
    email: entry.actor?.email ?? data?.email,
    phone: entry.actor?.phone ?? data?.phone,
    status: data?.status,
    deleted: !!data?.deletedAt,
    loading: !hasIdentity && isLoading,
  };
}

function Avatar({ initials, size = "md" }: { initials: string; size?: "md" | "lg" }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rsl-amber to-rsl-orange font-bold text-rsl-black",
        size === "lg" ? "h-12 w-12 text-[15px]" : "h-10 w-10 text-[12px]"
      )}
    >
      {initials}
    </div>
  );
}

// ---- Record lookup (details panel only) ------------------------------------

async function resolveRecord(type: string, id: string): Promise<{ name: string; detail?: string } | null> {
  switch (type) {
    case "User": {
      const u: UserRecord = await getUser(id);
      return { name: `${u.firstName} ${u.lastName}`, detail: `${ROLE_LABEL[u.role] ?? u.role} · ${u.employeeCode}` };
    }
    case "Client": {
      const c = await getClient(id);
      return { name: `${c.firstName} ${c.lastName}`, detail: c.gstin ? `GSTIN ${c.gstin}` : undefined };
    }
    case "Product": {
      const p = await getProduct(id);
      return { name: p.name, detail: `HSN ${p.hsnCode}` };
    }
    case "Transport": {
      const t = await getTransport(id);
      return { name: t.name, detail: t.gstin ? `GSTIN ${t.gstin}` : "Own vehicle" };
    }
    case "FactoryUnit": {
      const f = await getFactoryUnit(id);
      return { name: f.name, detail: f.address ?? undefined };
    }
    case "Bill": {
      const b = await getBill(id);
      const client = b.client ? `${b.client.firstName} ${b.client.lastName}` : "Bill";
      return { name: client, detail: formatINR(b.amount) };
    }
    case "Invoice": {
      const i = await getInvoice(id);
      return { name: i.invoiceNumber ?? "Tax invoice" };
    }
    default:
      // Sales orders and proforma invoices are seller/dispatcher-only on the
      // backend, and company settings has no per-record lookup.
      return null;
  }
}

function RecordName({ entry }: { entry: AuditLogEntry }) {
  const lookupable = ["User", "Client", "Product", "Transport", "FactoryUnit", "Bill", "Invoice"].includes(
    entry.entityType
  );
  const { data, isLoading, isError } = useQuery({
    queryKey: ["audit-record", entry.entityType, entry.entityId],
    queryFn: () => resolveRecord(entry.entityType, entry.entityId),
    enabled: lookupable,
    staleTime: 10 * 60 * 1000,
    retry: 0,
  });

  if (entry.entityType === "CompanySettings") return <span>Company details</span>;
  if (lookupable && isLoading) return <Skeleton className="h-4 w-32" />;
  if (data) {
    return (
      <span>
        <span className="font-bold">{data.name}</span>
        {data.detail && <span className="block text-meta text-rsl-muted">{data.detail}</span>}
      </span>
    );
  }
  return (
    <span>
      <span className="font-mono text-[11.5px]">Ref {entry.entityId.slice(0, 8).toUpperCase()}</span>
      {isError && (
        <span className="block text-meta text-rsl-muted">This record has since been removed.</span>
      )}
    </span>
  );
}

// ---- Feed -------------------------------------------------------------------

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}

function ActivityRow({ entry, onOpen }: { entry: AuditLogEntry; onOpen: () => void }) {
  const actor = useActor(entry);
  const entity = entityInfo(entry.entityType);
  const action = actionInfo(entry.action);
  const EntityIcon = entity.icon;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-start gap-3 px-3.5 py-3 text-left transition-colors hover:bg-rsl-bg-soft focus-visible:bg-rsl-bg-soft focus-visible:outline-none sm:items-center sm:px-4"
    >
      <Avatar initials={actor.initials} />

      <div className="min-w-0 flex-1">
        <p className="text-body-md leading-snug text-rsl-black">
          <span className="font-bold">{actor.name}</span>{" "}
          <span className="text-rsl-muted">
            {action.verb} {entity.article}
          </span>{" "}
          <span className="inline-flex items-center gap-1 font-bold">
            <EntityIcon className="h-3.5 w-3.5 text-rsl-muted" />
            {entity.label}
          </span>
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-meta text-rsl-muted">
          {actor.role && <span>{actor.role}</span>}
          {actor.role && <span aria-hidden>·</span>}
          {actor.loading ? (
            <Skeleton className="inline-block h-3 w-16" />
          ) : (
            actor.employeeCode && <span className="font-mono text-[10.5px]">{actor.employeeCode}</span>
          )}
          {(actor.employeeCode || actor.loading) && <span aria-hidden>·</span>}
          <span title={formatDateTime(entry.timestamp)}>{relativeTime(entry.timestamp)}</span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 self-center">
        <span className={cn("hidden rounded-full px-2.5 py-1 text-[10.5px] font-bold sm:inline-block", TONE_CLASS[action.tone])}>
          {action.chip}
        </span>
        <ChevronRight className="h-4 w-4 text-rsl-muted/60" />
      </div>
    </button>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#f2f2f2] py-2.5 last:border-0">
      <span className="shrink-0 text-body text-rsl-muted">{label}</span>
      <span className="min-w-0 break-words text-right text-body text-rsl-black">{children}</span>
    </div>
  );
}

function ActivityDetails({ entry }: { entry: AuditLogEntry }) {
  const actor = useActor(entry);
  const entity = entityInfo(entry.entityType);
  const action = actionInfo(entry.action);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-bold">
          {action.chip} {entity.label}
        </DialogTitle>
        <DialogDescription>{formatDateTime(entry.timestamp)}</DialogDescription>
      </DialogHeader>

      <section className="rounded-card border border-rsl-border p-4">
        <h3 className="mb-3 text-section-label uppercase text-rsl-muted">Done by</h3>
        <div className="mb-2 flex items-center gap-3">
          <Avatar initials={actor.initials} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold text-rsl-black">{actor.name}</p>
            <p className="text-meta text-rsl-muted">{actor.role ?? "—"}</p>
          </div>
        </div>
        {actor.loading ? (
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <>
            <DetailRow label="Employee code">
              <span className="font-mono">{actor.employeeCode ?? "—"}</span>
            </DetailRow>
            <DetailRow label="Email">
              {actor.email ? (
                <a href={`mailto:${actor.email}`} className="text-rsl-red hover:underline">
                  {actor.email}
                </a>
              ) : (
                "—"
              )}
            </DetailRow>
            <DetailRow label="Phone">
              {actor.phone ? (
                <a href={`tel:${actor.phone}`} className="text-rsl-red hover:underline">
                  {actor.phone}
                </a>
              ) : (
                "—"
              )}
            </DetailRow>
            <DetailRow label="Account">
              {actor.deleted ? (
                <span className="rounded-full bg-status-rejected-bg px-2 py-0.5 text-[10.5px] font-bold text-status-rejected-fg">
                  Deleted
                </span>
              ) : actor.status === "DEACTIVATED" ? (
                <span className="rounded-full bg-status-cancelled-bg px-2 py-0.5 text-[10.5px] font-bold text-status-cancelled-fg">
                  Deactivated
                </span>
              ) : (
                <span className="rounded-full bg-status-done-bg px-2 py-0.5 text-[10.5px] font-bold text-status-done-fg">
                  Active
                </span>
              )}
            </DetailRow>
          </>
        )}
      </section>

      <section className="mt-3 rounded-card border border-rsl-border p-4">
        <h3 className="mb-1 text-section-label uppercase text-rsl-muted">What changed</h3>
        <DetailRow label="Action">
          <span className={cn("rounded-full px-2.5 py-0.5 text-[10.5px] font-bold", TONE_CLASS[action.tone])}>
            {action.chip}
          </span>
        </DetailRow>
        <DetailRow label="Type">
          <span className="capitalize">{entity.label}</span>
        </DetailRow>
        <DetailRow label="Record">
          <RecordName entry={entry} />
        </DetailRow>
      </section>
    </>
  );
}

export default function AdminHistoryPage() {
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState("");
  const [selected, setSelected] = useState<AuditLogEntry | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["audit-log", page, entityType],
    queryFn: () => listAuditLog({ page, entityType: entityType || undefined }),
    retry: 0,
  });

  const items = data?.items ?? [];
  const groups = items.reduce<{ label: string; entries: AuditLogEntry[] }[]>((acc, entry) => {
    const label = dayLabel(entry.timestamp);
    const last = acc[acc.length - 1];
    if (last && last.label === label) last.entries.push(entry);
    else acc.push({ label, entries: [entry] });
    return acc;
  }, []);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="History"
        description="Every change made in the portal — who did it, what they changed, and when. Tap an entry for full details."
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value || "all"}
            type="button"
            onClick={() => {
              setEntityType(f.value);
              setPage(1);
            }}
            className={cn(
              "min-h-[34px] shrink-0 rounded-full px-3.5 text-[11.5px] font-bold transition-colors",
              entityType === f.value
                ? "bg-rsl-black text-white"
                : "border border-rsl-border bg-white text-rsl-black hover:border-rsl-black/40"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isError ? (
        <div className="rounded-card border border-dashed border-rsl-border bg-white p-8 text-center">
          <p className="text-body-md font-bold text-rsl-black">Activity history couldn&apos;t be loaded</p>
          <p className="mt-1 text-meta text-rsl-muted">Check your connection and refresh the page.</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-2 rounded-card border border-rsl-border bg-white p-4 shadow-card">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description={entityType ? "Nothing has happened in this category yet." : "Changes will appear here as people use the portal."}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <section key={group.label}>
              <h3 className="mb-2 text-section-label uppercase text-rsl-muted">{group.label}</h3>
              <div className="divide-y divide-[#f2f2f2] overflow-hidden rounded-card border border-rsl-border bg-white shadow-card">
                {group.entries.map((entry) => (
                  <ActivityRow key={entry.id} entry={entry} onOpen={() => setSelected(entry)} />
                ))}
              </div>
            </section>
          ))}
          <Pagination
            page={data?.page ?? page}
            pageSize={data?.pageSize ?? 10}
            total={data?.total ?? 0}
            onPageChange={setPage}
          />
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>{selected && <ActivityDetails entry={selected} />}</DialogContent>
      </Dialog>
    </div>
  );
}
