"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  sticky = false,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  sticky?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full",
        sticky && "sticky top-[52px] lg:top-0 z-10 bg-rsl-bg pb-2 pt-1 -mt-1",
        className
      )}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rsl-muted" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-field border-[1.4px] border-rsl-border bg-white py-[11px] pl-9 pr-3 text-body text-rsl-black placeholder:text-[#aaaaaa] focus:border-rsl-red focus:outline-none"
      />
    </div>
  );
}
