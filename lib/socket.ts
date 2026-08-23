"use client";

import { io, type Socket } from "socket.io-client";
import { getToken } from "./session";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";

let socket: Socket | null = null;

/**
 * One connection per session. Room membership (factoryUnit:{id}, user:{id},
 * accounts) is automatic server-side based on the JWT — no client-side join
 * needed for those default rooms. Order Detail pages additionally emit
 * "order:subscribe" with an orderId to get live updates on that one order,
 * and the server verifies ownership/assignment before joining that room.
 */
export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;
  const token = getToken();
  if (!token) return null;

  if (!socket) {
    socket = io(`${SOCKET_URL}/realtime`, {
      auth: { token },
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export type OrderSocketEvent =
  | "order:created"
  | "order:accepted"
  | "order:completed"
  | "order:rejected"
  | "order:cancelled"
  | "bill:created";

export interface OrderEventPayload {
  orderId: string;
  orderNumber?: string;
  clientName?: string;
  status?: string;
}

export interface BillEventPayload {
  billId: string;
  orderId: string;
  clientName?: string;
  amount?: string | number;
}
