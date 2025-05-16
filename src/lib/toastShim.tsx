
import { toast as sonnerToast, useToast as sonnerUseToast } from "sonner";
import React, { ReactNode } from "react";

type LegacyOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | string;
  duration?: number;            // ms
};

/** Drop-in replacement for the old object API */
export function toast(opts: LegacyOptions) {
  const { title, description, variant, duration } = opts;

  // single-line helper
  if (!description) {
    return variant === "destructive"
      ? sonnerToast.error(title, { duration })
      : sonnerToast.success(title, { duration });
  }

  // two-line custom toast (note the callback)
  return sonnerToast.custom(() => (
    <div className="flex flex-col gap-1">
      <span className="font-medium">{title}</span>
      <span className="text-sm text-muted-foreground">{description}</span>
    </div>
  ), {
    duration,
    className: variant === "destructive" ? "bg-destructive text-white" : "",
  });
}

/** keep the original hook available */
export const useToast = sonnerUseToast;
