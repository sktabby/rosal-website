"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { getToken } from "@/lib/session";
import { getInvoicePdfUrl } from "@/lib/api/invoices";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Opens the invoice PDF (rendered by the backend on request) in a new tab.
 * The tab is opened synchronously on click — browsers block window.open once
 * we've awaited the download — and filled in when the PDF arrives; if the tab
 * is blocked anyway, the file is downloaded instead.
 */
export default function InvoicePdfLink({
  invoiceId,
  fileName,
  variant = "link",
  label = "PDF",
}: {
  invoiceId: string;
  fileName?: string;
  variant?: "link" | "button";
  label?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation(); // used inside clickable table rows
    const tab = window.open("", "_blank");
    setLoading(true);
    try {
      const res = await fetch(getInvoicePdfUrl(invoiceId), {
        headers: { Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Request failed (${res.status})`);
      }
      const url = URL.createObjectURL(await res.blob());
      if (tab) {
        tab.location.href = url;
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName ?? "invoice.pdf";
        a.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      tab?.close();
      toast.error(`Couldn't open the invoice PDF: ${err instanceof Error ? err.message : "please try again"}`);
    } finally {
      setLoading(false);
    }
  }

  const icon = loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />;

  if (variant === "button") {
    return (
      <Button variant="outline" onClick={handleClick} disabled={loading} className="gap-1.5">
        {icon}
        {label}
      </Button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1 text-rsl-red hover:underline text-body disabled:opacity-60"
    >
      {icon}
      {label}
    </button>
  );
}
