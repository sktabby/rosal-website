"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormSection } from "@/components/shared/FormField";
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
  const [gstAvailable, setGstAvailable] = useState(false);

  const { data: sellers } = useQuery({
    queryKey: ["users", "seller"],
    queryFn: () => listUsers({ role: UserRole.SELLER, page: 1 }),
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
    if (key === "gstin") setGstAvailable(false);
  }

  async function handleGstBlur() {
    if (!form.gstin) return;
    setCheckingGst(true);
    try {
      const res = await checkGstin(form.gstin);
      setGstAvailable(res.available);
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

  const gstHint = checkingGst
    ? "Checking against the directory..."
    : gstAvailable
      ? "Available."
      : "15 characters, as printed on the GST certificate.";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Create New Client"
        description="Clients are scoped to a single assigned Seller for the Android app."
        backHref="/admin/home"
      />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-card border border-rsl-border bg-surface p-4 shadow-card sm:p-5 lg:p-6"
      >
        <FormSection title="Contact Details">
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <FormField label="First Name" required error={errors.firstName}>
              <Input
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                error={!!errors.firstName}
                autoComplete="given-name"
              />
            </FormField>
            <FormField label="Last Name" required error={errors.lastName}>
              <Input
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                error={!!errors.lastName}
                autoComplete="family-name"
              />
            </FormField>
            <FormField label="Phone" required error={errors.phone} className="sm:col-span-2 sm:max-w-[calc(50%-0.5rem)]">
              <Input
                type="tel"
                inputMode="tel"
                placeholder="+91"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                error={!!errors.phone}
                autoComplete="tel"
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Tax & Billing" description="Used on every invoice raised for this client.">
          <FormField label="GST Number" required error={errors.gstin} hint={gstHint}>
            <Input
              value={form.gstin}
              onChange={(e) => set("gstin", e.target.value.toUpperCase())}
              onBlur={handleGstBlur}
              error={!!errors.gstin}
              maxLength={15}
              placeholder="27AANCR7712A1ZF"
              className="uppercase"
            />
          </FormField>
          <FormField label="Address" required error={errors.address} className="mb-0">
            <Textarea
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              error={!!errors.address}
              rows={3}
              placeholder="Street, area, city, state, PIN"
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Assignment"
          description="Only this seller sees the client in the Android app."
        >
          <FormField label="Assign Seller" required error={errors.assignedSellerId} className="mb-0">
            <SearchableSelect
              value={form.assignedSellerId}
              onChange={(v) => set("assignedSellerId", v)}
              options={sellerOptions}
              placeholder="Select a seller"
              searchPlaceholder="Filter sellers by name or employee code..."
              error={!!errors.assignedSellerId}
            />
          </FormField>
        </FormSection>

        <div className="flex flex-col-reverse gap-2 border-t border-rsl-border pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" variant="red" loading={loading} className="w-full sm:w-auto">
            Create Client
          </Button>
        </div>
      </form>
    </div>
  );
}
