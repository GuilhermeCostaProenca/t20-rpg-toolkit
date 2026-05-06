"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookMarked,
  Crown,
  Flame,
  Globe2,
  Images,
  LayoutDashboard,
  Presentation,
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function StatBadge({ label, value, tone }: { label: string; value: number; tone: "gold" | "emerald" | "red" | "neutral" }) {
  const toneClass =
    tone === "gold"
      ? "text-amber-100"
      : tone === "emerald"
        ? "text-emerald-100"
        : tone === "red"
          ? "text-red-100"
          : "text-foreground";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-black ${toneClass}`}>{value}</p>
    </div>
  );
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
  const highlightedWorlds = worlds.slice(0, 3);

  return (
    <div className="space-y-6 pb-8">
      <section className="world-hero rounded-[30px] p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Atualizacao 1</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/10 text-amber-100">Cockpit do Mestre</Badge>
            </div>

            <div className="space-y-3">
              <p className="section-eyebrow">Painel central</p>
              <h1 className="t20-h1 max-w-4xl text-foreground">{featuredWorld ? featuredWorld.title : "T20 OS"}</h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                Centro operacional world-first para criar, preparar e operar campanhas em fluxo continuo.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatBadge label="Entidades" value={activeWorldCount * 12} tone="gold" />
              <StatBadge label="Campanhas" value={totalCampaigns} tone="emerald" />
              <StatBadge label="Sessoes" value={nextSessionCount} tone="red" />
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
                  Entrar no cockpit
                </Button>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[26px] p-5">
              <p className="section-eyebrow">Acesso rapido</p>
              <div className="mt-4 space-y-2">
                <Button variant="outline" className="w-full justify-between border-white/10 bg-white/5" onClick={() => router.push("/app")}> 
                  <span className="inline-flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /> Cockpit</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between border-white/10 bg-white/5" onClick={() => featuredWorld && router.push(`/app/worlds/${featuredWorld.id}/codex`)}>
                  <span className="inline-flex items-center gap-2"><Crown className="h-4 w-4" /> Codex</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between border-white/10 bg-white/5" onClick={() => featuredWorld && router.push(`/app/worlds/${featuredWorld.id}/forge`)}>
                  <span className="inline-flex items-center gap-2"><Flame className="h-4 w-4" /> Forja</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between border-white/10 bg-white/5" onClick={() => featuredWorld && router.push(`/app/worlds/${featuredWorld.id}/quadro`)}>
                  <span className="inline-flex items-center gap-2"><Presentation className="h-4 w-4" /> Mesa ao Vivo</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {featuredWorld ? (
              <div className="cinematic-frame rounded-[26px] p-5">
                <p className="section-eyebrow">Mundo em destaque</p>
                <h2 className="mt-3 text-3xl font-black uppercase tracking-[0.04em] text-foreground">{featuredWorld.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {featuredWorld.description || "Mundo criado automaticamente para migracao worldId"}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Campanhas</p>
                    <p className="mt-1 text-xl font-black text-foreground">{featuredDetail?.campaigns.length ?? 0}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">NPCs</p>
                    <p className="mt-1 text-xl font-black text-foreground">{featuredDetail?.stats.npcs ?? 0}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="chrome-panel rounded-[30px] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="section-eyebrow">Mundos recentes</p>
              <h2 className="t20-h2 mt-2 text-foreground">Continue de onde parou</h2>
            </div>
            <Button asChild variant="outline" className="border-white/10 bg-white/5">
              <Link href="/app/worlds">Ver biblioteca</Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-3 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-44 animate-pulse rounded-[24px] border border-white/8 bg-white/4" />
              ))}
            </div>
          ) : highlightedWorlds.length === 0 ? (
            <EmptyState
              title="Nenhum mundo ativo"
              description="Crie o primeiro mundo para comecar o fluxo world-first."
              icon={<Globe2 className="h-6 w-6" />}
              action={
                <Button asChild>
                  <Link href="/app/worlds">Criar ou abrir mundos</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {highlightedWorlds.map((world) => {
                const detail = details[world.id];
                return (
                  <Card key={world.id} className="overflow-hidden rounded-[24px] border-white/10 bg-black/20">
                    <CardContent className="p-0">
                      <div className="min-h-[220px] bg-[linear-gradient(130deg,rgba(188,74,63,0.38),rgba(13,12,18,0.92)_56%,rgba(75,159,145,0.2))] p-4">
                        <div className="flex h-full flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <Badge className="border-white/10 bg-black/30 text-white">Mundo</Badge>
                            <span className="text-xs uppercase tracking-[0.16em] text-white/60">{formatDate(world.updatedAt)}</span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-black uppercase tracking-[0.04em] text-white">{world.title}</h3>
                            <p className="mt-2 line-clamp-3 text-sm text-white/75">{world.description || "Sem descricao registrada."}</p>
                            <div className="mt-3 flex gap-2">
                              <Badge className="border-white/10 bg-black/30 text-white/85">
                                <Swords className="mr-1 h-3 w-3" /> {detail?.campaigns.length ?? 0}
                              </Badge>
                              <Badge className="border-white/10 bg-black/30 text-white/85">
                                <BookMarked className="mr-1 h-3 w-3" /> {detail?.stats.sessions ?? 0}
                              </Badge>
                            </div>
                            <Button className="mt-4 w-full justify-between bg-white text-black hover:bg-white/90" onClick={() => router.push(`/app/worlds/${world.id}`)}>
                              Abrir cockpit
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
                  <Globe2 className="mr-2 h-4 w-4" />
                  Abrir biblioteca de mundos
                </Link>
              </Button>
              {featuredWorld ? (
                <>
                  <Button variant="outline" className="w-full justify-start border-white/10 bg-white/5" onClick={() => router.push(`/app/worlds/${featuredWorld.id}/visual`)}>
                    <Images className="mr-2 h-4 w-4" />
                    Biblioteca visual
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-white/10 bg-white/5" onClick={() => router.push(`/app/worlds/${featuredWorld.id}/campaigns`)}>
                    <Swords className="mr-2 h-4 w-4" />
                    Campanhas do mundo
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
