"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-40 bg-black/40 animate-fadeIn", className)}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

/**
 * Responsive by design (per the plan's §3.7 component spec):
 * - base/md: bottom sheet — fixed to the bottom edge, rounded top corners,
 *   drag-handle affordance, max-height 85vh with internal scroll.
 * - lg+: centered modal, capped width.
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { maxWidthClass?: string }
>(({ className, children, maxWidthClass = "lg:max-w-[520px]", ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 bg-white shadow-sheet outline-none",
        // mobile / tablet: bottom sheet
        "inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-sheet animate-sheet-up",
        "px-5 pt-3 pb-6",
        // desktop: centered modal
        "lg:animate-slide-up lg:inset-x-auto lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2",
        "lg:w-full lg:rounded-card lg:px-6 lg:py-6 lg:max-h-[80vh]",
        maxWidthClass,
        className
      )}
      {...props}
    >
      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-rsl-border lg:hidden" aria-hidden />
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 hidden rounded-full p-1 text-rsl-muted hover:bg-rsl-bg lg:block">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-page-title-lg text-rsl-black", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("text-body-md text-rsl-muted mt-1", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};
