import type { ReactNode } from "react";

import { WorldWorkspaceShell } from "@/components/world-os/world-workspace-shell";

type WorldLayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

export default async function WorldLayout({ children, params }: WorldLayoutProps) {
  const { id } = await params;
  return <WorldWorkspaceShell worldId={id}>{children}</WorldWorkspaceShell>;
}

