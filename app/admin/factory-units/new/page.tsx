"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Info, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormSection } from "@/components/shared/FormField";
import PageHeader from "@/components/shared/PageHeader";
import SearchableSelect from "@/components/shared/SearchableSelect";
import { createFactoryUnit, listUnassignedDispatchers } from "@/lib/api/factoryUnits";
import { ApiError } from "@/lib/api/http";
import { toast } from "sonner";

export default function FactoryUnitCreationPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", address: "", assignedDispatcherId: "" });
  const [dispatchFrom, setDispatchFrom] = useState<string[]>([""]);
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
        dispatchFrom: dispatchFrom.map((d) => d.trim()).filter(Boolean),
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
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Create New Factory Unit"
        description="Each unit is a dispatch location with exactly one dispatcher responsible for it."
        backHref="/admin/home"
      />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-card border border-rsl-border bg-surface p-4 shadow-card sm:p-5 lg:p-6"
      >
        <FormSection title="Unit Details">
          <FormField label="Factory Unit Name" required error={errors.name}>
            <Input
              placeholder="e.g. Bhiwandi Unit 1"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              error={!!errors.name}
            />
          </FormField>
          <FormField
            label="Address"
            hint="Optional — appears as the dispatch address on paperwork."
          >
            <Textarea
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Street, area, city, state, PIN"
            />
          </FormField>
          <FormField
            label="Dispatch From"
            hint="Optional — places orders can be dispatched from (e.g. 1, 2, 3). Sellers pick one when creating an order."
            className="mb-0"
          >
            <div className="flex flex-col gap-2">
              {dispatchFrom.map((value, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder={`Dispatch from ${i + 1}`}
                    value={value}
                    onChange={(e) =>
                      setDispatchFrom((list) => list.map((v, j) => (j === i ? e.target.value : v)))
                    }
                  />
                  {dispatchFrom.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      aria-label="Remove"
                      onClick={() => setDispatchFrom((list) => list.filter((_, j) => j !== i))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto sm:self-start"
                onClick={() => setDispatchFrom((list) => [...list, ""])}
              >
                <Plus className="mr-1 h-4 w-4" /> Add another
              </Button>
            </div>
          </FormField>
        </FormSection>

        <FormSection title="Assignment">
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

          <div className="flex gap-2 rounded-field border border-rsl-amber/40 bg-notice-bg px-3.5 py-3 text-[11.5px] leading-snug text-notice-fg">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Only one dispatcher can be assigned per factory unit, so dispatchers already assigned
              elsewhere are not listed here.
            </span>
          </div>
        </FormSection>

        <div className="flex flex-col-reverse gap-2 border-t border-rsl-border pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" variant="red" loading={loading} className="w-full sm:w-auto">
            Create Factory Unit
          </Button>
        </div>
      </form>
    </div>
  );
}
