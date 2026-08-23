"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/nav";

interface SidebarProps {
  items: NavItem[];
  roleLabel: string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

function LogoBlock({ collapsed, roleLabel }: { collapsed: boolean; roleLabel: string }) {
  return (
    <div className={cn("flex items-center gap-2.5 px-4 py-4", collapsed && "justify-center px-2")}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-rsl-red">
        <Flame className="h-4.5 w-4.5 text-white" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold tracking-wide text-white">ROSAL SAFETY</p>
          <p className="truncate text-[10px] text-[#999999]">{roleLabel}</p>
        </div>
      )}
    </div>
  );
}

function NavList({
  items,
  collapsed,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  collapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1 px-2">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[11.5px] font-bold transition-colors",
              collapsed && "justify-center px-0",
              active ? "bg-rsl-red text-white" : "text-[#bbbbbb] hover:bg-white/5 hover:text-white"
            )}
            title={collapsed ? item.label : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
            {active && !collapsed && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar({
  items,
  roleLabel,
  mobileOpen,
  onCloseMobile,
  collapsed,
  onToggleCollapsed,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop / tablet fixed sidebar */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col bg-rsl-black shrink-0 transition-[width] duration-200",
          collapsed ? "lg:w-[64px]" : "lg:w-[220px]"
        )}
      >
        <LogoBlock collapsed={collapsed} roleLabel={roleLabel} />
        <div className="flex-1 overflow-y-auto py-2">
          <NavList items={items} collapsed={collapsed} pathname={pathname} />
        </div>
        <button
          onClick={onToggleCollapsed}
          className="flex items-center justify-center gap-2 border-t border-white/10 py-3 text-[#999999] hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </aside>

      {/* Tablet icon rail (md only) */}
      <aside className="hidden md:flex lg:hidden md:flex-col md:w-[64px] bg-rsl-black shrink-0">
        <LogoBlock collapsed roleLabel={roleLabel} />
        <div className="flex-1 overflow-y-auto py-2">
          <NavList items={items} collapsed pathname={pathname} />
        </div>
      </aside>

      {/* Mobile off-canvas drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 animate-fadeIn"
            onClick={onCloseMobile}
          />
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-[300px] bg-rsl-black shadow-sheet flex flex-col animate-slideIn">
            <div className="flex items-center justify-between px-4 py-4">
              <LogoBlock collapsed={false} roleLabel={roleLabel} />
              <button onClick={onCloseMobile} className="mr-3 text-[#999999] hover:text-white" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              <NavList items={items} collapsed={false} pathname={pathname} onNavigate={onCloseMobile} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
