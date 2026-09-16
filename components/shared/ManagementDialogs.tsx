"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Pencil, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getUser } from "@/lib/api/users";
import { cn } from "@/lib/utils";

// ---- Shared labels ----------------------------------------------------------

export const ROLE_NAME: Record<string, string> = {
  ADMIN: "Admin",
  SELLER: "Seller",
  DISPATCHER: "Dispatcher",
  ACCOUNTS: "Accounts",
};

export function StatusPill({ status }: { status?: string | null }) {
  const deactivated = status === "DEACTIVATED";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[10.5px] font-bold",
        deactivated ? "bg-status-cancelled-bg text-status-cancelled-fg" : "bg-status-done-bg text-status-done-fg"
      )}
    >
      {deactivated ? "Deactivated" : "Active"}
    </span>
  );
}

export function Initials({ first, last, className }: { first?: string; last?: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rsl-amber to-rsl-orange text-[11.5px] font-bold text-rsl-black",
        className
      )}
    >
      {((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase() || "?"}
    </div>
  );
}

/** Primary cell: bold title with a muted second line. */
export function TitleCell({
  title,
  subtitle,
  leading,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  leading?: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {leading}
      <div className="min-w-0">
        <p className="truncate font-bold text-ink">{title}</p>
        {subtitle && <p className="truncate text-meta font-normal text-rsl-muted">{subtitle}</p>}
      </div>
    </div>
  );
}

export function Mono({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[11.5px] tracking-tight text-ink">{children}</span>;
}

/**
 * Some list endpoints only return a user's id (clients carry assignedSellerId
 * with no join). Admin can read /users/:id, so resolve it once per id — the
 * query key is shared with the History page, so the cache is too.
 */
export function UserName({ id, withCode = true }: { id?: string | null; withCode?: boolean }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id as string),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    retry: 0,
  });
  if (!id) return <span className="text-rsl-muted">Not assigned</span>;
  if (isLoading) return <Skeleton className="inline-block h-4 w-28" />;
  if (isError || !data) return <span className="text-rsl-muted">Unknown user</span>;
  return (
    <span>
      {data.firstName} {data.lastName}
      {withCode && <span className="ml-1.5 font-mono text-[10.5px] text-rsl-muted">{data.employeeCode}</span>}
    </span>
  );
}

// ---- List state -------------------------------------------------------------

/**
 * Search is debounced so typing doesn't fire a request per keystroke, and any
 * change to the query jumps back to page 1 — otherwise searching from page 3
 * asks the server for page 3 of a result set that may only have one page.
 */
export function useListState(extraResetKey?: string) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, extraResetKey]);

  return { search, setSearch, debouncedSearch, page, setPage };
}

// ---- Row actions ------------------------------------------------------------

interface RowActionsProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  deleting?: boolean;
  /** Shown in the confirmation so the admin knows exactly what goes. */
  itemName: string;
  itemKind: string;
}

export function RowActions({ onView, onEdit, onDelete, deleting, itemName, itemKind }: RowActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const iconBtn =
    "flex h-9 w-9 items-center justify-center rounded-field text-rsl-muted transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-rsl-red";

  return (
    <div className="flex items-center justify-end gap-0.5">
      <button onClick={onView} className={cn(iconBtn, "hover:bg-rsl-bg hover:text-ink")} aria-label={`View ${itemName}`} title="View details">
        <Eye className="h-4 w-4" />
      </button>
      <button onClick={onEdit} className={cn(iconBtn, "hover:bg-rsl-bg hover:text-ink")} aria-label={`Edit ${itemName}`} title="Edit">
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => setConfirmOpen(true)}
        className={cn(iconBtn, "hover:bg-danger-bg hover:text-rsl-red")}
        aria-label={`Delete ${itemName}`}
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete ${itemKind} "${itemName}"?`}
        description={`It will be removed from lists and can't be selected anymore. Past orders and invoices that reference this ${itemKind} are kept, but this can't be undone from the portal.`}
        confirmLabel={`Delete ${itemKind}`}
        loading={deleting}
        onConfirm={async () => {
          await onDelete();
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}

// ---- View -------------------------------------------------------------------

export function ViewDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  leading,
  fields,
  onEdit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: React.ReactNode;
  leading?: React.ReactNode;
  fields: { label: string; value: React.ReactNode }[];
  onEdit?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex items-center gap-3 pr-6">
          {leading}
          <div className="min-w-0">
            <DialogTitle className="truncate font-bold">{title}</DialogTitle>
            {subtitle && <DialogDescription className="mt-0.5">{subtitle}</DialogDescription>}
          </div>
        </DialogHeader>
        <div className="rounded-card border border-rsl-border px-4 py-1">
          {fields.map((f) => (
            <div
              key={f.label}
              className="flex items-start justify-between gap-4 border-b border-line py-2.5 last:border-0"
            >
              <span className="shrink-0 text-body text-rsl-muted">{f.label}</span>
              <span className="min-w-0 break-words text-right text-body text-ink">{f.value}</span>
            </div>
          ))}
        </div>
        {onEdit && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Close
            </Button>
            <Button
              variant="red"
              onClick={() => {
                onOpenChange(false);
                onEdit();
              }}
              className="w-full sm:w-auto"
            >
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---- Edit -------------------------------------------------------------------

export function EditDialog({
  open,
  onOpenChange,
  title,
  description,
  saving,
  onSave,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  saving: boolean;
  onSave: () => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent maxWidthClass="lg:max-w-[560px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-bold">{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          {children}
          <DialogFooter className="border-t border-rsl-border pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" variant="red" loading={saving} className="w-full sm:w-auto">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
