"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/shared/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import EmptyState from "@/components/shared/EmptyState";
import OrderCard from "@/components/shared/OrderCard";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/components/shared/Pagination";
import { listOrders } from "@/lib/api/orders";

export default function DispatcherHistoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // "history" scope -> archived=true, per the confirmed final param name.
  const { data, isLoading } = useQuery({
    queryKey: ["orders", "history", search, page],
    queryFn: () => listOrders({ scope: "history", search, page }),
  });

  return (
    <div>
      <PageHeader title="Order History" description="Dispatched orders older than 48h, plus all rejected orders." />
      <SearchBar value={search} onChange={setSearch} placeholder="Client name / date..." className="mb-4" />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : data?.items.length ? (
        <>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((o) => (
              <OrderCard key={o.id} order={o} onClick={() => router.push(`/dispatcher/orders/${o.id}`)} />
            ))}
          </div>
          <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState title="No history yet" description="Dispatched and rejected orders will appear here." />
      )}
    </div>
  );
}
