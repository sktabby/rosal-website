"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/FormField";
import PageHeader from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { getCompanySettings, updateCompanySettings } from "@/lib/api/companySettings";
import type { CompanySettings } from "@/lib/types";
import { ApiError } from "@/lib/api/http";
import { toast } from "sonner";

const FIELD_DEFS: { key: keyof CompanySettings; label: string; textarea?: boolean }[] = [
  { key: "name", label: "Company Name" },
  { key: "gstin", label: "GSTIN" },
  { key: "address", label: "Registered Address", textarea: true },
  { key: "udyamNumber", label: "UDYAM/MSME No." },
  { key: "panNumber", label: "PAN" },
  { key: "bankName", label: "Bank Name" },
  { key: "bankAccountNo", label: "Bank A/C No." },
  { key: "bankIFSC", label: "Bank IFSC" },
  { key: "bankBranch", label: "Bank Branch" },
  { key: "authorisedSignatory", label: "Authorised Signatory" },
];

export default function CompanySettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["company-settings"], queryFn: getCompanySettings });
  const [form, setForm] = useState<Partial<CompanySettings>>({});
  const [original, setOriginal] = useState<Partial<CompanySettings>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setForm(data);
      setOriginal(data);
    }
  }, [data]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // True partial patch — only send fields that actually changed.
    const changed: Partial<CompanySettings> = {};
    (Object.keys(form) as (keyof CompanySettings)[]).forEach((key) => {
      if (form[key] !== original[key]) {
        (changed as Record<string, unknown>)[key] = form[key];
      }
    });
    if (Object.keys(changed).length === 0) {
      toast("No changes to save");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateCompanySettings(changed);
      queryClient.setQueryData(["company-settings"], updated);
      setOriginal(updated);
      toast.success("Company settings saved");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Company Settings" />

      <div className="mb-4 flex gap-2 rounded-field bg-[#fbe6e6] px-3 py-2.5 text-[11.5px] text-[#a01818]">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        <span>This information appears on every PI, Bill, and Invoice across the system. Changes apply immediately to new documents.</span>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl rounded-card border border-rsl-border bg-white p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-x-4 lg:grid-cols-2">
          {FIELD_DEFS.map((f) =>
            f.textarea ? (
              <FormField key={f.key} label={f.label} className="lg:col-span-2">
                <Textarea
                  value={(form[f.key] as string) ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                />
              </FormField>
            ) : (
              <FormField key={f.key} label={f.label}>
                <Input
                  value={(form[f.key] as string) ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                />
              </FormField>
            )
          )}
        </div>
        <Button type="submit" variant="black" size="block" loading={saving} className="mt-2 lg:w-auto">
          Save Changes
        </Button>
      </form>
    </div>
  );
}
