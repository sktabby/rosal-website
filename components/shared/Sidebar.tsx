"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LogOut, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { useSession } from "@/providers/SessionProvider";
import { RosalMark } from "./Logo";
import type { NavItem } from "@/lib/nav";

interface SidebarProps {
  items: NavItem[];
  roleLabel: string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

function BrandBlock({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  /** Only the desktop rail passes this — tablet is forced-collapsed and mobile has its own close button. */
  onToggleCollapsed?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center px-4 py-4",
        collapsed ? "flex-col gap-2 px-2" : "justify-between"
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <RosalMark size={collapsed ? 28 : 32} className="shrink-0" />
        {!collapsed && (
          <p className="truncate text-[13px] font-bold tracking-[0.06em] text-white">
            ROSAL SAFETY
          </p>
        )}
      </div>
      {onToggleCollapsed && (
        <button
          onClick={onToggleCollapsed}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

function AccountBlock({ collapsed, roleLabel }: { collapsed: boolean; roleLabel: string }) {
  const { user } = useSession();
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Signed in";
  const meta = [user?.role?.toLowerCase(), user?.employeeCode].filter(Boolean).join("  ·  ");

  const avatar = (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rsl-amber to-rsl-orange text-[13px] font-bold text-rsl-black">
      {initials(user ? { firstName: user.firstName, lastName: user.lastName } : null)}
    </div>
  );

  if (collapsed) {
    return (
      <div className="flex justify-center px-2 py-3" title={`${name} — ${roleLabel}`}>
        {avatar}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      {avatar}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-white">{name}</p>
        <p className="truncate text-[10.5px] capitalize text-white/55">{meta || roleLabel}</p>
      </div>
    </div>
  );
}

function NavRow({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex h-[46px] items-center gap-3 rounded-[10px] pr-2 text-[13px] transition-colors",
        collapsed ? "justify-center pl-0 pr-0" : "pl-0",
        active ? "bg-white/[0.07] font-bold text-rsl-amber" : "text-[#dddddd] hover:bg-white/[0.04] hover:text-white"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "ml-0 h-[22px] w-[3px] shrink-0 rounded-[2px]",
          active ? "bg-rsl-amber" : "bg-transparent"
        )}
      />
      <Icon className={cn("h-[18px] w-[18px] shrink-0", collapsed && "mx-auto")} />
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          <ChevronRight className="h-[18px] w-[18px] shrink-0 text-white/20" />
        </>
      )}
    </Link>
  );
}

function PanelDivider() {
  return <div className="h-px w-full bg-white/[0.08]" />;
}

function SidebarBody({
  items,
  roleLabel,
  collapsed,
  pathname,
  onNavigate,
  onToggleCollapsed,
}: {
  items: NavItem[];
  roleLabel: string;
  collapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
  onToggleCollapsed?: () => void;
}) {
  const { logout } = useSession();

  return (
    <>
      <BrandBlock collapsed={collapsed} onToggleCollapsed={onToggleCollapsed} />
      <PanelDivider />
      <AccountBlock collapsed={collapsed} roleLabel={roleLabel} />
      <PanelDivider />

      <div className={cn("flex-1 overflow-y-auto py-3", collapsed ? "px-2" : "px-3")}>
        {!collapsed && (
          <p className="px-2 pb-2 text-section-label uppercase text-white/35">Menu</p>
        )}
        <nav className="flex flex-col gap-0.5">
          {items.map((item) => (
            <NavRow
              key={item.href}
              item={item}
              active={pathname.startsWith(item.href)}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </div>

      <PanelDivider />
      <div className={cn("py-3", collapsed ? "px-2" : "px-3")}>
        <button
          onClick={logout}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "flex h-[46px] w-full items-center gap-3 rounded-[10px] pr-2 text-[13px] text-[#FF8B8B] transition-colors hover:bg-white/[0.04]",
            collapsed && "justify-center pr-0"
          )}
        >
          <span aria-hidden className="h-[22px] w-[3px] shrink-0" />
          <LogOut className={cn("h-[18px] w-[18px] shrink-0", collapsed && "mx-auto")} />
          {!collapsed && <span className="flex-1 text-left">Logout</span>}
        </button>
        {!collapsed && (
          <p className="px-2 pt-2 text-[9.5px] text-white/[0.28]">Rosal Safety OMS · Web</p>
        )}
      </div>
    </>
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
      {/* Desktop sidebar — collapsible to an icon rail */}
      <aside
        className={cn(
          "hidden shrink-0 bg-rsl-black transition-[width] duration-200 lg:flex lg:flex-col",
          collapsed ? "lg:w-[72px]" : "lg:w-[248px]"
        )}
      >
        <SidebarBody
          items={items}
          roleLabel={roleLabel}
          collapsed={collapsed}
          pathname={pathname}
          onToggleCollapsed={onToggleCollapsed}
        />
      </aside>

      {/* Tablet icon rail */}
      <aside className="hidden shrink-0 bg-rsl-black md:flex md:w-[72px] md:flex-col lg:hidden">
        <SidebarBody items={items} roleLabel={roleLabel} collapsed pathname={pathname} />
      </aside>

      {/* Mobile off-canvas drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 animate-fadeIn" onClick={onCloseMobile} />
          <div className="absolute left-0 top-0 flex h-full w-[84%] max-w-[300px] flex-col bg-rsl-black shadow-sheet animate-slideIn">
            <button
              onClick={onCloseMobile}
              className="absolute right-3 top-4 z-10 text-white/55 transition-colors hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarBody
              items={items}
              roleLabel={roleLabel}
              collapsed={false}
              pathname={pathname}
              onNavigate={onCloseMobile}
            />
          </div>
        </div>
      )}
    </>
  );
}
