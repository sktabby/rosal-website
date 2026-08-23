"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/FormField";
import PageHeader from "@/components/shared/PageHeader";
import SearchableSelect from "@/components/shared/SearchableSelect";
import { createFactoryUnit, listUnassignedDispatchers } from "@/lib/api/factoryUnits";
import { ApiError } from "@/lib/api/http";
import { toast } from "sonner";

export default function FactoryUnitCreationPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", address: "", assignedDispatcherId: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { data: dispatchers } = useQuery({
    queryKey: ["factory-units", "unassigned-dispatchers"],
    queryFn: listUnassignedDispatchers,
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name) next.name = "Required.";
    if (!form.assignedDispatcherId) next.assignedDispatcherId = "Assign a dispatcher.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await createFactoryUnit({
        name: form.name,
        assignedDispatcherId: form.assignedDispatcherId,
        address: form.address || undefined,
      });
      toast.success("Factory unit created");
      router.push("/admin/management");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't create factory unit.");
    } finally {
      setLoading(false);
    }
  }

  const dispatcherOptions = (dispatchers ?? []).map((d) => ({
    value: d.id,
    label: `${d.firstName} ${d.lastName}`,
    meta: `· ${d.employeeCode}`,
  }));

  return (
    <div>
      <PageHeader title="Factory Unit Creation" />

      <form onSubmit={handleSubmit} className="max-w-xl rounded-card border border-rsl-border bg-white p-4 lg:p-6">
        <FormField label="Factory Unit Name" required error={errors.name}>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} error={!!errors.name} />
        </FormField>
        <FormField label="Address" hint="Factory unit's dispatch address (optional)">
          <Textarea value={form.address} onChange={(e) => set("address", e.target.value)} />
        </FormField>
        <FormField label="Assign Dispatcher" required error={errors.assignedDispatcherId}>
          <SearchableSelect
            value={form.assignedDispatcherId}
            onChange={(v) => set("assignedDispatcherId", v)}
            options={dispatcherOptions}
            placeholder="Select an unassigned dispatcher"
            searchPlaceholder="Filter by name or employee code..."
            emptyText="No unassigned dispatchers available"
            error={!!errors.assignedDispatcherId}
          />
        </FormField>

        <div className="mb-4 flex gap-2 rounded-field bg-[#fbe6e6] px-3 py-2.5 text-[11.5px] text-[#a01818]">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Only one dispatcher can be assigned per factory unit. Dispatchers already assigned elsewhere won&apos;t
            appear in this list.
          </span>
        </div>

        <Button type="submit" variant="black" size="block" loading={loading} className="lg:w-auto">
          Create Factory Unit
        </Button>
      </form>
    </div>
  );
}
