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
import { Badge } from "@/components/ui/badge";
import { deleteUser, listUsers, updateUser } from "@/lib/api/users";
import type { UserRecord } from "@/lib/types";
import { fullName } from "@/lib/utils";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/http";

export default function UsersTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<UserRecord | null>(null);
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["users", "management", search, page],
    queryFn: () => listUsers({ search, page }),
  });

  function openEdit(u: UserRecord) {
    setEditing(u);
    setEditForm({ firstName: u.firstName, lastName: u.lastName, phone: u.phone ?? "", email: u.email ?? "" });
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      await updateUser(editing.id, editForm);
      toast.success("User updated");
      queryClient.invalidateQueries({ queryKey: ["users", "management"] });
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update user.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteUser(id);
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["users", "management"] });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't delete user.");
    } finally {
      setDeletingId(null);
    }
  }

  const columns: DataTableColumn<UserRecord>[] = [
    { key: "name", header: "Name", render: (r) => fullName(r), primary: true },
    { key: "employeeCode", header: "Employee Code", render: (r) => r.employeeCode },
    { key: "role", header: "Role", render: (r) => r.role },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge className={r.status === "DEACTIVATED" ? "bg-status-cancelled-bg text-status-cancelled-fg" : "bg-status-done-bg text-status-done-fg"}>
          {r.status ?? "ACTIVE"}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} placeholder="Search users by name or employee code..." className="mb-3" />
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(r) => r.id}
        loading={isLoading}
        emptyTitle="No users yet"
        emptyDescription="Create one from the User Creation page."
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? 10}
        total={data?.total ?? 0}
        onPageChange={setPage}
        cardBadge={(r) => (
          <Badge className={r.status === "DEACTIVATED" ? "bg-status-cancelled-bg text-status-cancelled-fg" : "bg-status-done-bg text-status-done-fg"}>
            {r.status ?? "ACTIVE"}
          </Badge>
        )}
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
                { label: "Employee Code", value: viewing.employeeCode },
                { label: "Role", value: viewing.role },
                { label: "Phone", value: viewing.phone ?? "—" },
                { label: "Email", value: viewing.email ?? "—" },
                { label: "Status", value: viewing.status ?? "ACTIVE" },
              ]
            : []
        }
      />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
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
          <FormField label="Email">
            <Input value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
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
