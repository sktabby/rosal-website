import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Every form field on every page renders through this wrapper, so label
 * style, spacing, error display, and hint text are pixel-identical
 * everywhere instead of being hand-matched page by page.
 */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("mb-3", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-rsl-red ml-0.5">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="mt-1 text-[11px] text-rsl-red">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-rsl-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/**
 * Groups related fields inside a form card. Long creation forms read as one
 * undifferentiated wall of inputs without these breaks.
 */
export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-t border-rsl-border pt-5 first:border-t-0 first:pt-0", className)}>
      <h3 className="text-section-label uppercase text-rsl-black">{title}</h3>
      {description && <p className="mt-1 text-meta text-rsl-muted">{description}</p>}
      <div className="mt-3.5">{children}</div>
    </section>
  );
}
