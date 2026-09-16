"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormSection } from "@/components/shared/FormField";
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
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <PageHeader
          title="Register a Transport"
          description="Transporters become selectable on every dispatch. Added options appear below immediately."
          backHref="/admin/home"
        />

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-card border border-rsl-border bg-white p-4 shadow-card sm:p-5 lg:p-6"
        >
          <FormSection title="Add Transport Option">
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <FormField label="Transport Name" required error={error ?? undefined} className="mb-3 sm:mb-0">
                <Input
                  placeholder="e.g. Bhiwandi Roadlines"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  error={!!error}
                />
              </FormField>
              <FormField
                label="GST Number"
                hint="Optional — leave blank for own-vehicle entries."
                className="mb-0"
              >
                <Input
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  maxLength={15}
                  placeholder="27AANCR7712A1ZF"
                  className="uppercase"
                />
              </FormField>
            </div>
          </FormSection>

          <div className="flex border-t border-rsl-border pt-5 sm:justify-end">
            <Button type="submit" variant="red" loading={loading} className="w-full sm:w-auto">
              Add Transport
            </Button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="mb-2.5 text-section-label uppercase text-rsl-muted">Existing Transport Options</h3>
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
    </div>
  );
}
