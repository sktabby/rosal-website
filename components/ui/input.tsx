import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-field border-[1.4px] bg-white px-3 py-[11px] text-body text-rsl-black placeholder:text-[#aaaaaa] transition-colors",
        "focus:border-rsl-red focus:outline-none",
        "disabled:bg-rsl-bg disabled:text-rsl-muted disabled:border-transparent",
        error ? "border-rsl-red" : "border-rsl-border",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
