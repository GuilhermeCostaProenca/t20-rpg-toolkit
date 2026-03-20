"use client";

import { ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

type CockpitDetailSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function CockpitDetailSheet({
  open,
  onOpenChange,
  badge,
  title,
  description,
  children,
  footer,
}: CockpitDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="chrome-panel w-full border-white/10 bg-card/92 p-0 sm:max-w-xl"
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-white/8 px-6 py-6">
            <Badge className="mb-3 w-fit border-primary/20 bg-primary/10 text-primary">
              {badge}
            </Badge>
            <SheetTitle className="text-2xl font-black uppercase tracking-[0.04em]">
              {title}
            </SheetTitle>
            {description ? <SheetDescription>{description}</SheetDescription> : null}
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
          {footer ? <div className="border-t border-white/8 px-6 py-5">{footer}</div> : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
