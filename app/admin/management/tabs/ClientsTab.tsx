"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import { FormField } from "@/components/shared/FormField";
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
import type { Client } from "@/lib/types";
import { fullName } from "@/lib/utils";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/http";

export default function ClientsTab() {
  const queryClient = useQueryClient();
  const { search, setSearch, debouncedSearch, page, setPage } = useListState();
  const [viewing, setViewing] = useState<Client | null>(null);
  const [editing, setEditing] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["clients", "management", debouncedSearch, page],
    queryFn: () => listClients({ search: debouncedSearch || undefined, page }),
  });

  function openEdit(c: Client) {
    setEditing(c);
    setEditForm({ firstName: c.firstName, lastName: c.lastName, phone: c.phone, address: c.address });
  }

  async function saveEdit() {
    if (!editing) return;
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
        description="GSTIN and assigned seller can't be changed here."
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
        <FormField label="Address" className="mb-0">
          <Textarea value={editForm.address} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} rows={3} />
        </FormField>
      </EditDialog>
    </div>
  );
}
