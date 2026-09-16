"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import InvoicePdfLink from "@/components/shared/InvoicePdfLink";
import { listInvoices } from "@/lib/api/invoices";
import type { Invoice } from "@/lib/types";
import { formatDate, formatINR, num } from "@/lib/utils";

export default function AccountsHistoryPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", "history", search, page],
    queryFn: () => listInvoices({ search, page }),
  });

  const columns: DataTableColumn<Invoice>[] = [
    { key: "billId", header: "Bill No.", render: (r) => r.billId.slice(0, 8).toUpperCase(), primary: true },
    {
      key: "client",
      header: "Client",
      render: (r) => (r.bill?.client ? `${r.bill.client.firstName} ${r.bill.client.lastName}` : "—"),
    },
    { key: "invoiceNumber", header: "Invoice No.", render: (r) => r.invoiceNumber ?? r.id.slice(0, 8).toUpperCase() },
    { key: "date", header: "Date", render: (r) => formatDate(r.createdAt) },
    { key: "amount", header: "Amount", render: (r) => formatINR(r.grandTotal ?? num(r.taxableValue)), align: "right" },
    {
      key: "files",
      header: "Files",
      render: (r) => (
        <div className="flex items-center gap-3">
          <InvoicePdfLink invoiceId={r.id} />
          {r.externalFileUrl && (
            <a
              href={r.externalFileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-ink hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" /> External
            </a>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Accounts History" />
      <SearchBar value={search} onChange={setSearch} placeholder="Search invoices..." className="mb-4" />

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(r) => r.id}
        loading={isLoading}
        emptyTitle="No invoices yet"
        emptyDescription="Generated invoices will appear here."
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? 10}
        total={data?.total ?? 0}
        onPageChange={setPage}
      />
    </div>
  );
}
