"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { useTheme, type ThemePreference } from "@/providers/ThemeProvider";

/** Compact top-bar control: flips between light and dark. */
export function ThemeToggleButton({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full text-rsl-muted transition-colors hover:bg-rsl-bg hover:text-ink",
        className
      )}
    >
      {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/** Full three-way picker for the Account page. */
export function ThemeSegmented() {
  const { theme, setTheme } = useTheme();

  return (
    <div role="radiogroup" aria-label="Appearance" className="grid grid-cols-3 gap-1 rounded-field bg-rsl-bg p-1">
      {OPTIONS.map((o) => {
        const active = theme === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(o.value)}
            className={cn(
              "flex min-h-[38px] items-center justify-center gap-1.5 rounded-[7px] text-[12px] font-bold transition-colors",
              active
                ? "bg-surface text-ink shadow-card ring-1 ring-rsl-border"
                : "text-rsl-muted hover:text-ink"
            )}
          >
            <o.icon className="h-4 w-4" />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Sonner's toasts ship their own light/dark styles; follow the app's theme. */
export function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme}
      position="bottom-right"
      toastOptions={{
        className: "text-body",
        style: { borderRadius: "9px", fontSize: "12.5px" },
      }}
    />
  );
}
