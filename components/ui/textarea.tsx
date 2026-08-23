import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full min-h-[88px] rounded-field border-[1.4px] bg-white px-3 py-[11px] text-body text-rsl-black placeholder:text-[#aaaaaa] transition-colors",
        "focus:border-rsl-red focus:outline-none",
        "disabled:bg-rsl-bg disabled:text-rsl-muted disabled:border-transparent",
        error ? "border-rsl-red" : "border-rsl-border",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
