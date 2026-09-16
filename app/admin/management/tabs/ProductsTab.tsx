"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package } from "lucide-react";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import SearchBar from "@/components/shared/SearchBar";
import { FormField } from "@/components/shared/FormField";
import SimpleSelect from "@/components/shared/SimpleSelect";
import {
  EditDialog,
  Mono,
  RowActions,
  TitleCell,
  ViewDialog,
  useListState,
} from "@/components/shared/ManagementDialogs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { deleteProduct, listProducts, updateProduct } from "@/lib/api/products";
import type { Product } from "@/lib/types";
import { num } from "@/lib/utils";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/http";

const TAX_OPTIONS = ["0", "5", "12", "18", "28"].map((t) => ({ value: t, label: `${t}%` }));

function ProductIcon() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-rsl-amber/15 text-rsl-amber">
      <Package className="h-4 w-4" />
    </div>
  );
}

export default function ProductsTab() {
  const queryClient = useQueryClient();
  const { search, setSearch, debouncedSearch, page, setPage } = useListState();
  const [viewing, setViewing] = useState<Product | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ name: "", unit: "", taxPercent: "", hsnCode: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["products", "management", debouncedSearch, page],
    queryFn: () => listProducts({ search: debouncedSearch || undefined, page }),
  });

  function openEdit(p: Product) {
    setEditing(p);
    setEditForm({ name: p.name, unit: p.unit, taxPercent: String(num(p.taxPercent)), hsnCode: p.hsnCode });
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      await updateProduct(editing.id, { ...editForm, taxPercent: Number(editForm.taxPercent) });
      toast.success("Product updated");
      queryClient.invalidateQueries({ queryKey: ["products", "management"] });
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["products", "management"] });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't delete product.");
    } finally {
      setDeletingId(null);
    }
  }

  const columns: DataTableColumn<Product>[] = [
    {
      key: "name",
      header: "Name",
      primary: true,
      render: (r) => <TitleCell leading={<ProductIcon />} title={r.name} subtitle={<Mono>HSN {r.hsnCode}</Mono>} />,
    },
    { key: "unit", header: "Unit", render: (r) => r.unit },
    {
      key: "taxPercent",
      header: "Tax %",
      align: "right",
      render: (r) => <Badge className="bg-rsl-bg text-rsl-black">{num(r.taxPercent)}%</Badge>,
    },
  ];

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} placeholder="Search products by name..." className="mb-3" />
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(r) => r.id}
        loading={isLoading}
        emptyTitle={debouncedSearch ? "No matching products" : "No products yet"}
        emptyDescription={debouncedSearch ? "Try a different name." : "Create one from the Product Creation page."}
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? 10}
        total={data?.total ?? 0}
        onPageChange={setPage}
        cardBadge={(r) => <Badge className="bg-rsl-bg text-rsl-black">{num(r.taxPercent)}%</Badge>}
        actions={(r) => (
          <RowActions
            onView={() => setViewing(r)}
            onEdit={() => openEdit(r)}
            onDelete={() => handleDelete(r.id)}
            deleting={deletingId === r.id}
            itemName={r.name}
            itemKind="product"
          />
        )}
      />

      <ViewDialog
        open={!!viewing}
        onOpenChange={(o) => !o && setViewing(null)}
        title={viewing?.name ?? ""}
        subtitle={viewing && <Mono>HSN {viewing.hsnCode}</Mono>}
        leading={<ProductIcon />}
        fields={
          viewing
            ? [
                { label: "Unit", value: viewing.unit },
                { label: "Tax %", value: `${num(viewing.taxPercent)}%` },
                { label: "HSN Code", value: <Mono>{viewing.hsnCode}</Mono> },
              ]
            : []
        }
        onEdit={viewing ? () => openEdit(viewing) : undefined}
      />

      <EditDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing ? `Edit ${editing.name}` : "Edit Product"}
        saving={saving}
        onSave={saveEdit}
      >
        <FormField label="Name">
          <Input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
        </FormField>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <FormField label="Unit">
            <Input value={editForm.unit} onChange={(e) => setEditForm((f) => ({ ...f, unit: e.target.value }))} />
          </FormField>
          <FormField label="Tax %">
            <SimpleSelect
              value={editForm.taxPercent}
              onChange={(v) => setEditForm((f) => ({ ...f, taxPercent: v }))}
              options={TAX_OPTIONS}
            />
          </FormField>
        </div>
        <FormField label="HSN Code" hint="Exactly 12 digits." className="mb-0">
          <Input
            value={editForm.hsnCode}
            onChange={(e) => setEditForm((f) => ({ ...f, hsnCode: e.target.value.replace(/\D/g, "") }))}
            inputMode="numeric"
            maxLength={12}
          />
        </FormField>
      </EditDialog>
    </div>
  );
}
