import {
  LayoutDashboard,
  UserPlus,
  Users,
  Package,
  Truck,
  Factory,
  ClipboardList,
  History,
  Settings,
  UserCircle,
  KanbanSquare,
  Inbox,
  FileText,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin/home", label: "Home", icon: LayoutDashboard },
  { href: "/admin/users/new", label: "User Creation", icon: UserPlus },
  { href: "/admin/clients/new", label: "Client Creation", icon: Users },
  { href: "/admin/products/new", label: "Product Creation", icon: Package },
  { href: "/admin/transport/new", label: "Transport Creation", icon: Truck },
  { href: "/admin/factory-units/new", label: "Factory Units", icon: Factory },
  { href: "/admin/management", label: "Management", icon: ClipboardList },
  { href: "/admin/history", label: "History", icon: History },
  { href: "/admin/account", label: "Account", icon: UserCircle },
];

export const DISPATCHER_NAV: NavItem[] = [
  { href: "/dispatcher/queue", label: "Order Queue", icon: KanbanSquare },
  { href: "/dispatcher/history", label: "Order History", icon: History },
  { href: "/dispatcher/account", label: "Account", icon: UserCircle },
];

export const ACCOUNTS_NAV: NavItem[] = [
  { href: "/accounts/bills", label: "Bills Inbox", icon: Inbox },
  { href: "/accounts/history", label: "Accounts History", icon: FileText },
  { href: "/accounts/account", label: "Account", icon: UserCircle },
];

export const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin Portal",
  DISPATCHER: "Dispatcher Portal",
  ACCOUNTS: "Accounts Portal",
};

export { Settings };

const EXTRA_TITLES: Array<{ test: RegExp; title: string }> = [
  { test: /^\/admin\/company-settings/, title: "Company Settings" },
  { test: /^\/admin\/users\/new/, title: "User Creation" },
  { test: /^\/admin\/clients\/new/, title: "Client Creation" },
  { test: /^\/admin\/products\/new/, title: "Product Creation" },
  { test: /^\/admin\/transport\/new/, title: "Transport Creation" },
  { test: /^\/admin\/factory-units\/new/, title: "Factory Unit Creation" },
  { test: /^\/dispatcher\/orders\/[^/]+$/, title: "Order Detail" },
  { test: /^\/accounts\/bills\/[^/]+\/invoice$/, title: "Create Invoice" },
];

export function resolvePageTitle(pathname: string, items: NavItem[]): string {
  const extra = EXTRA_TITLES.find((e) => e.test.test(pathname));
  if (extra) return extra.title;
  const match = items.find((item) => pathname.startsWith(item.href));
  return match?.label ?? "Rosal Safety";
}
