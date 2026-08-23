"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import OrderCard from "@/components/shared/OrderCard";
import EmptyState from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { listOrders } from "@/lib/api/orders";
import { cn } from "@/lib/utils";
import type { SalesOrder } from "@/lib/types";

const COLUMNS = [
  { status: "PENDING", label: "Pending", color: "text-status-pending-fg" },
  { status: "PROCESSING", label: "Processing", color: "text-status-processing-fg" },
  { status: "DISPATCHED", label: "Dispatched", color: "text-status-done-fg" },
] as const;

export default function DispatcherQueuePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [mobileTab, setMobileTab] = useState<(typeof COLUMNS)[number]["status"]>("PENDING");

  const { data, isLoading } = useQuery({
    queryKey: ["orders", "queue", search],
    queryFn: () => listOrders({ scope: "active", search, page: 1 }),
  });

  const grouped = useMemo(() => {
    const items = data?.items ?? [];
    const map: Record<string, SalesOrder[]> = { PENDING: [], PROCESSING: [], DISPATCHED: [] };
    items.forEach((o) => {
      const key = o.status === "PLACED" ? "PENDING" : o.status;
      if (map[key]) map[key].push(o);
    });
    return map;
  }, [data]);

  return (
    <div>
      <PageHeader title="Order Queue" />
      <SearchBar value={search} onChange={setSearch} placeholder="Filter by client name..." className="mb-4" sticky />

      {/* Mobile: tab switcher with live counts */}
      <div className="flex gap-2 overflow-x-auto pb-1 md:hidden mb-3">
        {COLUMNS.map((c) => (
          <button
            key={c.status}
            onClick={() => setMobileTab(c.status)}
            className={cn(
              "shrink-0 rounded-field px-3.5 py-2 text-btn",
              mobileTab === c.status ? "bg-rsl-red text-white" : "bg-white border border-rsl-border text-rsl-black"
            )}
          >
            {c.label} ({grouped[c.status]?.length ?? 0})
          </button>
        ))}
      </div>

      <div className="md:hidden space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : grouped[mobileTab]?.length ? (
          grouped[mobileTab].map((o) => (
            <OrderCard key={o.id} order={o} onClick={() => router.push(`/dispatcher/orders/${o.id}`)} />
          ))
        ) : (
          <EmptyState title={`No ${mobileTab.toLowerCase()} orders`} description="New orders will appear here automatically." />
        )}
      </div>

      {/* Desktop / tablet: 3-column Kanban */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-4">
        {COLUMNS.map((c) => (
          <div key={c.status}>
            <p className={cn("mb-2 text-section-label uppercase", c.color)}>
              {c.label} ({grouped[c.status]?.length ?? 0})
            </p>
            <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
              ) : grouped[c.status]?.length ? (
                grouped[c.status].map((o) => (
                  <OrderCard key={o.id} order={o} onClick={() => router.push(`/dispatcher/orders/${o.id}`)} />
                ))
              ) : (
                <EmptyState title="Nothing here" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
