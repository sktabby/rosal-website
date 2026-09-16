"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AppShell from "@/components/shared/AppShell";
import { ACCOUNTS_NAV, ROLE_LABEL, resolvePageTitle } from "@/lib/nav";
import { useSession } from "@/providers/SessionProvider";
import { Loader2 } from "lucide-react";

export default function AccountsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useSession();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
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
      contextPill="RSPL / FY 26-27"
    >
      {children}
    </AppShell>
  );
}
