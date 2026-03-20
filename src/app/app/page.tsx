"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Globe2,
  Library,
  Map,
  Shield,
  Sparkles,
  Swords,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

type World = {
  id: string;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  createdAt: string;
  updatedAt: string;
};

type WorldDetail = {
  id: string;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  campaigns: Array<{ id: string; name: string }>;
  stats: {
    locations: number;
    rules: number;
    npcs: number;
    sessions: number;
  };
  nextSession?: {
    id: string;
    title: string;
    scheduledAt: string;
    campaign: { name: string };
  } | null;
};

const fallbackArtwork = [
  "linear-gradient(135deg, rgba(188,74,63,0.78), rgba(20,11,14,0.88))",
  "linear-gradient(135deg, rgba(213,162,64,0.66), rgba(20,14,10,0.9))",
  "linear-gradient(135deg, rgba(66,102,135,0.68), rgba(12,12,18,0.9))",
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [worlds, setWorlds] = useState<World[]>([]);
  const [details, setDetails] = useState<Record<string, WorldDetail>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/worlds", { cache: "no-store" });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload.data || cancelled) return;

        const nextWorlds = payload.data as World[];
        setWorlds(nextWorlds);

        const focusWorlds = nextWorlds.slice(0, 4);
        const detailResults = await Promise.allSettled(
          focusWorlds.map(async (world) => {
            const detailResponse = await fetch(`/api/worlds/${world.id}`, { cache: "no-store" });
            const detailPayload = await detailResponse.json().catch(() => ({}));
            if (!detailResponse.ok || !detailPayload.data) return null;
            return detailPayload.data as WorldDetail;
          })
        );

        if (cancelled) return;

        const nextDetails: Record<string, WorldDetail> = {};
        for (const result of detailResults) {
          if (result.status === "fulfilled" && result.value) {
            nextDetails[result.value.id] = result.value;
          }
        }
        setDetails(nextDetails);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeWorldCount = worlds.length;
  const totalCampaigns = useMemo(
    () => Object.values(details).reduce((acc, world) => acc + world.campaigns.length, 0),
    [details]
  );
  const nextSessionCount = useMemo(
    () => Object.values(details).filter((world) => world.nextSession).length,
    [details]
  );
  const featuredWorld = worlds[0] ?? null;
  const featuredDetail = featuredWorld ? details[featuredWorld.id] : undefined;

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Atualizacao 1</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">Shell total do front</Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Painel do mestre</p>
              <h1 className="max-w-4xl text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl xl:text-6xl">
                Um cockpit unico para preparar, operar e lembrar cada mundo.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                O front deixa de ser uma colecao de paginas e passa a funcionar como centro de operacao.
                Comece pelos mundos, retome campanhas ativas e entre no cockpit principal sem perder contexto.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="cinematic-frame rounded-2xl p-4">
                <p className="section-eyebrow">Mundos ativos</p>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-3xl font-black text-foreground">{activeWorldCount}</span>
                  <Globe2 className="h-5 w-5 text-primary/80" />
                </div>
              </div>
              <div className="cinematic-frame rounded-2xl p-4">
                <p className="section-eyebrow">Campanhas em campo</p>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-3xl font-black text-foreground">{totalCampaigns}</span>
                  <Swords className="h-5 w-5 text-amber-300/80" />
                </div>
              </div>
              <div className="cinematic-frame rounded-2xl p-4">
                <p className="section-eyebrow">Agenda viva</p>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-3xl font-black text-foreground">{nextSessionCount}</span>
                  <Sparkles className="h-5 w-5 text-sky-200/80" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-[0_18px_50px_rgba(188,74,63,0.28)]">
                <Link href="/app/worlds">
                  Abrir mundos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {featuredWorld ? (
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/10 bg-white/5"
                  onClick={() => router.push(`/app/worlds/${featuredWorld.id}`)}
                >
                  Retomar ultimo mundo
                </Button>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Estado do sistema</p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between border-b border-white/8 pb-3">
                  <span className="text-sm text-muted-foreground">Entrada global</span>
                  <span className="text-sm font-semibold text-foreground">Atualizada</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/8 pb-3">
                  <span className="text-sm text-muted-foreground">Biblioteca de mundos</span>
                  <span className="text-sm font-semibold text-foreground">Pronta para operar</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cockpit do mundo</span>
                  <span className="text-sm font-semibold text-foreground">Em foco</span>
                </div>
              </div>
            </div>

            {featuredWorld ? (
              <div className="cinematic-frame rounded-[28px] p-5">
                <p className="section-eyebrow">Mundo em destaque</p>
                <div className="mt-4 space-y-3">
                  <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                    {featuredWorld.title}
                  </h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {featuredWorld.description || "Sem descricao registrada no momento."}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Campanhas</p>
                      <p className="mt-2 text-xl font-bold text-foreground">
                        {featuredDetail?.campaigns.length ?? 0}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">NPCs</p>
                      <p className="mt-2 text-xl font-bold text-foreground">
                        {featuredDetail?.stats.npcs ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="chrome-panel rounded-[30px] p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="section-eyebrow">Mundos recentes</p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                Continue de onde parou
              </h2>
            </div>
            <Button asChild variant="outline" className="border-white/10 bg-white/5">
              <Link href="/app/worlds">Ver biblioteca</Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-44 animate-pulse rounded-[26px] border border-white/8 bg-white/4" />
              ))}
            </div>
          ) : worlds.length === 0 ? (
            <EmptyState
              title="Nenhum mundo ativo"
              description="Crie o primeiro mundo para comecar a operar o app como mesa central do mestre."
              icon={<Globe2 className="h-6 w-6" />}
              action={
                <Button asChild>
                  <Link href="/app/worlds">Criar ou abrir mundos</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {worlds.slice(0, 4).map((world, index) => {
                const detail = details[world.id];
                return (
                  <Card
                    key={world.id}
                    className="group overflow-hidden rounded-[28px] border-white/10 bg-black/20 transition-transform duration-200 hover:-translate-y-1 hover:border-primary/25"
                  >
                    <CardContent className="p-0">
                      <div
                        className="min-h-[220px] p-5"
                        style={{
                          backgroundImage: world.coverImage
                            ? `linear-gradient(180deg, rgba(8,8,12,0.12), rgba(8,8,12,0.88)), url(${world.coverImage})`
                            : fallbackArtwork[index % fallbackArtwork.length],
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        <div className="flex h-full flex-col justify-between">
                          <div className="flex items-center justify-between gap-3">
                            <Badge className="border-white/10 bg-black/30 text-white">Mundo</Badge>
                            <span className="text-xs uppercase tracking-[0.18em] text-white/60">
                              {formatDate(world.updatedAt)}
                            </span>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h3 className="text-2xl font-black uppercase tracking-[0.04em] text-white">
                                {world.title}
                              </h3>
                              <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/70">
                                {world.description || "Sem descricao registrada."}
                              </p>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">Campanhas</p>
                                <p className="mt-2 text-lg font-bold text-white">
                                  {detail?.campaigns.length ?? 0}
                                </p>
                              </div>
                              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">NPCs</p>
                                <p className="mt-2 text-lg font-bold text-white">
                                  {detail?.stats.npcs ?? 0}
                                </p>
                              </div>
                              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">Sessoes</p>
                                <p className="mt-2 text-lg font-bold text-white">
                                  {detail?.stats.sessions ?? 0}
                                </p>
                              </div>
                            </div>

                            <Button
                              className="w-full justify-between bg-white text-black hover:bg-white/90"
                              onClick={() => router.push(`/app/worlds/${world.id}`)}
                            >
                              Entrar no cockpit
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="chrome-panel rounded-[30px] p-6">
            <p className="section-eyebrow">Acoes imediatas</p>
            <div className="mt-4 space-y-3">
              <Button asChild className="w-full justify-start">
                <Link href="/app/worlds">
                  <Library className="mr-2 h-4 w-4" />
                  Abrir biblioteca de mundos
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start border-white/10 bg-white/5">
                <Link href="/app/worlds">
                  <Shield className="mr-2 h-4 w-4" />
                  Criar novo mundo
                </Link>
              </Button>
              {featuredWorld ? (
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/10 bg-white/5"
                  onClick={() => router.push(`/app/worlds/${featuredWorld.id}`)}
                >
                  <Map className="mr-2 h-4 w-4" />
                  Retomar mundo em destaque
                </Button>
              ) : null}
            </div>
          </div>

          <div className="chrome-panel rounded-[30px] p-6">
            <p className="section-eyebrow">Leitura do sistema</p>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-sm font-semibold text-foreground">Produto em producao</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  O app atual segue vivo, mas a experiencia agora evolui por atualizacoes claras e com substituicao controlada.
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-sm font-semibold text-foreground">Foco desta entrega</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Shell, entrada global, biblioteca de mundos e cockpit do mundo como referencia visual do produto.
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-sm font-semibold text-foreground">Proxima camada</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Codex do Mundo, grafo narrativo e biblioteca visual encaixados em cima desse shell.
                </p>
              </div>
            </div>
          </div>

          <div className="chrome-panel rounded-[30px] p-6">
            <p className="section-eyebrow">Arquitetura ativa</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between border-b border-white/8 pb-3">
                <span className="text-sm text-muted-foreground">World-first</span>
                <span className="text-sm font-semibold text-foreground">Mantido</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/8 pb-3">
                <span className="text-sm text-muted-foreground">Backend atual</span>
                <span className="text-sm font-semibold text-foreground">Preservado</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Front antigo</span>
                <span className="text-sm font-semibold text-foreground">Em substituicao</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
