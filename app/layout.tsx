import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import SessionProvider from "@/providers/SessionProvider";
import SocketProvider from "@/providers/SocketProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Rosal Safety — Order Management",
  description: "Internal order management portal for Rosal Safety Private Limited",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <QueryProvider>
          <SessionProvider>
            <SocketProvider>{children}</SocketProvider>
          </SessionProvider>
        </QueryProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "text-body",
            style: {
              borderRadius: "9px",
              fontSize: "12.5px",
            },
          }}
        />
      </body>
    </html>
  );
}
