"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormSection } from "@/components/shared/FormField";
import PageHeader from "@/components/shared/PageHeader";
import SimpleSelect from "@/components/shared/SimpleSelect";
import { createProduct } from "@/lib/api/products";
import { ApiError } from "@/lib/api/http";
import { toast } from "sonner";

const UNIT_OPTIONS = ["KG", "PCS", "LTR", "SET", "BOX"].map((u) => ({ value: u, label: u }));
const TAX_OPTIONS = ["0", "5", "12", "18", "28"].map((t) => ({ value: t, label: `${t}%` }));

export default function ProductCreationPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", unit: "", taxPercent: "", hsnCode: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name) next.name = "Required.";
    if (!form.unit) next.unit = "Select a unit.";
    if (!form.taxPercent) next.taxPercent = "Select a tax rate.";
    if (!/^\d{12}$/.test(form.hsnCode)) next.hsnCode = "HSN code must be exactly 12 digits.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await createProduct({
        name: form.name,
        unit: form.unit,
        taxPercent: Number(form.taxPercent),
        hsnCode: form.hsnCode,
      });
      toast.success("Product created");
      router.push("/admin/management");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't create product.");
    } finally {
      setLoading(false);
    }
  }

  const hsnHint =
    form.hsnCode.length > 0 && form.hsnCode.length < 12
      ? `${form.hsnCode.length} of 12 digits.`
      : "Exactly 12 digits, e.g. 842410000000";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Create New Product"
        description="Products become selectable line items on every proforma invoice."
        backHref="/admin/home"
      />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-card border border-rsl-border bg-white p-4 shadow-card sm:p-5 lg:p-6"
      >
        <FormSection title="Product Details">
          <FormField label="Product Name" required error={errors.name}>
            <Input
              placeholder="e.g. ABC Type Dry Powder Fire Extinguisher 6kg"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              error={!!errors.name}
            />
          </FormField>
          <FormField
            label="Unit"
            required
            error={errors.unit}
            className="mb-0 sm:max-w-[calc(50%-0.5rem)]"
          >
            <SimpleSelect
              value={form.unit}
              onChange={(v) => set("unit", v)}
              options={UNIT_OPTIONS}
              error={!!errors.unit}
            />
          </FormField>
        </FormSection>

        <FormSection title="Tax & Classification" description="Drives the GST applied on every invoice line.">
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <FormField label="Tax (GST %)" required error={errors.taxPercent} className="mb-3 sm:mb-0">
              <SimpleSelect
                value={form.taxPercent}
                onChange={(v) => set("taxPercent", v)}
                options={TAX_OPTIONS}
                error={!!errors.taxPercent}
              />
            </FormField>
            <FormField label="HSN Code" required error={errors.hsnCode} hint={hsnHint} className="mb-0">
              <Input
                value={form.hsnCode}
                onChange={(e) => set("hsnCode", e.target.value.replace(/\D/g, ""))}
                error={!!errors.hsnCode}
                inputMode="numeric"
                maxLength={12}
                placeholder="842410000000"
              />
            </FormField>
          </div>
        </FormSection>

        <div className="flex flex-col-reverse gap-2 border-t border-rsl-border pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" variant="red" loading={loading} className="w-full sm:w-auto">
            Create Product
          </Button>
        </div>
      </form>
    </div>
  );
}
