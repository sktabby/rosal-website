"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Factory } from "lucide-react";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import { FormField } from "@/components/shared/FormField";
import SearchableSelect from "@/components/shared/SearchableSelect";
import { EditDialog, Mono, RowActions, TitleCell, ViewDialog, useListState } from "@/components/shared/ManagementDialogs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteFactoryUnit, listFactoryUnits, listUnassignedDispatchers, updateFactoryUnit } from "@/lib/api/factoryUnits";
import type { FactoryUnit } from "@/lib/types";
import { fullName } from "@/lib/utils";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/http";

function FactoryIcon() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-rsl-black/10 text-rsl-black">
      <Factory className="h-4 w-4" />
    </div>
  );
}

export default function FactoryUnitsTab() {
  const queryClient = useQueryClient();
  const { search, setSearch, debouncedSearch, page, setPage } = useListState();
  const [viewing, setViewing] = useState<FactoryUnit | null>(null);
  const [editing, setEditing] = useState<FactoryUnit | null>(null);
  const [editForm, setEditForm] = useState({ name: "", address: "", assignedDispatcherId: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["factory-units", "management", debouncedSearch, page],
    queryFn: () => listFactoryUnits({ search: debouncedSearch || undefined, page }),
  });

  // Only currently-unassigned dispatchers, plus this unit's own dispatcher
  // (otherwise re-saving the same assignment would have no valid option).
  const { data: unassigned } = useQuery({
    queryKey: ["factory-units", "unassigned-dispatchers"],
    queryFn: listUnassignedDispatchers,
    enabled: !!editing,
  });

  function openEdit(f: FactoryUnit) {
    setEditing(f);
    setEditForm({ name: f.name, address: f.address ?? "", assignedDispatcherId: f.assignedDispatcherId });
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

  const dispatcherOptions = [
    ...(editing?.assignedDispatcher
      ? [
          {
            value: editing.assignedDispatcherId,
            label: fullName(editing.assignedDispatcher),
            meta: `· ${editing.assignedDispatcher.employeeCode} (current)`,
          },
        ]
      : []),
    ...(unassigned ?? [])
      .filter((d) => d.id !== editing?.assignedDispatcherId)
      .map((d) => ({ value: d.id, label: fullName(d), meta: `· ${d.employeeCode}` })),
  ];

  const columns: DataTableColumn<FactoryUnit>[] = [
    {
      key: "name",
      header: "Name",
      primary: true,
      render: (r) => (
        <TitleCell
          leading={<FactoryIcon />}
          title={r.name}
          subtitle={r.address ?? "No address on file"}
        />
      ),
    },
    {
      key: "dispatcher",
      header: "Assigned Dispatcher",
      render: (r) =>
        r.assignedDispatcher ? (
          <span>
            {fullName(r.assignedDispatcher)}{" "}
            <Mono>{r.assignedDispatcher.employeeCode}</Mono>
          </span>
        ) : (
          <span className="text-rsl-muted">Not assigned</span>
        ),
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
        emptyTitle={debouncedSearch ? "No matching factory units" : "No factory units yet"}
        emptyDescription={debouncedSearch ? "Try a different name." : "Create one from the Factory Unit page."}
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
            itemName={r.name}
            itemKind="factory unit"
          />
        )}
      />

      <ViewDialog
        open={!!viewing}
        onOpenChange={(o) => !o && setViewing(null)}
        title={viewing?.name ?? ""}
        leading={<FactoryIcon />}
        fields={
          viewing
            ? [
                { label: "Address", value: viewing.address || "—" },
                {
                  label: "Dispatcher",
                  value: viewing.assignedDispatcher ? (
                    <span>
                      {fullName(viewing.assignedDispatcher)} <Mono>{viewing.assignedDispatcher.employeeCode}</Mono>
                    </span>
                  ) : (
                    "Not assigned"
                  ),
                },
              ]
            : []
        }
        onEdit={viewing ? () => openEdit(viewing) : undefined}
      />

      <EditDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing ? `Edit ${editing.name}` : "Edit Factory Unit"}
        saving={saving}
        onSave={saveEdit}
      >
        <FormField label="Name">
          <Input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
        </FormField>
        <FormField label="Address">
          <Textarea value={editForm.address} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} rows={3} />
        </FormField>
        <FormField
          label="Assign Dispatcher"
          hint="Only one dispatcher can be assigned per factory unit."
          className="mb-0"
        >
          <SearchableSelect
            value={editForm.assignedDispatcherId}
            onChange={(v) => setEditForm((f) => ({ ...f, assignedDispatcherId: v }))}
            options={dispatcherOptions}
            placeholder="Select a dispatcher"
            searchPlaceholder="Filter by name or employee code..."
          />
        </FormField>
      </EditDialog>
    </div>
  );
}
