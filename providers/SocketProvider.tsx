"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSocket } from "@/lib/socket";
import { useSession } from "./SessionProvider";

/**
 * Mounted once in the authenticated layout. Listens for the confirmed
 * socket events and invalidates the relevant React Query cache keys instead
 * of forcing a full page refetch, so Kanban/List screens update live.
 */
export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { user } = useSession();

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;

    const invalidateOrders = () => queryClient.invalidateQueries({ queryKey: ["orders"] });
    const invalidateBills = () => queryClient.invalidateQueries({ queryKey: ["bills"] });

    const onCreated = () => {
      invalidateOrders();
      if (user.role === "DISPATCHER") toast("New order received");
    };
    const onAccepted = () => invalidateOrders();
    const onCompleted = () => {
      invalidateOrders();
      if (user.role === "SELLER") toast("Order dispatched — ready to bill");
    };
    const onRejected = () => {
      invalidateOrders();
      if (user.role === "SELLER") toast.error("An order was rejected by the dispatcher");
    };
    const onCancelled = () => invalidateOrders();
    const onBillCreated = () => {
      invalidateBills();
      if (user.role === "ACCOUNTS") toast("New bill received in the inbox");
    };

    socket.on("order:created", onCreated);
    socket.on("order:accepted", onAccepted);
    socket.on("order:completed", onCompleted);
    socket.on("order:rejected", onRejected);
    socket.on("order:cancelled", onCancelled);
    socket.on("bill:created", onBillCreated);

    return () => {
      socket.off("order:created", onCreated);
      socket.off("order:accepted", onAccepted);
      socket.off("order:completed", onCompleted);
      socket.off("order:rejected", onRejected);
      socket.off("order:cancelled", onCancelled);
      socket.off("bill:created", onBillCreated);
    };
  }, [user, queryClient]);

  return <>{children}</>;
}
