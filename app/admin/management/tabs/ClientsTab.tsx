"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import { FormField } from "@/components/shared/FormField";
import SearchableSelect from "@/components/shared/SearchableSelect";
import {
  EditDialog,
  Initials,
  Mono,
  RowActions,
  TitleCell,
  UserName,
  ViewDialog,
  useListState,
} from "@/components/shared/ManagementDialogs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteClient, listClients, updateClient } from "@/lib/api/clients";
import { getUser, listUsers } from "@/lib/api/users";
import type { Client } from "@/lib/types";
import { UserRole } from "@/lib/enums";
import { fullName } from "@/lib/utils";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/http";

export default function ClientsTab() {
  const queryClient = useQueryClient();
  const { search, setSearch, debouncedSearch, page, setPage } = useListState();
  const [viewing, setViewing] = useState<Client | null>(null);
  const [editing, setEditing] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", phone: "", address: "", assignedSellerId: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["clients", "management", debouncedSearch, page],
    queryFn: () => listClients({ search: debouncedSearch || undefined, page }),
  });

  // Same query the Create Client page uses for this picker — page 1 only
  // (the list endpoint caps at 10), so an org with 10+ sellers won't see
  // all of them here yet.
  const { data: sellers } = useQuery({
    queryKey: ["users", "seller"],
    queryFn: () => listUsers({ role: UserRole.SELLER, page: 1 }),
    enabled: !!editing,
  });
  // The client list endpoint doesn't reliably join assignedSeller, and even
  // when it does, that seller might not be on page 1 above — resolve them
  // explicitly so the current assignment is always a selectable option.
  const { data: currentSeller } = useQuery({
    queryKey: ["user", editing?.assignedSellerId],
    queryFn: () => getUser(editing!.assignedSellerId),
    enabled: !!editing?.assignedSellerId,
    staleTime: 10 * 60 * 1000,
  });

  const currentSellerDeleted = !!currentSeller?.deletedAt;

  const sellerOptions = [
    // A deleted seller is deliberately left out — offering them as "(current)"
    // would look like a valid pick and invite an accidental no-op save that
    // keeps the client pointed at an account that no longer exists.
    ...(currentSeller && !currentSellerDeleted
      ? [{ value: currentSeller.id, label: fullName(currentSeller), meta: `· ${currentSeller.employeeCode} (current)` }]
      : []),
    ...(sellers?.items ?? [])
      .filter((s) => s.id !== editing?.assignedSellerId)
      .map((s) => ({ value: s.id, label: fullName(s), meta: `· ${s.employeeCode}` })),
  ];

  function openEdit(c: Client) {
    setEditing(c);
    setEditForm({
      firstName: c.firstName,
      lastName: c.lastName,
      phone: c.phone,
      address: c.address,
      assignedSellerId: c.assignedSellerId,
    });
  }

  async function saveEdit() {
    if (!editing) return;
    // The picker can only be left pointed at a deleted seller if the admin
    // never touched it — catch that no-op case rather than silently saving
    // a client still assigned to an account that no longer exists.
    if (editForm.assignedSellerId === editing.assignedSellerId && currentSellerDeleted) {
      toast.error("That seller's account has been deleted — assign a different one before saving.");
      return;
    }
    setSaving(true);
    try {
      await updateClient(editing.id, editForm);
      toast.success("Client updated");
      queryClient.invalidateQueries({ queryKey: ["clients", "management"] });
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update client.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteClient(id);
      toast.success("Client deleted");
      queryClient.invalidateQueries({ queryKey: ["clients", "management"] });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't delete client.");
    } finally {
      setDeletingId(null);
    }
  }

  const columns: DataTableColumn<Client>[] = [
    {
      key: "name",
      header: "Name",
      primary: true,
      render: (r) => (
        <TitleCell
          leading={<Initials first={r.firstName} last={r.lastName} />}
          title={fullName(r)}
          subtitle={<Mono>{r.gstin}</Mono>}
        />
      ),
    },
    { key: "phone", header: "Phone", render: (r) => r.phone },
    {
      key: "assignedSellerId",
      header: "Assigned Seller",
      render: (r) => (r.assignedSeller ? fullName(r.assignedSeller) : <UserName id={r.assignedSellerId} />),
    },
  ];

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} placeholder="Search clients by name or GSTIN..." className="mb-3" />
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(r) => r.id}
        loading={isLoading}
        emptyTitle={debouncedSearch ? "No matching clients" : "No clients yet"}
        emptyDescription={debouncedSearch ? "Try a different name or GSTIN." : "Create one from the Client Creation page."}
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? 10}
        total={data?.total ?? 0}
        onPageChange={setPage}
        actions={(r) => (
          <RowActions
            onView={() => setViewing(r)}
            onEdit={() => openEdit(r)}
            onDelete={() => handleDelete(r.id)}
            deleting={deletingId === r.id}
            itemName={fullName(r)}
            itemKind="client"
          />
        )}
      />

      <ViewDialog
        open={!!viewing}
        onOpenChange={(o) => !o && setViewing(null)}
        title={viewing ? fullName(viewing) : ""}
        subtitle={viewing && <Mono>{viewing.gstin}</Mono>}
        leading={viewing && <Initials first={viewing.firstName} last={viewing.lastName} className="h-11 w-11 text-[13px]" />}
        fields={
          viewing
            ? [
                { label: "GSTIN", value: <Mono>{viewing.gstin}</Mono> },
                { label: "Phone", value: <a href={`tel:${viewing.phone}`} className="text-rsl-red hover:underline">{viewing.phone}</a> },
                { label: "Address", value: viewing.address },
                {
                  label: "Assigned Seller",
                  value: viewing.assignedSeller ? fullName(viewing.assignedSeller) : <UserName id={viewing.assignedSellerId} />,
                },
              ]
            : []
        }
        onEdit={viewing ? () => openEdit(viewing) : undefined}
      />

      <EditDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing ? `Edit ${fullName(editing)}` : "Edit Client"}
        description="GSTIN can't be changed here."
        saving={saving}
        onSave={saveEdit}
      >
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <FormField label="First Name">
            <Input value={editForm.firstName} onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))} autoComplete="given-name" />
          </FormField>
          <FormField label="Last Name">
            <Input value={editForm.lastName} onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))} autoComplete="family-name" />
          </FormField>
        </div>
        <FormField label="Phone">
          <Input type="tel" value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} autoComplete="tel" />
        </FormField>
        <FormField label="Address">
          <Textarea value={editForm.address} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} rows={3} />
        </FormField>
        <FormField label="Assign Seller" hint="Only this seller sees the client in the Android app." className="mb-0">
          {currentSellerDeleted && (
            <div className="mb-2 flex items-start gap-2 rounded-field border border-danger-fg/25 bg-danger-bg px-3 py-2 text-meta text-danger-fg">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                {fullName(currentSeller)}&apos;s account has been deleted. Choose a new seller for this client.
              </span>
            </div>
          )}
          <SearchableSelect
            value={editForm.assignedSellerId}
            onChange={(v) => setEditForm((f) => ({ ...f, assignedSellerId: v }))}
            options={sellerOptions}
            placeholder="Select a seller"
            searchPlaceholder="Filter sellers by name or employee code..."
            error={currentSellerDeleted && editForm.assignedSellerId === editing?.assignedSellerId}
          />
        </FormField>
      </EditDialog>
    </div>
  );
}
