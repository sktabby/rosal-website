"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";
import PageHeader from "@/components/shared/PageHeader";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import { createTransport, listTransport } from "@/lib/api/transport";
import { ApiError } from "@/lib/api/http";
import type { Transport } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function TransportCreationPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [gstin, setGstin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["transport", page],
    queryFn: () => listTransport({ page }),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) {
      setError("Transport name is required.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await createTransport({ name, gstin: gstin || undefined });
      toast.success("Transport option added");
      setName("");
      setGstin("");
      queryClient.invalidateQueries({ queryKey: ["transport"] });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't add transport.");
    } finally {
      setLoading(false);
    }
  }

  const columns: DataTableColumn<Transport>[] = [
    { key: "name", header: "Name", render: (r) => r.name, primary: true },
    { key: "gstin", header: "GSTIN", render: (r) => r.gstin || "—" },
    { key: "createdAt", header: "Added", render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <div>
      <PageHeader title="Transport Creation" />

      <form
        onSubmit={handleSubmit}
        className="mb-6 max-w-xl rounded-card border border-rsl-border bg-white p-4 lg:p-6"
      >
        <FormField label="Transport Name" required error={error ?? undefined}>
          <Input value={name} onChange={(e) => setName(e.target.value)} error={!!error} />
        </FormField>
        <FormField label="GST Number" hint="Transporter's GSTIN (optional)">
          <Input value={gstin} onChange={(e) => setGstin(e.target.value)} />
        </FormField>
        <Button type="submit" variant="outline" loading={loading}>
          Add Transport
        </Button>
      </form>

      <p className="mb-2 text-section-label uppercase text-rsl-muted">Existing Transport Options</p>
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(r) => r.id}
        loading={isLoading}
        emptyTitle="No transport options yet"
        emptyDescription="Add one using the form above."
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? 10}
        total={data?.total ?? 0}
        onPageChange={setPage}
      />
    </div>
  );
}
