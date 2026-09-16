import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Symbol only (flame + R). The wordmark is illegible below ~100px wide, so
 * every small placement uses this. Full-colour art that reads on black,
 * white and red alike, so it needs no per-theme variant.
 */
export function RosalMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo-symbol.png"
      alt="Rosal Safety"
      width={size}
      height={size}
      priority
      className={cn("object-contain", className)}
      style={{ width: size, height: "auto" }}
    />
  );
}

/**
 * Full lockup (symbol + ROSAL SAFETY). `tone` picks the wordmark colour:
 * the supplied artwork is white-on-black, so light grounds need the recoloured
 * variant or the wordmark disappears.
 */
export function RosalLockup({
  width = 220,
  tone = "onDark",
  className,
}: {
  width?: number;
  tone?: "onDark" | "onLight";
  className?: string;
}) {
  return (
    <Image
      src={tone === "onDark" ? "/logo-lockup.png" : "/logo-lockup-dark.png"}
      alt="Rosal Safety"
      width={width}
      height={Math.round(width * 0.985)}
      priority
      className={cn("object-contain", className)}
      style={{ width, height: "auto" }}
    />
  );
}
