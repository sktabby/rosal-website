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
import { deleteFactoryUnit, listFactoryUnits, updateFactoryUnit } from "@/lib/api/factoryUnits";
import type { FactoryUnit } from "@/lib/types";
import { fullName } from "@/lib/utils";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/http";

export default function FactoryUnitsTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<FactoryUnit | null>(null);
  const [editing, setEditing] = useState<FactoryUnit | null>(null);
  const [editForm, setEditForm] = useState({ name: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["factory-units", "management", search, page],
    queryFn: () => listFactoryUnits({ search, page }),
  });

  function openEdit(f: FactoryUnit) {
    setEditing(f);
    setEditForm({ name: f.name, address: f.address ?? "" });
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      await updateFactoryUnit(editing.id, editForm);
      toast.success("Factory unit updated");
      queryClient.invalidateQueries({ queryKey: ["factory-units"] });
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update factory unit.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteFactoryUnit(id);
      toast.success("Factory unit deleted");
      queryClient.invalidateQueries({ queryKey: ["factory-units"] });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't delete factory unit.");
    } finally {
      setDeletingId(null);
    }
  }

  const columns: DataTableColumn<FactoryUnit>[] = [
    { key: "name", header: "Name", render: (r) => r.name, primary: true },
    {
      key: "dispatcher",
      header: "Assigned Dispatcher",
      render: (r) => (r.assignedDispatcher ? fullName(r.assignedDispatcher) : "—"),
    },
  ];

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} placeholder="Search factory units..." className="mb-3" />
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(r) => r.id}
        loading={isLoading}
        emptyTitle="No factory units yet"
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
        fields={
          viewing
            ? [
                { label: "Address", value: viewing.address || "—" },
                { label: "Dispatcher", value: viewing.assignedDispatcher ? fullName(viewing.assignedDispatcher) : "—" },
              ]
            : []
        }
      />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Factory Unit</DialogTitle>
          </DialogHeader>
          <FormField label="Name">
            <Input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
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
