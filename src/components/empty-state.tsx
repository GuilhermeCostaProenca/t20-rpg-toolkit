import type { ReactNode } from "react";

import { EmptyState as BaseEmptyState } from "@/components/ui/states";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <BaseEmptyState
      title={title}
      description={description}
      action={action}
      icon={icon}
      className={className}
    />
  );
}
