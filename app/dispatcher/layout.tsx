"use client";

import { usePathname } from "next/navigation";
import AppShell from "@/components/shared/AppShell";
import { DISPATCHER_NAV, ROLE_LABEL, resolvePageTitle } from "@/lib/nav";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { Loader2 } from "lucide-react";

export default function DispatcherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, authorized } = useRoleGuard("DISPATCHER");

  if (loading || !authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-rsl-bg">
        <Loader2 className="h-6 w-6 animate-spin text-rsl-red" />
      </div>
    );
  }

  return (
    <AppShell
      navItems={DISPATCHER_NAV}
      roleLabel={ROLE_LABEL.DISPATCHER}
      pageTitle={resolvePageTitle(pathname, DISPATCHER_NAV)}
      contextPill={user ? `${user.firstName} ${user.lastName}` : undefined}
      tint="dispatcher"
    >
      {children}
    </AppShell>
  );
}
