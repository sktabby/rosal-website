"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import type { NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

interface AppShellProps {
  navItems: NavItem[];
  roleLabel: string;
  pageTitle: string;
  contextPill?: string;
  /** Dispatcher pages get a subtle red/black wash per the locked theme spec. */
  tint?: "default" | "dispatcher";
  children: React.ReactNode;
}

export default function AppShell({
  navItems,
  roleLabel,
  pageTitle,
  contextPill,
  tint = "default",
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(Cookies.get("rsl_sidebar_collapsed") === "1");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      Cookies.set("rsl_sidebar_collapsed", next ? "1" : "0", { expires: 365 });
      return next;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-rsl-bg">
      <Sidebar
        items={navItems}
        roleLabel={roleLabel}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={pageTitle} onOpenMobileMenu={() => setMobileOpen(true)} contextPill={contextPill} />
        <main
          className={cn(
            "flex-1 overflow-y-auto px-3 py-4 md:px-5 md:py-5 lg:px-6 lg:py-6",
            tint === "dispatcher" && "bg-gradient-to-b from-red-50/40 via-rsl-bg to-rsl-bg"
          )}
        >
          <div className="mx-auto w-full max-w-content">{children}</div>
        </main>
      </div>
    </div>
  );
}
