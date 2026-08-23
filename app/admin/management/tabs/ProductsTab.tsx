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
import { deleteProduct, listProducts, updateProduct } from "@/lib/api/products";
import type { Product } from "@/lib/types";
import { num } from "@/lib/utils";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/http";

export default function ProductsTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Product | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ name: "", unit: "", taxPercent: "", hsnCode: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["products", "management", search, page],
    queryFn: () => listProducts({ search, page }),
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
    { key: "name", header: "Name", render: (r) => r.name, primary: true },
    { key: "unit", header: "Unit", render: (r) => r.unit },
    { key: "taxPercent", header: "Tax %", render: (r) => `${num(r.taxPercent)}%` },
    { key: "hsnCode", header: "HSN Code", render: (r) => r.hsnCode },
  ];

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} placeholder="Search products by name or HSN..." className="mb-3" />
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(r) => r.id}
        loading={isLoading}
        emptyTitle="No products yet"
        emptyDescription="Create one from the Product Creation page."
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
                { label: "Unit", value: viewing.unit },
                { label: "Tax %", value: `${num(viewing.taxPercent)}%` },
                { label: "HSN Code", value: viewing.hsnCode },
              ]
            : []
        }
      />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <FormField label="Name">
            <Input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
          </FormField>
          <FormField label="Unit">
            <Input value={editForm.unit} onChange={(e) => setEditForm((f) => ({ ...f, unit: e.target.value }))} />
          </FormField>
          <FormField label="Tax %">
            <Input value={editForm.taxPercent} onChange={(e) => setEditForm((f) => ({ ...f, taxPercent: e.target.value }))} />
          </FormField>
          <FormField label="HSN Code">
            <Input value={editForm.hsnCode} onChange={(e) => setEditForm((f) => ({ ...f, hsnCode: e.target.value }))} maxLength={12} />
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
