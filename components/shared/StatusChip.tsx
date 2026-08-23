import { Badge } from "@/components/ui/badge";
import { STATUS_CHIP_STYLES } from "@/lib/enums";
import { cn } from "@/lib/utils";

export function StatusChip({ status, className }: { status: string; className?: string }) {
  const style = STATUS_CHIP_STYLES[status] ?? {
    bg: "bg-status-cancelled-bg",
    fg: "text-status-cancelled-fg",
    label: status,
  };
  return <Badge className={cn(style.bg, style.fg, className)}>{style.label}</Badge>;
}
