"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FormField } from "@/components/shared/FormField";
import SimpleSelect from "@/components/shared/SimpleSelect";
import FileUploadField from "@/components/shared/FileUploadField";
import BackButton from "@/components/shared/BackButton";
import { getBill } from "@/lib/api/bills";
import { createInvoice } from "@/lib/api/invoices";
import { GstType, TransportType } from "@/lib/enums";
import { formatINR, num } from "@/lib/utils";
import { ApiError } from "@/lib/api/http";
import { toast } from "sonner";

const GST_OPTIONS = [
  { value: GstType.CGST_SGST, label: "CGST + SGST" },
  { value: GstType.IGST, label: "IGST" },
];

export default function CreateInvoicePage() {
  const params = useParams<{ billId: string }>();
  const router = useRouter();

  const { data: bill, isLoading } = useQuery({
    queryKey: ["bills", "detail", params.billId],
    queryFn: () => getBill(params.billId),
  });

  const [gstType, setGstType] = useState<string>(GstType.CGST_SGST);
  const [eWayBillNo, setEWayBillNo] = useState("");
  const [dispatchDocNo, setDispatchDocNo] = useState("");
  const [termsOfDelivery, setTermsOfDelivery] = useState("");
  const [remarks, setRemarks] = useState("");
  const [buyerDifferent, setBuyerDifferent] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerGstin, setBuyerGstin] = useState("");
  const [buyerContact, setBuyerContact] = useState("");
  const [buyerState, setBuyerState] = useState("");
  const [consigneeState, setConsigneeState] = useState("");
  const [externalFileUrl, setExternalFileUrl] = useState<string | null>(null);

  const client = bill?.client;

  // Defaults Terms of Delivery from the PI's transportType once the bill
  // loads (only if the user hasn't already typed something).
  useMemo(() => {
    if (bill?.order && !termsOfDelivery) {
      // order here is confirmed FLAT (no nested proformaInvoice), so
      // transportType isn't available on it — left blank, editable.
    }
  }, [bill, termsOfDelivery]);

  const taxableValue = useMemo(() => {
    if (!bill?.lineItems) return 0;
    return bill.lineItems.reduce((sum, li) => {
      const gross = num(li.qty) * num(li.price);
      const discount = gross * (num(li.discountPercent) / 100);
      return sum + (gross - discount);
    }, 0);
  }, [bill]);

  const taxRate = num(bill?.lineItems?.[0]?.taxPercent) || 18;
  const taxAmount = (taxableValue * taxRate) / 100;
  const grandTotalPreview = taxableValue + taxAmount;

  const mutation = useMutation({
    mutationFn: () =>
      createInvoice({
        billId: params.billId,
        gstType: gstType as (typeof GstType)[keyof typeof GstType],
        eWayBillNo: eWayBillNo || undefined,
        dispatchDocNo: dispatchDocNo || undefined,
        termsOfDelivery: termsOfDelivery || undefined,
        remarks: remarks || undefined,
        buyerName: buyerDifferent ? buyerName || undefined : undefined,
        buyerAddress: buyerDifferent ? buyerAddress || undefined : undefined,
        buyerGstin: buyerDifferent ? buyerGstin || undefined : undefined,
        buyerContact: buyerDifferent ? buyerContact || undefined : undefined,
        buyerState: buyerState || undefined,
        consigneeState: consigneeState || undefined,
        externalFileUrl: externalFileUrl || undefined,
      }),
    onSuccess: () => {
      toast.success("Invoice generated");
      router.push("/accounts/history");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Couldn't generate invoice.");
    },
  });

  if (isLoading || !bill) {
    return (
      <div className="max-w-3xl space-y-3">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="pb-24 lg:pb-6">
      <BackButton fallbackHref="/accounts/bills" />
      <h2 className="text-page-title-lg text-rsl-black mb-4">Create Invoice — {bill.id.slice(0, 8).toUpperCase()}</h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-card border border-rsl-border bg-white p-4">
            <p className="mb-3 text-section-label uppercase text-rsl-muted">Bill To</p>
            <Row label="Client" value={client ? `${client.firstName} ${client.lastName}` : "—"} />
            <Row label="GSTIN" value={client?.gstin ?? "—"} />
            <Row label="HSN" value={bill.lineItems?.[0]?.hsnCode ?? "—"} />
            <Row label="Taxable Value" value={formatINR(taxableValue)} />

            <FormField label="GST Type" required className="mt-3">
              <SimpleSelect value={gstType} onChange={setGstType} options={GST_OPTIONS} />
            </FormField>

            <div className="mt-2 rounded-field bg-rsl-bg-soft p-3 text-body space-y-1.5">
              {gstType === GstType.CGST_SGST ? (
                <>
                  <div className="flex justify-between"><span>CGST {(taxRate / 2).toFixed(1)}%</span><span>{formatINR(taxAmount / 2)}</span></div>
                  <div className="flex justify-between"><span>SGST {(taxRate / 2).toFixed(1)}%</span><span>{formatINR(taxAmount / 2)}</span></div>
                </>
              ) : (
                <div className="flex justify-between"><span>IGST {taxRate}%</span><span>{formatINR(taxAmount)}</span></div>
              )}
              <div className="flex justify-between font-bold border-t border-rsl-border pt-1.5 mt-1.5">
                <span>Grand Total (preview)</span>
                <span>{formatINR(grandTotalPreview)}</span>
              </div>
              <p className="text-[10.5px] text-rsl-muted pt-1">
                Round off and the final authoritative total are computed server-side on generation.
              </p>
            </div>
          </div>

          <div className="rounded-card border border-rsl-border bg-white p-4">
            <p className="mb-3 text-section-label uppercase text-rsl-muted">Shipping / Reference Details</p>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <FormField label="e-Way Bill No." hint="Optional">
                <Input value={eWayBillNo} onChange={(e) => setEWayBillNo(e.target.value)} />
              </FormField>
              <FormField label="Dispatch Doc No." hint="Optional">
                <Input value={dispatchDocNo} onChange={(e) => setDispatchDocNo(e.target.value)} />
              </FormField>
              <FormField label="Terms of Delivery" hint="Defaults from PI transport type if left blank">
                <SimpleSelect
                  value={termsOfDelivery}
                  onChange={setTermsOfDelivery}
                  options={[
                    { value: TransportType.GODOWN, label: "Godown" },
                    { value: TransportType.DOOR_DELIVERY, label: "Door Delivery" },
                  ]}
                  placeholder="Auto / select"
                />
              </FormField>
              <FormField label="Remarks" hint="Optional">
                <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} />
              </FormField>
            </div>
          </div>

          <div className="rounded-card border border-rsl-border bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-section-label uppercase text-rsl-muted">Buyer Details</p>
              <button
                type="button"
                onClick={() => setBuyerDifferent((v) => !v)}
                className="text-[11px] font-bold text-rsl-red hover:underline"
              >
                {buyerDifferent ? "Use client details" : "Buyer is different from client"}
              </button>
            </div>
            {buyerDifferent && (
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <FormField label="Buyer Name"><Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} /></FormField>
                <FormField label="Buyer GSTIN"><Input value={buyerGstin} onChange={(e) => setBuyerGstin(e.target.value)} /></FormField>
                <FormField label="Buyer Contact"><Input value={buyerContact} onChange={(e) => setBuyerContact(e.target.value)} /></FormField>
                <FormField label="Buyer Address" className="sm:col-span-2">
                  <Input value={buyerAddress} onChange={(e) => setBuyerAddress(e.target.value)} />
                </FormField>
              </div>
            )}
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2 mt-1">
              <FormField label="Buyer State" hint="No auto-derivation yet — enter manually">
                <Input value={buyerState} onChange={(e) => setBuyerState(e.target.value)} />
              </FormField>
              <FormField label="Consignee State" hint="No auto-derivation yet — enter manually">
                <Input value={consigneeState} onChange={(e) => setConsigneeState(e.target.value)} />
              </FormField>
            </div>
          </div>

          <div className="rounded-card border border-rsl-border bg-white p-4">
            <p className="mb-3 text-section-label uppercase text-rsl-muted">Attachment</p>
            <FileUploadField value={externalFileUrl} onChange={setExternalFileUrl} />
          </div>
        </div>

        {/* Finalize sidebar — desktop */}
        <div className="hidden lg:block">
          <div className="rounded-card bg-rsl-bg-soft border border-rsl-border p-4 sticky top-4">
            <p className="mb-2 text-section-label uppercase text-rsl-muted">Finalize</p>
            <p className="mb-3 text-meta text-rsl-muted">
              Generates the legal GST invoice, marks this bill Invoiced, and moves it to Accounts History.
            </p>
            <Button variant="black" size="block" loading={mutation.isPending} onClick={() => mutation.mutate()}>
              Generate Invoice
            </Button>
          </div>
        </div>
      </div>

      {/* Sticky mobile Generate button — highest-stakes action, always reachable */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-rsl-border bg-white p-3 lg:hidden">
        <Button variant="black" size="block" loading={mutation.isPending} onClick={() => mutation.mutate()}>
          Generate Invoice
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#f2f2f2] py-2 last:border-0">
      <span className="text-field-label uppercase text-rsl-muted">{label}</span>
      <span className="text-right text-body text-rsl-black">{value}</span>
    </div>
  );
}
