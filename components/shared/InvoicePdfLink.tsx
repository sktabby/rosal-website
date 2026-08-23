"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { getToken } from "@/lib/session";
import { getInvoicePdfUrl } from "@/lib/api/invoices";
import { toast } from "sonner";

/**
 * PDF generation is a confirmed backend stub today (GET /invoices/:id/pdf
 * returns 400 until the template is wired). This shows a clear
 * "not available yet" state instead of a broken link or a raw error, and
 * upgrades to a real download the moment the backend ships it — no code
 * change needed here when that happens.
 */
export default function InvoicePdfLink({ invoiceId }: { invoiceId: string }) {
  const [checking, setChecking] = useState(false);

  async function handleClick() {
    setChecking(true);
    try {
      const res = await fetch(getInvoicePdfUrl(invoiceId), {
        headers: { Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) {
        toast("PDF generation isn't available yet — check back once it's live on the backend.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      toast("PDF generation isn't available yet — check back once it's live on the backend.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={checking}
      className="inline-flex items-center gap-1 text-rsl-red hover:underline text-body disabled:opacity-60"
    >
      {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
      PDF
    </button>
  );
}
