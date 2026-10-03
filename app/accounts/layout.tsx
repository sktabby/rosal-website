"use client";

import { usePathname } from "next/navigation";
import AppShell from "@/components/shared/AppShell";
import { ACCOUNTS_NAV, ROLE_LABEL, resolvePageTitle } from "@/lib/nav";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { getCurrentFinancialYear } from "@/lib/financialYear";
import { Loader2 } from "lucide-react";

export default function AccountsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading, authorized } = useRoleGuard("ACCOUNTS");

  if (loading || !authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-rsl-bg">
        <Loader2 className="h-6 w-6 animate-spin text-rsl-red" />
      </div>
    );
  }

  return (
    <AppShell
      navItems={ACCOUNTS_NAV}
      roleLabel={ROLE_LABEL.ACCOUNTS}
      pageTitle={resolvePageTitle(pathname, ACCOUNTS_NAV)}
      contextPill={`RSPL / ${getCurrentFinancialYear()}`}
    >
      {children}
    </AppShell>
  );
}
