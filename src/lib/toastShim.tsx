
import { toast as sonnerToast } from "sonner";
import type { ReactNode } from "react";

type LegacyToast = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | string;
  duration?: number;      // ms
};

/** Drop-in adapter for old calls: toast({ title, description, … }) */
export function toast(opts: LegacyToast) {
  const { title, description, variant, duration } = opts;

  /* one-liner – use builtin helpers */
  if (!description) {
    return variant === "destructive"
      ? sonnerToast.error(title, { duration })
      : sonnerToast.success(title, { duration });
  }

  /* two-liner – custom layout (note the callback) */
  return sonnerToast.custom(
    () => (
      <div className="flex flex-col gap-1">
        <span className="font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">{description}</span>
      </div>
    ),
    {
      duration,
      className: variant === "destructive" ? "bg-destructive text-white" : "",
    }
  );
}

/** Dummy hook so legacy `const { toast } = useToast()` compiles */
export const useToast = () => ({ toast });
