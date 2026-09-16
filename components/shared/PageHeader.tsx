import BackButton from "./BackButton";

export default function PageHeader({
  title,
  description,
  actions,
  backHref,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  /** Renders a Back control above the title, for creation and detail pages. */
  backHref?: string;
}) {
  return (
    <div className="mb-5">
      {backHref && <BackButton fallbackHref={backHref} />}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-page-title-lg text-rsl-black">{title}</h2>
          {description && <p className="mt-1 text-body-md text-rsl-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
