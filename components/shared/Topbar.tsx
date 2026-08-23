"use client";

import { Menu } from "lucide-react";
import { initials } from "@/lib/utils";
import { useSession } from "@/providers/SessionProvider";

export default function Topbar({
  title,
  onOpenMobileMenu,
  contextPill,
}: {
  title: string;
  onOpenMobileMenu: () => void;
  contextPill?: string;
}) {
  const { user } = useSession();

  return (
    <header className="sticky top-0 z-30 flex h-[52px] lg:h-[58px] items-center justify-between border-b border-rsl-border bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden md:hidden -ml-1 flex h-9 w-9 items-center justify-center rounded-field text-rsl-black hover:bg-rsl-bg"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="truncate text-page-title lg:text-page-title-lg text-rsl-black">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {contextPill && (
          <span className="hidden md:inline-flex items-center rounded-full bg-rsl-bg px-3 py-1.5 text-[10.5px] font-bold text-rsl-muted">
            {contextPill}
          </span>
        )}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rsl-black text-[11px] font-bold text-white">
          {initials(user ? { firstName: user.firstName, lastName: user.lastName } : null)}
        </div>
      </div>
    </header>
  );
}
