"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Mirrors the Android app's PageBackButton — it sits above the page title
 * rather than inside the header bar.
 *
 * Prefers real history so "back" returns wherever the user actually came from
 * (these pages are reachable from both Home and Management). `fallbackHref`
 * covers the direct-link and hard-refresh cases, where there is no in-app
 * history to pop.
 */
export default function BackButton({
  fallbackHref,
  label = "Back",
  className,
}: {
  fallbackHref: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
      className={cn(
        "-ml-1 mb-2 inline-flex min-h-[36px] items-center gap-1.5 rounded-field px-1 text-body-md text-rsl-muted transition-colors hover:text-ink",
        className
      )}
    >
      <ArrowLeft className="h-[18px] w-[18px] text-ink" />
      {label}
    </button>
  );
}
