import { Loader2, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

type StateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, icon, action, className }: StateProps) {
  return (
    <Panel className={cn("flex flex-col items-center justify-center gap-4 text-center", className)} variant="elevated">
      {icon ? <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">{icon}</div> : null}
      <div className="space-y-1">
        <p className="text-lg font-semibold uppercase tracking-[0.08em]">{title}</p>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </Panel>
  );
}

export function LoadingState({ title = "Carregando", description, className }: Omit<StateProps, "action" | "icon">) {
  return (
    <Panel className={cn("flex flex-col items-center justify-center gap-3 text-center", className)}>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm font-semibold uppercase tracking-[0.08em]">{title}</p>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    </Panel>
  );
}

export function ErrorState({ title, description, action, className }: StateProps) {
  return (
    <Panel className={cn("flex flex-col items-center justify-center gap-4 text-center", className)} variant="danger">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-destructive/40 bg-destructive/15 text-destructive">
        <TriangleAlert className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-semibold uppercase tracking-[0.08em]">{title}</p>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ?? <Button variant="outline" className="border-white/10 bg-white/5">Tentar novamente</Button>}
    </Panel>
  );
}
