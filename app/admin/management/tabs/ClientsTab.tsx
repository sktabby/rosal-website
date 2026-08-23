"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import { RowActions, ViewDialog } from "@/components/shared/ManagementDialogs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/FormField";
import { deleteClient, listClients, updateClient } from "@/lib/api/clients";
import type { Client } from "@/lib/types";
import { fullName } from "@/lib/utils";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/http";

export default function ClientsTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Client | null>(null);
  const [editing, setEditing] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["clients", "management", search, page],
    queryFn: () => listClients({ search, page }),
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
    { key: "name", header: "Name", render: (r) => fullName(r), primary: true },
    { key: "gstin", header: "GSTIN", render: (r) => r.gstin },
    { key: "phone", header: "Phone", render: (r) => r.phone },
    // Note: assigned seller's name isn't joined on this list endpoint per
    // the confirmed real payload — only the id is available here.
    { key: "assignedSellerId", header: "Assigned Seller", render: (r) => r.assignedSeller ? fullName(r.assignedSeller) : r.assignedSellerId },
  ];

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} placeholder="Search clients by name or GSTIN..." className="mb-3" />
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(r) => r.id}
        loading={isLoading}
        emptyTitle="No clients yet"
        emptyDescription="Create one from the Client Creation page."
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? 10}
        total={data?.total ?? 0}
        onPageChange={setPage}
        actions={(r) => (
          <RowActions onView={() => setViewing(r)} onEdit={() => openEdit(r)} onDelete={() => handleDelete(r.id)} deleting={deletingId === r.id} />
        )}
      />

      <ViewDialog
        open={!!viewing}
        onOpenChange={(o) => !o && setViewing(null)}
        title={viewing ? fullName(viewing) : ""}
        fields={
          viewing
            ? [
                { label: "GSTIN", value: viewing.gstin },
                { label: "Phone", value: viewing.phone },
                { label: "Address", value: viewing.address },
              ]
            : []
        }
      />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <FormField label="First Name">
            <Input value={editForm.firstName} onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))} />
          </FormField>
          <FormField label="Last Name">
            <Input value={editForm.lastName} onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))} />
          </FormField>
          <FormField label="Phone">
            <Input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} />
          </FormField>
          <FormField label="Address">
            <Textarea value={editForm.address} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} />
          </FormField>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="black" loading={saving} onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
