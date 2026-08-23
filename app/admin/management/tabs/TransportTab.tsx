"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import { RowActions, ViewDialog } from "@/components/shared/ManagementDialogs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";
import { deleteTransport, listTransport, updateTransport } from "@/lib/api/transport";
import type { Transport } from "@/lib/types";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/http";

export default function TransportTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Transport | null>(null);
  const [editing, setEditing] = useState<Transport | null>(null);
  const [editForm, setEditForm] = useState({ name: "", gstin: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["transport", "management", search, page],
    queryFn: () => listTransport({ search, page }),
  });

  function openEdit(t: Transport) {
    setEditing(t);
    setEditForm({ name: t.name, gstin: t.gstin ?? "" });
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      await updateTransport(editing.id, editForm);
      toast.success("Transport updated");
      queryClient.invalidateQueries({ queryKey: ["transport"] });
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update transport.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteTransport(id);
      toast.success("Transport deleted");
      queryClient.invalidateQueries({ queryKey: ["transport"] });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't delete transport.");
    } finally {
      setDeletingId(null);
    }
  }

  const columns: DataTableColumn<Transport>[] = [
    { key: "name", header: "Name", render: (r) => r.name, primary: true },
    { key: "gstin", header: "GSTIN", render: (r) => r.gstin || "—" },
  ];

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} placeholder="Search transport options..." className="mb-3" />
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(r) => r.id}
        loading={isLoading}
        emptyTitle="No transport options yet"
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
        title={viewing?.name ?? ""}
        fields={viewing ? [{ label: "GSTIN", value: viewing.gstin || "—" }] : []}
      />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transport</DialogTitle>
          </DialogHeader>
          <FormField label="Name">
            <Input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
          </FormField>
          <FormField label="GSTIN">
            <Input value={editForm.gstin} onChange={(e) => setEditForm((f) => ({ ...f, gstin: e.target.value }))} />
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
