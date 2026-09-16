"use client";

import { useState } from "react";
import { Factory, Package, Truck, UserCircle, Users } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";
import UsersTab from "./tabs/UsersTab";
import ClientsTab from "./tabs/ClientsTab";
import ProductsTab from "./tabs/ProductsTab";
import TransportTab from "./tabs/TransportTab";
import FactoryUnitsTab from "./tabs/FactoryUnitsTab";

const TABS = [
  { key: "users", label: "Users", icon: UserCircle },
  { key: "clients", label: "Clients", icon: Users },
  { key: "products", label: "Products", icon: Package },
  { key: "transport", label: "Transport", icon: Truck },
  { key: "factory-units", label: "Factory Units", icon: Factory },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ManagementPage() {
  const [tab, setTab] = useState<TabKey>("users");

  return (
    <div>
      <PageHeader
        title="Management"
        description="Live directory of everything in the system — edit or soft-delete any record. There is no undo, so double-check before deleting."
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-btn transition-colors",
              tab === t.key
                ? "bg-rsl-black text-white"
                : "border border-rsl-border bg-white text-rsl-black hover:border-rsl-black/40"
            )}
          >
            <t.icon className="h-4 w-4" />
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
