"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/FormField";
import PageHeader from "@/components/shared/PageHeader";
import SearchableSelect from "@/components/shared/SearchableSelect";
import { checkGstin, createClient } from "@/lib/api/clients";
import { listUsers } from "@/lib/api/users";
import { ApiError } from "@/lib/api/http";
import { UserRole } from "@/lib/enums";
import { toast } from "sonner";

export default function ClientCreationPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gstin: "",
    address: "",
    assignedSellerId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [checkingGst, setCheckingGst] = useState(false);

  const { data: sellers } = useQuery({
    queryKey: ["users", "seller"],
    queryFn: () => listUsers({ role: UserRole.SELLER, page: 1 }),
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  async function handleGstBlur() {
    if (!form.gstin) return;
    setCheckingGst(true);
    try {
      const res = await checkGstin(form.gstin);
      if (!res.available) {
        setErrors((e) => ({ ...e, gstin: "This GST number is already registered." }));
      }
    } catch {
      // Non-blocking — server-side validation on submit still catches duplicates.
    } finally {
      setCheckingGst(false);
    }
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.firstName) next.firstName = "Required.";
    if (!form.lastName) next.lastName = "Required.";
    if (!form.phone) next.phone = "Required.";
    if (!form.gstin) next.gstin = "Required.";
    if (!form.address) next.address = "Required.";
    if (!form.assignedSellerId) next.assignedSellerId = "Assign a seller.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await createClient(form);
      toast.success("Client created");
      router.push("/admin/management");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't create client.");
    } finally {
      setLoading(false);
    }
  }

  const sellerOptions = (sellers?.items ?? []).map((s) => ({
    value: s.id,
    label: `${s.firstName} ${s.lastName}`,
    meta: `· ${s.employeeCode}`,
  }));

  return (
    <div>
      <PageHeader title="Create Client" description="Clients are scoped to a single assigned Seller for the Android app." />

      <form onSubmit={handleSubmit} className="max-w-3xl rounded-card border border-rsl-border bg-white p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-x-4 lg:grid-cols-2">
          <FormField label="First Name" required error={errors.firstName}>
            <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} error={!!errors.firstName} />
          </FormField>
          <FormField label="Last Name" required error={errors.lastName}>
            <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} error={!!errors.lastName} />
          </FormField>
          <FormField label="Phone" required error={errors.phone}>
            <Input placeholder="+91" value={form.phone} onChange={(e) => set("phone", e.target.value)} error={!!errors.phone} />
          </FormField>
          <FormField
            label="GST Number"
            required
            error={errors.gstin}
            hint={checkingGst ? "Checking against DB..." : undefined}
          >
            <Input value={form.gstin} onChange={(e) => set("gstin", e.target.value)} onBlur={handleGstBlur} error={!!errors.gstin} />
          </FormField>
        </div>
        <FormField label="Address" required error={errors.address}>
          <Textarea value={form.address} onChange={(e) => set("address", e.target.value)} error={!!errors.address} />
        </FormField>
        <FormField label="Assign Seller" required error={errors.assignedSellerId}>
          <SearchableSelect
            value={form.assignedSellerId}
            onChange={(v) => set("assignedSellerId", v)}
            options={sellerOptions}
            placeholder="Select a seller"
            searchPlaceholder="Filter sellers by name or employee code..."
            error={!!errors.assignedSellerId}
          />
        </FormField>

        <Button type="submit" variant="red" size="block" loading={loading} className="mt-5 lg:w-auto">
          Create Client
        </Button>
      </form>
    </div>
  );
}
