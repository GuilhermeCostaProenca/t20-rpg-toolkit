import * as React from "react";

import { cn } from "@/lib/utils";

type PanelVariant = "default" | "elevated" | "danger";

type PanelProps = React.ComponentProps<"section"> & {
  variant?: PanelVariant;
};

const variantClasses: Record<PanelVariant, string> = {
  default: "rounded-2xl border border-white/10 bg-white/4",
  elevated: "chrome-panel rounded-2xl border border-white/10",
  danger: "rounded-2xl border border-destructive/40 bg-destructive/10",
};

export function Panel({ className, variant = "default", ...props }: PanelProps) {
  return <section className={cn("p-4 sm:p-5", variantClasses[variant], className)} {...props} />;
}
