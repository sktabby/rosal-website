import { RosalMark } from "./Logo";

export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-rsl-border bg-surface py-14 px-6 text-center">
      <RosalMark size={56} className="mb-3 opacity-[0.18]" />
      <p className="text-body-md font-bold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-xs text-meta text-rsl-muted">{description}</p>}
    </div>
  );
}
