"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusChip } from "@/components/shared/StatusChip";
import BackButton from "@/components/shared/BackButton";
import { acceptOrder, completeOrder, getOrder, rejectOrder } from "@/lib/api/orders";
import { getSocket } from "@/lib/socket";
import { formatINR, fullName, num } from "@/lib/utils";
import { ApiError } from "@/lib/api/http";
import { toast } from "sonner";

export default function DispatcherOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["orders", "detail", params.id],
    queryFn: () => getOrder(params.id),
  });

  // Live subscription for this specific order per the confirmed socket contract.
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !params.id) return;
    socket.emit("order:subscribe", params.id);
  }, [params.id]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const acceptMutation = useMutation({
    mutationFn: () => acceptOrder(params.id),
    onSuccess: () => {
      toast.success("Order accepted");
      invalidate();
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Couldn't accept order."),
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectOrder(params.id),
    onSuccess: () => {
      toast.success("Order rejected");
      invalidate();
      router.push("/dispatcher/queue");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Couldn't reject order."),
  });

  const completeMutation = useMutation({
    mutationFn: () => completeOrder(params.id),
    onSuccess: () => {
      toast.success("Order marked as dispatched");
      invalidate();
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Couldn't complete order."),
  });

  if (isLoading || !order) {
    return (
      <div className="space-y-3 max-w-2xl">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const client = order.proformaInvoice?.client;
  const lineItems = order.lineItemsSnapshot ?? [];
  const status = order.status === "PLACED" ? "PENDING" : order.status;
  const busy = acceptMutation.isPending || rejectMutation.isPending || completeMutation.isPending;

  return (
    <div className="pb-24 lg:pb-6">
      <BackButton fallbackHref="/dispatcher/queue" />
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-page-title-lg text-rsl-black">{order.orderNumber}</h2>
          <p className="text-meta text-rsl-muted">{client ? fullName(client) : "—"}</p>
        </div>
        <StatusChip status={status} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Field order per v1.1: Client (name only), Ship To, Line Items, Transport at bottom */}
          <div className="rounded-card border border-rsl-border bg-white p-4">
            <Row label="Client" value={client ? fullName(client) : "—"} />
            <Row label="Ship To" value={order.proformaInvoice?.shipToAddress ?? "—"} />
          </div>

          <div className="rounded-card border border-rsl-border bg-white p-4">
            <p className="mb-3 text-section-label uppercase text-rsl-muted">Line Items</p>
            <div className="hidden sm:block">
              <table className="w-full text-body">
                <thead>
                  <tr className="text-left text-[10px] uppercase text-rsl-muted border-b border-[#eee]">
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Brand</th>
                    <th className="pb-2 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((li, i) => (
                    <tr key={i} className="border-b border-[#f2f2f2] last:border-0">
                      <td className="py-2">{li.productName ?? li.productId}</td>
                      <td className="py-2">{li.brand}</td>
                      <td className="py-2 text-right">{num(li.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sm:hidden space-y-2">
              {lineItems.map((li, i) => (
                <div key={i} className="rounded-field bg-rsl-bg-soft p-2.5 text-body">
                  <p className="font-bold">{li.productName ?? li.productId}</p>
                  <div className="flex justify-between text-meta text-rsl-muted mt-1">
                    <span>{li.brand}</span>
                    <span>Qty {num(li.qty)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-card border border-rsl-border bg-white p-4">
            <Row label="Transport" value={order.proformaInvoice?.transport?.name ?? "—"} />
          </div>
        </div>

        {/* Actions sidebar — desktop */}
        <div className="hidden lg:block">
          <div className="rounded-card bg-rsl-bg-soft border border-rsl-border p-4 sticky top-4">
            <p className="mb-3 text-section-label uppercase text-rsl-muted">Dispatcher Actions</p>
            <ActionButtons
              status={status}
              busy={busy}
              onAccept={() => acceptMutation.mutate()}
              onReject={() => rejectMutation.mutate()}
              onComplete={() => completeMutation.mutate()}
            />
          </div>
        </div>
      </div>

      {/* Sticky bottom action bar — mobile/tablet, so Accept/Reject/Complete
          is never lost off-screen while scrolling line items. */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-rsl-border bg-white p-3 lg:hidden">
        <ActionButtons
          status={status}
          busy={busy}
          onAccept={() => acceptMutation.mutate()}
          onReject={() => rejectMutation.mutate()}
          onComplete={() => completeMutation.mutate()}
        />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#f2f2f2] py-2 last:border-0">
      <span className="text-field-label uppercase text-rsl-muted">{label}</span>
      <span className="text-right text-body text-rsl-black">{value}</span>
    </div>
  );
}

function ActionButtons({
  status,
  busy,
  onAccept,
  onReject,
  onComplete,
}: {
  status: string;
  busy: boolean;
  onAccept: () => void;
  onReject: () => void;
  onComplete: () => void;
}) {
  if (status === "PENDING") {
    return (
      <div className="flex gap-2">
        <Button variant="black" size="block" loading={busy} onClick={onAccept}>
          Accept
        </Button>
        <Button variant="outline" size="block" disabled={busy} onClick={onReject}>
          Reject
        </Button>
      </div>
    );
  }
  if (status === "PROCESSING") {
    return (
      <Button variant="red" size="block" loading={busy} onClick={onComplete}>
        Complete
      </Button>
    );
  }
  return <p className="text-center text-meta text-rsl-muted py-2">No actions available for this status.</p>;
}
