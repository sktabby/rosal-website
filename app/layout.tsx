import type { Metadata, Viewport } from "next";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import QueryProvider from "@/providers/QueryProvider";
import SessionProvider from "@/providers/SessionProvider";
import SocketProvider from "@/providers/SocketProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Rosal Safety — Order Management",
  description: "Internal order management portal for Rosal Safety Private Limited",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#141414",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <NextTopLoader color="#D42027" height={3} showSpinner={false} />
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
