"use client";

import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";
import UsersTab from "./tabs/UsersTab";
import ClientsTab from "./tabs/ClientsTab";
import ProductsTab from "./tabs/ProductsTab";
import TransportTab from "./tabs/TransportTab";
import FactoryUnitsTab from "./tabs/FactoryUnitsTab";

const TABS = [
  { key: "users", label: "Users" },
  { key: "clients", label: "Clients" },
  { key: "products", label: "Products" },
  { key: "transport", label: "Transport" },
  { key: "factory-units", label: "Factory Units" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ManagementPage() {
  const [tab, setTab] = useState<TabKey>("users");

  return (
    <div>
      <PageHeader title="Management" description="Live CRUD surface for master data. Soft delete only — no reactivate." />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "shrink-0 rounded-field px-4 py-2 text-btn transition-colors",
              tab === t.key ? "bg-rsl-black text-white" : "bg-white text-rsl-black border border-rsl-border hover:bg-rsl-bg"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "users" && <UsersTab />}
      {tab === "clients" && <ClientsTab />}
      {tab === "products" && <ProductsTab />}
      {tab === "transport" && <TransportTab />}
      {tab === "factory-units" && <FactoryUnitsTab />}
    </div>
  );
}
