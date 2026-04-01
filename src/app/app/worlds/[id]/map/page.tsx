"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  Compass,
  Crosshair,
  Map as MapIcon,
  MapPinned,
  ScrollText,
  Sparkles,
  Swords,
} from "lucide-react";

import { InteractiveMap } from "@/components/map/interactive-map";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type World = {
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
};

export default function MapPage() {
  const params = useParams<{ id: string }>();
  const worldId = params?.id;

  const [world, setWorld] = useState<World | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWorld = useCallback(async () => {
    if (!worldId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/worlds/${worldId}`, { cache: "no-store" });
      const payload = await res.json().catch(() => ({}));
      if (res.ok) setWorld(payload.data ?? null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [worldId]);

  useEffect(() => {
    void loadWorld();
  }, [loadWorld]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-[240px] animate-pulse rounded-[32px] border border-white/10 bg-white/5" />
        <div className="h-[72vh] animate-pulse rounded-[32px] border border-white/10 bg-white/5" />
      </div>
    );
  }

  if (!world) {
    return (
      <EmptyState
        title="Atlas indisponivel"
        description="O mundo nao foi encontrado ou nao foi possivel carregar o mapa agora."
        icon={<MapIcon className="h-6 w-6" />}
        action={
          <Button asChild>
            <Link href="/app/worlds">Voltar para mundos</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <section
        className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10"
        style={{
          backgroundImage: world.coverImage
            ? `linear-gradient(120deg, rgba(8,8,13,0.92), rgba(10,10,14,0.86)), url(${world.coverImage})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">
                Atlas do mundo
              </Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">
                {world.stats.locations} locais
              </Badge>
            </div>

            <div className="space-y-3">
              <p className="section-eyebrow">Superficie geografica</p>
              <h1 className="max-w-4xl text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl xl:text-6xl">
                {world.title}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                O atlas agora entra no mesmo idioma do cockpit: menos tela isolada, mais contexto de mundo, operacao e navegacao coerente.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/app/worlds/${world.id}`}>
                  <Compass className="mr-2 h-4 w-4" />
                  Voltar ao cockpit
                </Link>
              </Button>
              <Button variant="outline" className="border-white/10 bg-white/5" asChild>
                <Link href={`/app/worlds/${world.id}/locations`}>
                  <MapPinned className="mr-2 h-4 w-4" />
                  Abrir locais
                </Link>
              </Button>
              <Button variant="outline" className="border-white/10 bg-white/5" asChild>
                <Link href={`/app/worlds/${world.id}/campaigns`}>
                  <Swords className="mr-2 h-4 w-4" />
                  Campanhas
                </Link>
              </Button>
              <Button variant="outline" className="border-white/10 bg-white/5" onClick={() => void loadWorld()}>
                <Sparkles className="mr-2 h-4 w-4" />
                Atualizar leitura
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Leitura do mapa</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Locais
                  </p>
                  <p className="mt-2 text-3xl font-black text-foreground">
                    {world.stats.locations}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Campanhas
                  </p>
                  <p className="mt-2 text-3xl font-black text-foreground">
                    {world.campaigns.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Presenca
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    Atlas interativo ativo
                  </p>
                </div>
              </div>
            </div>

            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Controles</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  Arraste para explorar o continente e use zoom para aproximar frentes importantes.
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  Clique com o botao direito para abrir o menu contextual e soltar pings ou marcadores.
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  Tokens e pins podem virar base da mesa ao vivo quando a frente de mapa evoluir.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.75fr)]">
        <div className="cinematic-frame overflow-hidden rounded-[32px] p-3">
          <div className="relative h-[72vh] min-h-[540px] overflow-hidden rounded-[28px] border border-white/10">
            <InteractiveMap className="h-full w-full" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
              <div className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-2 text-white">
                  <MapIcon className="h-4 w-4 text-amber-200" />
                  <span className="text-sm font-semibold">Atlas Interativo</span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/55">
                  superficie geografica do mestre
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-2 text-white">
                  <Crosshair className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Modo exploracao</span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/55">
                  pronto para tokens e marcadores
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="cinematic-frame rounded-[28px] p-5">
            <p className="section-eyebrow">Rotas rapidas</p>
            <div className="mt-4 grid gap-3">
              <Button variant="outline" className="justify-between border-white/10 bg-white/5" asChild>
                <Link href={`/app/worlds/${world.id}/locations`}>
                  Locais e referencias
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="justify-between border-white/10 bg-white/5" asChild>
                <Link href={`/app/worlds/${world.id}/memory`}>
                  Diario do mundo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="justify-between border-white/10 bg-white/5" asChild>
                <Link href={`/app/worlds/${world.id}/compendium`}>
                  Biblioteca de regras
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="cinematic-frame rounded-[28px] p-5">
            <p className="section-eyebrow">Estado da frente</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Biblioteca ativa
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {world.stats.rules} documentos de regra e {world.stats.sessions} sessoes no mundo
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Personagens e NPCs
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {world.stats.npcs} NPCs indexados para apoiar rota, reveal e improviso.
                </p>
              </div>
            </div>
          </div>

          <div className="cinematic-frame rounded-[28px] p-5">
            <p className="section-eyebrow">Notas de operacao</p>
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/4 p-4 text-sm leading-6 text-muted-foreground">
              <ScrollText className="mb-3 h-4 w-4 text-amber-200" />
              Esta etapa fecha o shell do mapa como superficie coerente do produto. A frente seguinte pode evoluir marcadores, camadas e contexto de entidades sem precisar redesenhar a moldura.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

