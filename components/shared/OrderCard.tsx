"use client";

import { StatusChip } from "@/components/shared/StatusChip";
import { fullName, relativeTime } from "@/lib/utils";
import type { SalesOrder } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function OrderCard({ order, onClick }: { order: SalesOrder; onClick?: () => void }) {
  const clientName = order.proformaInvoice?.client
    ? fullName(order.proformaInvoice.client)
    : "Client";

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-card border border-[#ececec] bg-white p-3.5 shadow-card",
        onClick && "cursor-pointer hover:shadow-pop transition-shadow"
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-body-md font-bold text-rsl-black">{order.orderNumber}</span>
        <StatusChip status={order.status} />
      </div>
      <p className="text-meta text-rsl-muted">{clientName}</p>
      {/* Seller name — shown only if the backend include ever adds it (see
          note on SalesOrder.seller in lib/types.ts); omitted cleanly otherwise. */}
      {order.seller && <p className="text-meta font-bold text-rsl-black">{fullName(order.seller)}</p>}
      {order.status === "DISPATCHED" && order.completedAt && (
        <p className="mt-1 text-meta text-rsl-muted">Dispatched {relativeTime(order.completedAt)}</p>
      )}
    </div>
  );
}
