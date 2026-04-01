"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BookOpenText, Crown, Images, Network, ScrollText, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModeSwitcher } from "@/components/world/mode-switcher";

const lousaCards = [
  {
    id: "forja",
    title: "Forja",
    description: "Estruture conceito, blocos de poder, cronologia e lore-base do mundo.",
    icon: Sparkles,
    path: "forge",
  },
  {
    id: "codex",
    title: "Codex",
    description: "Abra entidades, relacoes e eventos sem sair do contexto world-first.",
    icon: Crown,
    path: "codex",
  },
  {
    id: "graph",
    title: "Grafo",
    description: "Visualize conexoes narrativas e linhagens no mapa relacional do mundo.",
    icon: Network,
    path: "graph",
  },
  {
    id: "visual",
    title: "Visual",
    description: "Curadoria de referencias, retratos e reveals para prep e mesa ao vivo.",
    icon: Images,
    path: "visual",
  },
  {
    id: "memory",
    title: "Memoria",
    description: "Consulte o rastro de eventos que mantem continuidade real entre sessoes.",
    icon: ScrollText,
    path: "memory",
  },
  {
    id: "compendium",
    title: "Compendio",
    description: "Apoio de regras e textos para consulta rapida durante planejamento.",
    icon: BookOpenText,
    path: "compendium",
  },
];

export default function WorldLousaPage() {
  const params = useParams();
  const worldId = params?.id as string;

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-primary/20 bg-primary/10 text-primary">Modo Lousa</Badge>
            <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">
              Ideacao operacional
            </Badge>
          </div>
          <div className="space-y-3">
            <p className="section-eyebrow">Planejamento vivo</p>
            <h1 className="text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl">
              Monte o mundo por blocos sem perder continuidade.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
              A Lousa organiza os módulos já existentes como uma superfície contínua de criação.
              Nada é descartado: o objetivo é reduzir fricção entre ferramentas.
            </p>
          </div>
          <ModeSwitcher worldId={worldId} />
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/app/worlds/${worldId}`}>Voltar ao modo normal</Link>
            </Button>
            <Button variant="outline" className="border-white/10 bg-white/5" asChild>
              <Link href={`/app/worlds/${worldId}/quadro`}>Abrir modo quadro</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {lousaCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.id} href={`/app/worlds/${worldId}/${card.path}`} className="group">
              <div className="cinematic-frame rounded-[28px] p-5 transition group-hover:border-primary/25">
                <div className="flex items-center gap-2 text-foreground">
                  <Icon className="h-4 w-4 text-primary/80" />
                  <span className="font-semibold">{card.title}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.description}</p>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
