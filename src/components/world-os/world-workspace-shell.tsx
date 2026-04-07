"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, LayoutDashboard, Network, PanelRightOpen, StickyNote } from "lucide-react";
import type { ReactNode } from "react";

import { WorldCommandBar } from "@/components/world-os/world-command-bar";
import { cn } from "@/lib/utils";

type WorldWorkspaceShellProps = {
  worldId: string;
  children: ReactNode;
};

const coreLinks = [
  { id: "codex", label: "Codex", icon: LayoutDashboard, path: "codex" },
  { id: "graph", label: "Grafo", icon: Network, path: "graph" },
  { id: "notebook", label: "Caderno", icon: BookOpenText, path: "notebook" },
  { id: "board", label: "Lousa", icon: StickyNote, path: "board" },
] as const;

export function WorldWorkspaceShell({ worldId, children }: WorldWorkspaceShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#04060b] text-white">
      <div className="mx-auto grid max-w-[1720px] grid-cols-12 gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="col-span-12 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl lg:col-span-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Core Mundo</p>
          <nav className="mt-3 space-y-2">
            {coreLinks.map((item) => {
              const href = `/app/worlds/${worldId}/${item.path}`;
              const active = pathname === href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition",
                    active
                      ? "border-primary/40 bg-primary/15 text-white"
                      : "border-white/10 bg-black/20 text-white/75 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="col-span-12 rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl lg:col-span-8">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">World OS Workspace</p>
              <p className="text-sm text-white/80">Mundo ativo: {worldId}</p>
            </div>
            <WorldCommandBar worldId={worldId} />
          </header>
          <main className="p-4 sm:p-5">{children}</main>
        </section>

        <aside className="col-span-12 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl lg:col-span-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
            <PanelRightOpen className="h-4 w-4" />
            Inspect
          </div>
          <p className="mt-3 text-xs leading-6 text-white/65">
            Painel reservado para inspecao contextual de entidade, nota e conexoes do modo atual.
          </p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3 text-xs text-white/60">
            Bootstrap v1: shell + rotas base conectadas ao command bar.
          </div>
        </aside>
      </div>
    </div>
  );
}

