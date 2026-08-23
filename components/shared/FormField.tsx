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
