import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type LayoutPresetProps = {
  children: ReactNode;
  className?: string;
};

export function PageContainer({ children, className }: LayoutPresetProps) {
  return <div className={cn("space-y-8 pb-8", className)}>{children}</div>;
}

export function SectionStack({ children, className }: LayoutPresetProps) {
  return <section className={cn("space-y-5", className)}>{children}</section>;
}

export function Toolbar({ children, className }: LayoutPresetProps) {
  return <div className={cn("flex flex-wrap items-center gap-3", className)}>{children}</div>;
}
