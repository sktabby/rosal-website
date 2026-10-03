"use client";

import { useState } from "react";
import { Mail, FileText, MessageCircle, Handshake, LifeBuoy, Users } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LeadTab from "@/components/leads/LeadTab";
import type { DataTableColumn } from "@/components/shared/DataTable";
import type {
  ContactLead,
  QuoteRequest,
  Enquiry,
  DistributorApplication,
  SupportTicketLead,
  Subscriber,
} from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

const TABS = [
  { key: "contact", label: "Contact", icon: Mail },
  { key: "quote", label: "Quotes", icon: FileText },
  { key: "enquiry", label: "Enquiries", icon: MessageCircle },
  { key: "distributor", label: "Distributors", icon: Handshake },
  { key: "support", label: "Support", icon: LifeBuoy },
  { key: "subscriber", label: "Subscribers", icon: Users },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const contactColumns: DataTableColumn<ContactLead>[] = [
  { key: "name", header: "Name", primary: true, render: (r) => r.name },
  { key: "email", header: "Email", render: (r) => r.email },
  { key: "phone", header: "Phone", render: (r) => r.phone },
  { key: "subject", header: "Subject", render: (r) => r.subject },
  { key: "message", header: "Message", render: (r) => <span className="line-clamp-2">{r.message}</span>, className: "max-w-xs" },
  { key: "createdAt", header: "Received", render: (r) => formatDateTime(r.createdAt) },
];

const quoteColumns: DataTableColumn<QuoteRequest>[] = [
  { key: "companyName", header: "Company", primary: true, render: (r) => r.companyName },
  { key: "contactName", header: "Contact", render: (r) => r.contactName },
  { key: "email", header: "Email", render: (r) => r.email },
  { key: "phone", header: "Phone", render: (r) => r.phone },
  { key: "location", header: "Location", render: (r) => `${r.city}, ${r.state}` },
  { key: "applicationType", header: "Application", render: (r) => r.applicationType },
  { key: "products", header: "Products", render: (r) => `${r.products?.length ?? 0} item(s)` },
  { key: "createdAt", header: "Received", render: (r) => formatDateTime(r.createdAt) },
];

const enquiryColumns: DataTableColumn<Enquiry>[] = [
  { key: "name", header: "Name", primary: true, render: (r) => r.name },
  { key: "email", header: "Email", render: (r) => r.email },
  { key: "phone", header: "Phone", render: (r) => r.phone },
  { key: "product", header: "Product", render: (r) => r.productName ?? "—" },
  { key: "message", header: "Message", render: (r) => <span className="line-clamp-2">{r.message}</span>, className: "max-w-xs" },
  { key: "createdAt", header: "Received", render: (r) => formatDateTime(r.createdAt) },
];

const distributorColumns: DataTableColumn<DistributorApplication>[] = [
  { key: "companyName", header: "Company", primary: true, render: (r) => r.companyName },
  { key: "contactName", header: "Contact", render: (r) => r.contactName },
  { key: "email", header: "Email", render: (r) => r.email },
  { key: "phone", header: "Phone", render: (r) => r.phone },
  { key: "location", header: "Location", render: (r) => `${r.city}, ${r.state}, ${r.country}` },
  { key: "gstin", header: "GSTIN", render: (r) => r.gstin },
  { key: "createdAt", header: "Received", render: (r) => formatDateTime(r.createdAt) },
];

const supportColumns: DataTableColumn<SupportTicketLead>[] = [
  { key: "contactName", header: "Contact", primary: true, render: (r) => r.contactName },
  { key: "company", header: "Company", render: (r) => r.company },
  { key: "phone", header: "Phone", render: (r) => r.phone },
  { key: "category", header: "Category", render: (r) => r.category },
  { key: "subject", header: "Subject", render: (r) => r.subject },
  { key: "createdAt", header: "Received", render: (r) => formatDateTime(r.createdAt) },
];

const subscriberColumns: DataTableColumn<Subscriber>[] = [
  { key: "email", header: "Email", primary: true, render: (r) => r.email },
  { key: "createdAt", header: "Subscribed", render: (r) => formatDateTime(r.createdAt) },
];

export default function LeadsPage() {
  const [tab, setTab] = useState<TabKey>("contact");

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Form submissions from the Rosal Safety website — contact messages, quote requests, enquiries, distributor applications, support tickets, and newsletter subscribers."
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-btn transition-colors",
              tab === t.key
                ? "bg-ink text-surface"
                : "border border-rsl-border bg-surface text-ink hover:border-ink/40"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "contact" && (
        <LeadTab type="contact" columns={contactColumns} emptyTitle="No contact messages yet" rowName="Message" />
      )}
      {tab === "quote" && (
        <LeadTab type="quote" columns={quoteColumns} emptyTitle="No quote requests yet" rowName="Quote request" />
      )}
      {tab === "enquiry" && (
        <LeadTab type="enquiry" columns={enquiryColumns} emptyTitle="No enquiries yet" rowName="Enquiry" />
      )}
      {tab === "distributor" && (
        <LeadTab type="distributor" columns={distributorColumns} emptyTitle="No distributor applications yet" rowName="Application" />
      )}
      {tab === "support" && (
        <LeadTab type="support" columns={supportColumns} emptyTitle="No support tickets yet" rowName="Ticket" />
      )}
      {tab === "subscriber" && (
        <LeadTab type="subscriber" columns={subscriberColumns} emptyTitle="No subscribers yet" rowName="Subscriber" />
      )}
    </div>
  );
}
