
import { toast as sonnerToast } from "sonner";
import React from "react";

type LegacyOptions = {
  /** Heading shown in bold */
  title?: string;
  /** Secondary line */
  description?: string;
  /** "default" | "destructive" | etc. */
  variant?: "default" | "destructive" | string;
  /** milliseconds (optional) */
  duration?: number;
};

/**
 * Accepts the old object syntax and forwards to Sonner v2.
 * Usage stays the same: toast({ title: "...", description: "..." })
 */
export function toast(opts: LegacyOptions) {
  const { title, description, variant, duration } = opts;

  // Simple text toast → use built-in helpers
  if (!description) {
    return variant === "destructive"
      ? sonnerToast.error(title, { duration })
      : sonnerToast.success(title, { duration });
  }

  // Two-line toast → render our own node
  return sonnerToast.custom(
    <div className="flex flex-col gap-1">
      <span className="font-medium">{title}</span>
      <span className="text-sm text-muted-foreground">{description}</span>
    </div>,
    {
      duration,
      className: variant === "destructive" ? "bg-destructive text-white" : "",
    }
  );
}
