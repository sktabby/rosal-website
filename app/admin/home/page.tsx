"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, Users, Package, Truck, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/shared/SearchBar";
import PageHeader from "@/components/shared/PageHeader";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import { globalSearch, type SearchResult } from "@/lib/api/search";

const ACTIONS = [
  { href: "/admin/users/new", label: "Create User", icon: UserPlus, variant: "black" as const },
  { href: "/admin/clients/new", label: "Create Client", icon: Users, variant: "red" as const },
  { href: "/admin/products/new", label: "Create Product", icon: Package, variant: "amber" as const },
  { href: "/admin/transport/new", label: "Create Transport", icon: Truck, variant: "outline" as const },
  { href: "/admin/factory-units/new", label: "Factory Unit", icon: Factory, variant: "outline" as const },
];

export default function AdminHomePage() {
  const [q, setQ] = useState("");

  const { data, isFetching } = useQuery({
    queryKey: ["search", q],
    queryFn: () => globalSearch(q),
    enabled: q.length > 1,
  });

  const results: SearchResult[] = Array.isArray(data) ? data : data?.items ?? [];

  const columns: DataTableColumn<SearchResult>[] = [
    { key: "label", header: "Name", render: (r) => r.label, primary: true },
    { key: "entityType", header: "Entity", render: (r) => r.entityType },
    { key: "meta", header: "Details", render: (r) => r.meta ?? "—" },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Rosal Safety Private Limited — Order Management System" />

      <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-row lg:flex-wrap">
        {ACTIONS.map((a) => (
          <Link key={a.href} href={a.href} className="lg:inline-block">
            <Button variant={a.variant} className="w-full lg:w-auto">
              <a.icon className="h-4 w-4" />
              {a.label}
            </Button>
          </Link>
        ))}
      </div>

      <SearchBar
        value={q}
        onChange={setQ}
        placeholder="Search users, clients, products, transport, factory units..."
        className="mb-4"
      />

      {q.length > 1 ? (
        <DataTable
          columns={columns}
          rows={results}
          rowKey={(r) => `${r.entityType}-${r.id}`}
          loading={isFetching}
          emptyTitle="No matches"
          emptyDescription="Try a different search term."
          page={1}
          pageSize={results.length || 1}
          total={results.length}
          onPageChange={() => {}}
        />
      ) : (
        <p className="text-meta text-rsl-muted">Start typing above to search across the system.</p>
      )}
    </div>
  );
}
