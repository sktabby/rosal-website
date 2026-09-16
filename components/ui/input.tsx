"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const inputClassName = cn(
      "w-full rounded-field border-[1.4px] bg-surface px-3 py-[11px] text-body text-ink placeholder:text-placeholder transition-colors",
      "focus:border-rsl-red focus:outline-none",
      "disabled:bg-rsl-bg disabled:text-rsl-muted disabled:border-transparent",
      error ? "border-rsl-red" : "border-rsl-border",
      className
    );

    if (type !== "password") {
      return <input ref={ref} type={type} className={inputClassName} {...props} />;
    }

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={cn(inputClassName, "pr-10")}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-rsl-muted transition-colors hover:text-ink"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
