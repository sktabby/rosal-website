"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchableOption {
  value: string;
  label: string;
  meta?: string;
}

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Filter...",
  error,
  emptyText = "No matches",
}: {
  value: string;
  onChange: (value: string) => void;
  options: SearchableOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  error?: boolean;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) =>
    `${o.label} ${o.meta ?? ""}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full min-h-[44px] items-center justify-between rounded-field border-[1.4px] bg-white px-3 py-[11px] text-left text-body",
          error ? "border-rsl-red" : "border-rsl-border",
          "focus:border-rsl-red focus:outline-none"
        )}
      >
        <span className={selected ? "text-rsl-black" : "text-[#aaaaaa]"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-rsl-muted" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-field border border-rsl-border bg-white shadow-pop">
          <div className="relative border-b border-rsl-border p-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-rsl-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-[6px] bg-rsl-bg py-2 pl-7 pr-2 text-body focus:outline-none"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 && <p className="px-3 py-3 text-meta text-rsl-muted">{emptyText}</p>}
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  setQuery("");
                }}
                className={cn(
                  "block w-full rounded-[6px] px-3 py-2 text-left text-body hover:bg-rsl-bg",
                  o.value === value && "bg-rsl-bg font-bold"
                )}
              >
                {o.label}
                {o.meta && <span className="ml-1 text-meta text-rsl-muted">{o.meta}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
