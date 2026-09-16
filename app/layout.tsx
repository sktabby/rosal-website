import type { Metadata, Viewport } from "next";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import QueryProvider from "@/providers/QueryProvider";
import SessionProvider from "@/providers/SessionProvider";
import SocketProvider from "@/providers/SocketProvider";
import ThemeProvider, { THEME_INIT_SCRIPT } from "@/providers/ThemeProvider";
import { ThemedToaster } from "@/components/shared/ThemeToggle";

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
    // The init script adds `dark` to <html> before React hydrates, so the
    // server-rendered class list legitimately differs from the client's.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans antialiased">
        <NextTopLoader color="#D42027" height={3} showSpinner={false} />
        <ThemeProvider>
          <QueryProvider>
            <SessionProvider>
              <SocketProvider>{children}</SocketProvider>
            </SessionProvider>
          </QueryProvider>
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
