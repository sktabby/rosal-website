"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  ClipboardList,
  Factory,
  History,
  Package,
  Truck,
  UserPlus,
  Users,
} from "lucide-react";
import SearchBar from "@/components/shared/SearchBar";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import { RosalMark } from "@/components/shared/Logo";
import { useSession } from "@/providers/SessionProvider";
import { cn } from "@/lib/utils";
import { globalSearch, type SearchResult } from "@/lib/api/search";

const ACTIONS = [
  {
    href: "/admin/users/new",
    label: "Create User",
    description: "Add a portal user and assign their role",
    icon: UserPlus,
    tile: "bg-rsl-black text-white",
  },
  {
    href: "/admin/clients/new",
    label: "Create Client",
    description: "Register a buyer with GST and billing details",
    icon: Users,
    tile: "bg-rsl-red text-white",
  },
  {
    href: "/admin/products/new",
    label: "Create Product",
    description: "Add an item with HSN, rate and GST slab",
    icon: Package,
    tile: "bg-rsl-amber text-rsl-black",
  },
  {
    href: "/admin/transport/new",
    label: "Create Transport",
    description: "Add a transporter or an own-vehicle entry",
    icon: Truck,
    tile: "bg-rsl-orange text-white",
  },
  {
    href: "/admin/factory-units/new",
    label: "Factory Unit",
    description: "Set up a dispatch unit and its address",
    icon: Factory,
    tile: "bg-rsl-black text-white",
  },
];

const SHORTCUTS = [
  { href: "/admin/management", label: "Management", icon: ClipboardList },
  { href: "/admin/history", label: "History", icon: History },
];

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-[32px] shrink-0 rounded-full px-3 text-[11px] font-bold transition-colors",
        active
          ? "bg-rsl-black text-white"
          : "border border-rsl-border bg-white text-rsl-black hover:border-rsl-black/40"
      )}
    >
      {label}
    </button>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function AdminHomePage() {
  const [q, setQ] = useState("");
  const { user } = useSession();
  const [entityFilter, setEntityFilter] = useState<string>("all");

  const { data, isFetching } = useQuery({
    queryKey: ["search", q],
    queryFn: () => globalSearch(q),
    enabled: q.length > 1,
  });

  const results: SearchResult[] = Array.isArray(data) ? data : data?.items ?? [];
  const entityTypes = Array.from(new Set(results.map((r) => r.entityType)));
  const filteredResults =
    entityFilter === "all" ? results : results.filter((r) => r.entityType === entityFilter);

  const columns: DataTableColumn<SearchResult>[] = [
    { key: "label", header: "Name", render: (r) => r.label, primary: true },
    { key: "entityType", header: "Entity", render: (r) => r.entityType },
    { key: "meta", header: "Details", render: (r) => r.meta ?? "—" },
  ];

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-card bg-gradient-to-br from-rsl-black via-[#2a0a0c] to-[#5c1114] px-5 py-6 sm:px-7 sm:py-7">
        <RosalMark
          size={230}
          className="pointer-events-none absolute -right-14 top-1/2 -translate-y-1/2 select-none opacity-[0.06] sm:-right-8"
        />
        <div className="relative max-w-md sm:max-w-xl">
          <p className="text-section-label uppercase text-white/45">Admin Portal</p>
          <h2 className="mt-1.5 text-[19px] font-bold leading-tight text-white sm:text-[23px]">
            {greeting()}
            {user?.firstName ? `, ${user.firstName}` : ""}
          </h2>
          <p className="mt-1.5 text-body-md text-white/65">
            Rosal Safety Private Limited — Order Management System
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {SHORTCUTS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-white/20 px-3.5 text-[11.5px] font-bold text-white/90 transition-colors hover:border-white/40 hover:bg-white/10"
              >
                <s.icon className="h-[15px] w-[15px]" />
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h3 className="mb-2.5 text-section-label uppercase text-rsl-muted">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group flex items-center gap-3.5 rounded-card border border-rsl-border bg-white p-3.5 shadow-card transition-all hover:-translate-y-0.5 hover:border-rsl-red/40 hover:shadow-pop focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rsl-red"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] ${a.tile}`}
              >
                <a.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body-md font-bold text-rsl-black">
                  {a.label}
                </span>
                <span className="mt-0.5 block text-meta leading-snug text-rsl-muted">
                  {a.description}
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-rsl-muted/50 transition-colors group-hover:text-rsl-red" />
            </Link>
          ))}
        </div>
      </section>

      {/* Global search */}
      <section>
        <h3 className="mb-2.5 text-section-label uppercase text-rsl-muted">Global Search</h3>
        <div className="rounded-card border border-rsl-border bg-white p-3.5 shadow-card sm:p-4">
          <SearchBar
            value={q}
            onChange={(value) => {
              setQ(value);
              setEntityFilter("all");
            }}
            placeholder="Search users, clients, products, transport, factory units..."
          />
          <div className="mt-3.5">
            {q.length > 1 ? (
              <>
                {entityTypes.length > 1 && (
                  <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                    <FilterChip
                      label={`All (${results.length})`}
                      active={entityFilter === "all"}
                      onClick={() => setEntityFilter("all")}
                    />
                    {entityTypes.map((type) => (
                      <FilterChip
                        key={type}
                        label={`${type} (${results.filter((r) => r.entityType === type).length})`}
                        active={entityFilter === type}
                        onClick={() => setEntityFilter(type)}
                      />
                    ))}
                  </div>
                )}
                <DataTable
                  columns={columns}
                  rows={filteredResults}
                  rowKey={(r) => `${r.entityType}-${r.id}`}
                  loading={isFetching}
                  emptyTitle="No matches"
                  emptyDescription="Try a different search term."
                  page={1}
                  pageSize={filteredResults.length || 1}
                  total={filteredResults.length}
                  onPageChange={() => {}}
                />
              </>
            ) : (
              <p className="py-3 text-meta text-rsl-muted">
                Start typing above to search across users, clients, products, transport and
                factory units.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
