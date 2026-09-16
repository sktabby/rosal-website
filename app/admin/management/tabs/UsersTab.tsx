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
  ROLE_NAME,
  RowActions,
  StatusPill,
  TitleCell,
  ViewDialog,
  useListState,
} from "@/components/shared/ManagementDialogs";
import { Input } from "@/components/ui/input";
import { deleteUser, listUsers, updateUser } from "@/lib/api/users";
import type { UserRecord } from "@/lib/types";
import { fullName } from "@/lib/utils";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/http";

export default function UsersTab() {
  const queryClient = useQueryClient();
  const { search, setSearch, debouncedSearch, page, setPage } = useListState();
  const [viewing, setViewing] = useState<UserRecord | null>(null);
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["users", "management", debouncedSearch, page],
    queryFn: () => listUsers({ search: debouncedSearch || undefined, page }),
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
    {
      key: "name",
      header: "Name",
      primary: true,
      render: (r) => (
        <TitleCell
          leading={<Initials first={r.firstName} last={r.lastName} />}
          title={fullName(r)}
          subtitle={<Mono>{r.employeeCode}</Mono>}
        />
      ),
    },
    { key: "role", header: "Role", render: (r) => ROLE_NAME[r.role] ?? r.role },
    { key: "phone", header: "Phone", render: (r) => r.phone ?? "—" },
    { key: "status", header: "Status", render: (r) => <StatusPill status={r.status} /> },
  ];

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} placeholder="Search users by name or employee code..." className="mb-3" />
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(r) => r.id}
        loading={isLoading}
        emptyTitle={debouncedSearch ? "No matching users" : "No users yet"}
        emptyDescription={debouncedSearch ? "Try a different name or employee code." : "Create one from the User Creation page."}
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? 10}
        total={data?.total ?? 0}
        onPageChange={setPage}
        cardBadge={(r) => <StatusPill status={r.status} />}
        actions={(r) => (
          <RowActions
            onView={() => setViewing(r)}
            onEdit={() => openEdit(r)}
            onDelete={() => handleDelete(r.id)}
            deleting={deletingId === r.id}
            itemName={fullName(r)}
            itemKind="user"
          />
        )}
      />

      <ViewDialog
        open={!!viewing}
        onOpenChange={(o) => !o && setViewing(null)}
        title={viewing ? fullName(viewing) : ""}
        subtitle={viewing && `${ROLE_NAME[viewing.role] ?? viewing.role} · ${viewing.employeeCode}`}
        leading={viewing && <Initials first={viewing.firstName} last={viewing.lastName} className="h-11 w-11 text-[13px]" />}
        fields={
          viewing
            ? [
                { label: "Employee Code", value: <Mono>{viewing.employeeCode}</Mono> },
                { label: "Role", value: ROLE_NAME[viewing.role] ?? viewing.role },
                { label: "Phone", value: viewing.phone ? <a href={`tel:${viewing.phone}`} className="text-rsl-red hover:underline">{viewing.phone}</a> : "—" },
                { label: "Email", value: viewing.email ? <a href={`mailto:${viewing.email}`} className="text-rsl-red hover:underline">{viewing.email}</a> : "—" },
                { label: "Status", value: <StatusPill status={viewing.status} /> },
              ]
            : []
        }
        onEdit={viewing ? () => openEdit(viewing) : undefined}
      />

      <EditDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing ? `Edit ${fullName(editing)}` : "Edit User"}
        description="Employee Code and Role can't be changed after creation."
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
          <FormField label="Phone">
            <Input type="tel" value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} autoComplete="tel" />
          </FormField>
          <FormField label="Email" className="mb-0 sm:mb-0">
            <Input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} autoComplete="email" />
          </FormField>
        </div>
      </EditDialog>
    </div>
  );
}
