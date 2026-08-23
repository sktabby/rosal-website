import { Flame } from "lucide-react";

export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-rsl-border bg-white py-14 px-6 text-center">
      <Flame className="h-12 w-12 text-rsl-black/10 mb-3" strokeWidth={1.5} />
      <p className="text-body-md font-bold text-rsl-black">{title}</p>
      {description && <p className="mt-1 max-w-xs text-meta text-rsl-muted">{description}</p>}
    </div>
  );
}
