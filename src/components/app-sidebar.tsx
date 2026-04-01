"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookMarked,
  BookOpenText,
  Boxes,
  Crown,
  Flame,
  Globe2,
  Images,
  LayoutDashboard,
  Presentation,
  ScrollText,
  Scale,
  Sparkles,
  Swords,
  Waypoints,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { extractWorldIdFromPath } from "@/lib/active-world";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Brand } from "./brand";

const baseNavItems = [
  { id: "dashboard", href: "/app", label: "Painel", icon: LayoutDashboard },
  { id: "worlds", href: "/app/worlds", label: "Mundos", icon: Globe2 },
];

const worldNavSections = [
  {
    id: "world",
    label: "MUNDO",
    items: [
      { id: "hub", path: "", label: "Cockpit", icon: LayoutDashboard },
      { id: "forge", path: "forge", label: "Forja", icon: Flame },
      { id: "codex", path: "codex", label: "Codex", icon: Crown },
      { id: "graph", path: "graph", label: "Grafo", icon: Waypoints },
      { id: "visual", path: "visual", label: "Visual", icon: Images },
    ],
  },
  {
    id: "table",
    label: "MESA",
    items: [
      { id: "campaigns", path: "campaigns", label: "Campanhas", icon: Swords },
      { id: "quadro", path: "quadro", label: "Mesa ao Vivo", icon: Presentation, badge: "Hot" },
      { id: "memory", path: "memory", label: "Memoria", icon: BookMarked },
    ],
  },
  {
    id: "support",
    label: "APOIO",
    items: [
      { id: "compendium", path: "compendium", label: "Compendio", icon: BookOpenText },
      { id: "map", path: "map", label: "Atlas", icon: ScrollText },
      { id: "balance", path: "#", label: "Balanceamento", icon: Scale },
    ],
  },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const worldId = extractWorldIdFromPath(pathname);
  const isInWorld = worldId !== null;

  const worldSections = isInWorld
    ? worldNavSections.map((section) => ({
        id: section.id,
        label: section.label,
        items: section.items.map((item) => ({
          id: item.id,
          href:
            item.path === "#"
              ? "#"
              : item.path === ""
                ? `/app/worlds/${worldId}`
                : `/app/worlds/${worldId}/${item.path}`,
          label: item.label,
          icon: item.icon,
          badge: "badge" in item ? item.badge : undefined,
          disabled: item.path === "#",
        })),
      }))
    : [
        {
          id: "global",
          label: "NAVEGACAO GLOBAL",
          items: baseNavItems.map((item) => ({
            ...item,
            disabled: false,
          })),
        },
      ];

  return (
    <aside className="relative z-20 hidden lg:block">
      <div className="sticky top-0 flex h-screen w-[286px] flex-col justify-between border-r border-white/10 bg-[linear-gradient(180deg,rgba(8,8,12,0.98),rgba(12,11,16,0.94))] px-5 py-6 backdrop-blur-2xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Brand className="text-sm" />
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
              {isInWorld ? "Em operacao" : "Centro"}
            </Badge>
          </div>

          <div className="chrome-panel rounded-3xl p-4">
            <p className="section-eyebrow">{isInWorld ? "Mundo ativo" : "Entrada do sistema"}</p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {isInWorld ? "Cockpit contextual do mestre" : "Painel mestre do T20 OS"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isInWorld
                ? "Navegue pelo mundo sem perder o contexto do que esta vivo na mesa."
                : "Entre por mundos, retome operacoes e mantenha a mesa centralizada."}
            </p>
          </div>

          <Separator className="border-white/10" />

          <div className="space-y-4">
            {worldSections.map((section) => (
              <div key={section.id} className="space-y-2">
                <p className="section-eyebrow px-2">{section.label}</p>
                <nav className="space-y-1.5">
                  {section.items.map((item) => {
                    const active =
                      item.href !== "#" &&
                      (pathname === item.href ||
                        (item.href !== "/app" &&
                          item.href !== `/app/worlds/${worldId}` &&
                          pathname.startsWith(item.href)));

                    const Icon = item.icon;

                    return (
                      <Button
                        asChild={!item.disabled}
                        key={item.id}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 rounded-2xl border border-transparent px-4 py-5 text-sm font-medium transition duration-200",
                          active
                            ? "border-primary/25 bg-primary/12 text-primary shadow-[0_0_18px_rgba(188,74,63,0.18)]"
                            : item.disabled
                              ? "cursor-not-allowed text-white/30"
                              : "text-muted-foreground hover:border-white/10 hover:bg-white/5 hover:text-foreground"
                        )}
                      >
                        {item.disabled ? (
                          <span className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </span>
                        ) : (
                          <Link href={item.href}>
                            <Icon className="h-4 w-4" />
                            {item.label}
                            {item.badge ? (
                              <Badge className="ml-auto border-orange-400/20 bg-orange-500/10 text-orange-300">
                                {item.badge}
                              </Badge>
                            ) : null}
                          </Link>
                        )}
                      </Button>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <p className="section-eyebrow px-2">Prioridades</p>
            <div className="space-y-2">
              <div className="cinematic-frame rounded-2xl p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Boxes className="h-4 w-4 text-amber-300/80" />
                  Atualizacao 1
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Shell total, cockpit vivo e base visual cinematica.
                </p>
              </div>
              <div className="cinematic-frame rounded-2xl p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <BookMarked className="h-4 w-4 text-primary/90" />
                  Proxima frente
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Forja do Mundo como bootstrap vivo de criacao.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="chrome-panel rounded-3xl p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
            <Sparkles className="h-3 w-3" />
            Master system
          </div>
          <p className="text-sm text-muted-foreground">
            {isInWorld
              ? "Voce esta dentro do cockpit vivo. O foco agora e reduzir troca de contexto."
              : "Escolha um mundo para entrar no cockpit principal do mestre."}
          </p>
          {!isInWorld ? (
            <Button asChild className="mt-4 w-full">
              <Link href="/app/worlds">
                <Globe2 className="mr-2 h-4 w-4" />
                Abrir mundos
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="mt-4 w-full border-white/10 bg-white/5">
              <Link href={`/app/worlds/${worldId}`}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Voltar ao cockpit
              </Link>
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
