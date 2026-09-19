"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FormField } from "@/components/shared/FormField";
import SimpleSelect from "@/components/shared/SimpleSelect";
import FileUploadField from "@/components/shared/FileUploadField";
import BackButton from "@/components/shared/BackButton";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import InvoicePdfLink from "@/components/shared/InvoicePdfLink";
import { getBill } from "@/lib/api/bills";
import { createInvoice } from "@/lib/api/invoices";
import { getCompanySettings } from "@/lib/api/companySettings";
import { GstType } from "@/lib/enums";
import { isSameState, stateFromGstin } from "@/lib/gst";
import type { Bill } from "@/lib/types";
import { formatDate, formatINR, fullName, num } from "@/lib/utils";
import { ApiError } from "@/lib/api/http";
import { toast } from "sonner";

const GST_OPTIONS = [
  { value: GstType.CGST_SGST, label: "CGST + SGST (same state)" },
  { value: GstType.IGST, label: "IGST (other state)" },
];

// Free-text on the invoice; these match the backend's own defaults.
const DELIVERY_OPTIONS = [
  { value: "Godown", label: "Godown" },
  { value: "Door Delivery", label: "Door Delivery" },
];

const pdfName = (invoiceNumber: string) => `${invoiceNumber.replace(/[^A-Za-z0-9._-]/g, "_")}.pdf`;

