"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";
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

  return (
    <div>
      <PageHeader title="Create Product" />

      <form onSubmit={handleSubmit} className="max-w-3xl rounded-card border border-rsl-border bg-white p-4 lg:p-6">
        <FormField label="Product Name" required error={errors.name}>
          <Input
            placeholder="e.g. ABC Type Dry Powder Fire Extinguisher 6kg"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            error={!!errors.name}
          />
        </FormField>
        <div className="grid grid-cols-1 gap-x-4 lg:grid-cols-2">
          <FormField label="Unit" required error={errors.unit}>
            <SimpleSelect value={form.unit} onChange={(v) => set("unit", v)} options={UNIT_OPTIONS} error={!!errors.unit} />
          </FormField>
          <FormField label="Tax (GST %)" required error={errors.taxPercent}>
            <SimpleSelect value={form.taxPercent} onChange={(v) => set("taxPercent", v)} options={TAX_OPTIONS} error={!!errors.taxPercent} />
          </FormField>
        </div>
        <FormField label="HSN Code" required error={errors.hsnCode} hint="Exactly 12 digits, e.g. 842410000000">
          <Input value={form.hsnCode} onChange={(e) => set("hsnCode", e.target.value)} error={!!errors.hsnCode} maxLength={12} />
        </FormField>

        <Button type="submit" variant="amber" size="block" loading={loading} className="mt-2 lg:w-auto">
          Create Product
        </Button>
      </form>
    </div>
  );
}
