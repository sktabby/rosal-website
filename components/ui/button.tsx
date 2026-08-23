import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-field text-btn transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        red: "bg-rsl-red text-white hover:bg-rsl-red-dark",
        black: "bg-rsl-black text-white hover:bg-black",
        amber: "bg-rsl-amber text-rsl-black hover:brightness-95",
        outline: "bg-white text-rsl-black border-[1.6px] border-rsl-black hover:bg-rsl-bg",
        "outline-red": "bg-white text-rsl-red border-[1.6px] border-rsl-red hover:bg-red-50",
        ghost: "bg-transparent text-rsl-black hover:bg-rsl-bg",
        link: "bg-transparent text-rsl-red underline-offset-4 hover:underline p-0",
      },
      size: {
        default: "min-h-[44px] px-[18px] py-[11px]",
        sm: "min-h-[38px] px-3 py-2 text-[11.5px]",
        icon: "h-11 w-11",
        block: "min-h-[44px] w-full px-[18px] py-[11px]",
      },
    },
    defaultVariants: { variant: "red", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