export default function CreateInvoicePage() {
  const params = useParams<{ billId: string }>();

  const { data: bill, isLoading, isError, refetch } = useQuery({
    queryKey: ["bills", "detail", params.billId],
    queryFn: () => getBill(params.billId),
  });

  if (isError) {
    return (
      <div className="max-w-3xl">
        <BackButton fallbackHref="/accounts/bills" />
        <div className="rounded-card border border-rsl-border bg-surface p-6 text-center">
          <p className="font-semibold text-ink">Couldn&apos;t load this bill</p>
          <button type="button" onClick={() => refetch()} className="mt-2 text-body font-bold text-rsl-red hover:underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !bill) {
    return (
      <div className="max-w-3xl space-y-3">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return bill.invoice ? <AlreadyInvoiced bill={bill} /> : <InvoiceForm bill={bill} />;
}

/** The bill already has its invoice — show it instead of offering a second one. */
function AlreadyInvoiced({ bill }: { bill: Bill }) {
  const invoice = bill.invoice!;
  return (
    <div className="max-w-2xl">
      <BackButton fallbackHref="/accounts/bills" />
      <div className="rounded-card border border-rsl-border bg-surface p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-status-done-fg" />
          <div>
            <h2 className="text-page-title-lg text-ink">Already invoiced</h2>
            <p className="text-body text-rsl-muted">
              This bill for {bill.client ? fullName(bill.client) : "the client"} (order {bill.order?.orderNumber ?? "—"}) has been invoiced.
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Fact label="Invoice No." value={invoice.invoiceNumber} />
          <Fact label="Date" value={formatDate(invoice.createdAt)} />
          <Fact label="Grand Total" value={formatINR(invoice.grandTotal ?? bill.amount)} />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <InvoicePdfLink invoiceId={invoice.id} fileName={pdfName(invoice.invoiceNumber)} variant="button" label="View invoice PDF" />
          <Link
            href="/accounts/history"
            className="inline-flex min-h-[44px] items-center rounded-field px-[18px] text-body font-semibold text-ink hover:bg-rsl-bg"
          >
            Go to Accounts History
          </Link>
        </div>
      </div>
    </div>
  );
}

function InvoiceForm({ bill }: { bill: Bill }) {
  const queryClient = useQueryClient();
  const client = bill.client;
  const pi = bill.order?.proformaInvoice;

  const { data: company } = useQuery({ queryKey: ["company-settings"], queryFn: getCompanySettings });
  const sameState = isSameState(company?.gstin, client?.gstin);

  const [gstType, setGstType] = useState<string>(GstType.CGST_SGST);
  const [gstTouched, setGstTouched] = useState(false);
  const [eWayBillNo, setEWayBillNo] = useState("");
  const [dispatchDocNo, setDispatchDocNo] = useState("");
  const [termsOfDelivery, setTermsOfDelivery] = useState(pi?.transportType === "DOOR_DELIVERY" ? "Door Delivery" : pi ? "Godown" : "");
  const [remarks, setRemarks] = useState("");
  const [buyerDifferent, setBuyerDifferent] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerGstin, setBuyerGstin] = useState("");
  const [buyerContact, setBuyerContact] = useState("");
  const [buyerState, setBuyerState] = useState(stateFromGstin(client?.gstin));
  const [consigneeState, setConsigneeState] = useState(stateFromGstin(client?.gstin));
  const [externalFileUrl, setExternalFileUrl] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Suggest the GST type from the two GSTINs once company settings load, unless already chosen.
  useEffect(() => {
    if (!gstTouched && sameState !== null) setGstType(sameState ? GstType.CGST_SGST : GstType.IGST);
  }, [sameState, gstTouched]);

  // Mirrors the backend: per line, discount before tax; tax at each line's own rate; total rounded to the rupee.
  const figures = useMemo(() => {
    const byRate = new Map<number, number>();
    const lines = (bill.lineItems ?? []).map((li) => {
      const gross = num(li.qty) * num(li.price);
      const amount = gross * (1 - num(li.discountPercent) / 100);
      const rate = num(li.taxPercent);
      byRate.set(rate, (byRate.get(rate) ?? 0) + amount);
      return { li, amount, rate };
    });
    const taxable = lines.reduce((s, l) => s + l.amount, 0);
    const tax = [...byRate.entries()].reduce((s, [rate, base]) => s + (base * rate) / 100, 0);
    const grandTotal = Math.round(taxable + tax);
    return { lines, byRate: [...byRate.entries()].filter(([r]) => r > 0).sort((a, b) => a[0] - b[0]), taxable, tax, roundOff: grandTotal - (taxable + tax), grandTotal };
  }, [bill]);

  const mutation = useMutation({
    mutationFn: () =>
      createInvoice({
        billId: bill.id,
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
    onSuccess: (invoice) => {
      toast.success(`Invoice ${invoice.invoiceNumber ?? ""} generated`);
      setConfirmOpen(false);
      // Refetching turns this page into the "already invoiced" view with the PDF.
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (err) => {
      setConfirmOpen(false);
      toast.error(err instanceof ApiError ? err.message : "Couldn't generate invoice.");
      // e.g. someone else invoiced it meanwhile — refresh to show the real state.
      queryClient.invalidateQueries({ queryKey: ["bills", "detail", bill.id] });
    },
  });

  const gstLines: [string, number][] = figures.byRate.flatMap(([rate, base]): [string, number][] =>
    gstType === GstType.CGST_SGST
      ? [
          [`CGST @ ${rate / 2}%`, (base * rate) / 200],
          [`SGST @ ${rate / 2}%`, (base * rate) / 200],
        ]
      : [[`IGST @ ${rate}%`, (base * rate) / 100]],
  );

  return (
    <div className="pb-24 lg:pb-6">
      <BackButton fallbackHref="/accounts/bills" />
      <h2 className="text-page-title-lg text-ink mb-1">Create Invoice — Order {bill.order?.orderNumber ?? bill.id.slice(0, 8).toUpperCase()}</h2>
      <p className="mb-4 text-body text-rsl-muted">
        Billed {formatDate(bill.createdAt)}
        {bill.createdBySeller ? ` by ${fullName(bill.createdBySeller)}` : ""}
        {pi?.piNumber ? ` · PI ${pi.piNumber}` : ""}
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card title="Bill To">
            <Row label="Client" value={client ? fullName(client) : "—"} />
            <Row label="GSTIN" value={client?.gstin ?? "—"} />
            <Row label="Address" value={client?.address ?? "—"} />
            <Row label="Ship To" value={pi?.shipToAddress ?? "—"} />
          </Card>

          <Card title={`Items · ${figures.lines.length}`}>
            <div className="-mx-1 overflow-x-auto">
              <table className="w-full min-w-[560px] text-body">
                <thead>
                  <tr className="border-b border-rsl-border text-left text-field-label uppercase text-rsl-muted">
                    <th className="px-1 py-2">Product</th>
                    <th className="px-1 py-2">HSN</th>
                    <th className="px-1 py-2 text-right">Qty</th>
                    <th className="px-1 py-2 text-right">Rate</th>
                    <th className="px-1 py-2 text-right">Disc</th>
                    <th className="px-1 py-2 text-right">GST</th>
                    <th className="px-1 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {figures.lines.map(({ li, amount, rate }) => (
                    <tr key={li.id} className="border-b border-line last:border-0">
                      <td className="px-1 py-2">
                        <div className="font-semibold text-ink">{li.product?.name ?? "Product"}</div>
                        <div className="text-meta text-rsl-muted">{li.brand}</div>
                      </td>
                      <td className="px-1 py-2 text-rsl-muted">{li.hsnCode}</td>
                      <td className="px-1 py-2 text-right">{num(li.qty)} {li.product?.unit ?? ""}</td>
                      <td className="px-1 py-2 text-right">{formatINR(li.price)}</td>
                      <td className="px-1 py-2 text-right">{num(li.discountPercent) > 0 ? `${num(li.discountPercent)}%` : "—"}</td>
                      <td className="px-1 py-2 text-right">{rate}%</td>
                      <td className="px-1 py-2 text-right font-semibold text-ink">{formatINR(amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="GST">
            <FormField
              label="GST Type"
              required
              hint={
                sameState === null
                  ? "Choose based on the place of supply."
                  : `Suggested from GSTINs: client is in ${sameState ? "the same state" : "a different state"}. You can change it.`
              }
            >
              <SimpleSelect
                value={gstType}
                onChange={(v) => {
                  setGstType(v);
                  setGstTouched(true);
                }}
                options={GST_OPTIONS}
              />
            </FormField>
            <div className="mt-2 rounded-field bg-rsl-bg-soft p-3 text-body space-y-1.5">
              <Line label="Taxable value" value={formatINR(figures.taxable)} />
              {gstLines.map(([label, value]) => (
                <Line key={label} label={label} value={formatINR(value)} />
              ))}
              {Math.abs(figures.roundOff) >= 0.005 && <Line label="Round off" value={formatINR(figures.roundOff)} />}
              <div className="flex justify-between border-t border-rsl-border pt-1.5 mt-1.5 font-bold">
                <span>Grand Total</span>
                <span>{formatINR(figures.grandTotal)}</span>
              </div>
            </div>
          </Card>

          <Card title="Shipping / Reference Details">
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <FormField label="e-Way Bill No." hint="Optional">
                <Input value={eWayBillNo} onChange={(e) => setEWayBillNo(e.target.value)} />
              </FormField>
              <FormField label="Dispatch Doc No." hint="Optional">
                <Input value={dispatchDocNo} onChange={(e) => setDispatchDocNo(e.target.value)} />
              </FormField>
              <FormField label="Terms of Delivery" hint={pi ? "Pre-filled from the PI's transport type" : undefined}>
                <SimpleSelect value={termsOfDelivery} onChange={setTermsOfDelivery} options={DELIVERY_OPTIONS} placeholder="Select" />
              </FormField>
              <FormField label="Remarks" hint="Optional — defaults to the sales person on the PDF">
                <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} />
              </FormField>
            </div>
          </Card>

          <Card
            title="Buyer & Consignee"
            action={
              <button type="button" onClick={() => setBuyerDifferent((v) => !v)} className="text-[11px] font-bold text-rsl-red hover:underline">
                {buyerDifferent ? "Use client details" : "Buyer is different from client"}
              </button>
            }
          >
            {buyerDifferent && (
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <FormField label="Buyer Name"><Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} /></FormField>
                <FormField label="Buyer GSTIN">
                  <Input
                    value={buyerGstin}
                    onChange={(e) => {
                      const v = e.target.value.toUpperCase();
                      setBuyerGstin(v);
                      const s = stateFromGstin(v);
                      if (s) setBuyerState(s);
                    }}
                  />
                </FormField>
                <FormField label="Buyer Contact"><Input value={buyerContact} onChange={(e) => setBuyerContact(e.target.value)} /></FormField>
                <FormField label="Buyer Address" className="sm:col-span-2">
                  <Input value={buyerAddress} onChange={(e) => setBuyerAddress(e.target.value)} />
                </FormField>
              </div>
            )}
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2 mt-1">
              <FormField label="Buyer State" hint="Filled from the GSTIN — edit if needed">
                <Input value={buyerState} onChange={(e) => setBuyerState(e.target.value)} />
              </FormField>
              <FormField label="Consignee State" hint="Filled from the GSTIN — edit if needed">
                <Input value={consigneeState} onChange={(e) => setConsigneeState(e.target.value)} />
              </FormField>
            </div>
          </Card>

          <Card title="Attachment">
            <FileUploadField value={externalFileUrl} onChange={setExternalFileUrl} />
          </Card>
        </div>

        <div className="hidden lg:block">
          <div className="rounded-card bg-rsl-bg-soft border border-rsl-border p-4 sticky top-4">
            <p className="mb-1 text-section-label uppercase text-rsl-muted">Finalize</p>
            <p className="text-page-title-lg text-ink">{formatINR(figures.grandTotal)}</p>
            <p className="mb-3 text-meta text-rsl-muted">
              Generates the legal GST invoice, marks this bill Invoiced and the order Billed. It can&apos;t be edited afterwards.
            </p>
            <Button variant="black" size="block" loading={mutation.isPending} onClick={() => setConfirmOpen(true)}>
              Generate Invoice
            </Button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-rsl-border bg-surface p-3 lg:hidden">
        <Button variant="black" size="block" loading={mutation.isPending} onClick={() => setConfirmOpen(true)}>
          Generate Invoice · {formatINR(figures.grandTotal)}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Generate this invoice?"
        description={`A ${gstType === GstType.IGST ? "IGST" : "CGST + SGST"} invoice for ${formatINR(figures.grandTotal)} to ${
          client ? fullName(client) : "the client"
        }. A GST invoice can't be edited once issued.`}
        confirmLabel="Generate Invoice"
        destructive={false}
        loading={mutation.isPending}
        onConfirm={() => mutation.mutate()}
      />
    </div>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-rsl-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-section-label uppercase text-rsl-muted">{title}</p>
        {action}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-2 last:border-0">
      <span className="text-field-label uppercase text-rsl-muted">{label}</span>
      <span className="text-right text-body text-ink">{value}</span>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-field bg-rsl-bg-soft p-3">
      <p className="text-field-label uppercase text-rsl-muted">{label}</p>
      <p className="text-body font-semibold text-ink">{value}</p>
    </div>
  );
}
