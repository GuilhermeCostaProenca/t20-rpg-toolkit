"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, Clock3, Play, Swords, Timer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Campaign = {
  id: string;
  name: string;
  roomCode?: string | null;
};

type NextSession = {
  id: string;
  title: string;
  scheduledAt: string;
  campaign: { id: string; name: string };
};

type WorldPayload = {
  id: string;
  title: string;
  campaigns: Campaign[];
  nextSession?: NextSession | null;
};

function formatDateTime(value?: string) {
  if (!value) return "Sem horario";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WorldQuadroPage() {
  const params = useParams();
  const worldId = params?.id as string;

  const [world, setWorld] = useState<WorldPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWorld = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/worlds/${worldId}`, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (response.ok && payload.data) setWorld(payload.data as WorldPayload);
    } finally {
      setLoading(false);
    }
  }, [worldId]);

  useEffect(() => {
    if (!worldId) return;
    void loadWorld();
  }, [loadWorld, worldId]);

  const targetCampaign = useMemo(() => {
    if (!world) return null;
    if (world.nextSession?.campaign?.id) {
      return world.campaigns.find((campaign) => campaign.id === world.nextSession?.campaign.id) ?? null;
    }
    return world.campaigns[0] ?? null;
  }, [world]);

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Modo Quadro</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">Operacao ao vivo</Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Mesa em campo</p>
              <h1 className="text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl">
                Controle a sessao sem trocar de ferramenta.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                O Quadro conecta a preparação já existente (forja, codex, reveals, memória) com a operação ao vivo em `/app/play`.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {targetCampaign ? (
                <Button asChild>
                  <Link href={`/app/play/${targetCampaign.id}`}>
                    <Play className="mr-2 h-4 w-4" />
                    Abrir mesa ao vivo
                  </Link>
                </Button>
              ) : null}
              <Button variant="outline" className="border-white/10 bg-white/5" asChild>
                <Link href={`/app/worlds/${worldId}`}>Voltar ao modo normal</Link>
              </Button>
              <Button variant="outline" className="border-white/10 bg-white/5" asChild>
                <Link href={`/app/worlds/${worldId}/lousa`}>Abrir modo lousa</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Sinal da sessao</p>
              {loading ? (
                <p className="mt-4 text-sm text-muted-foreground">Carregando status...</p>
              ) : world?.nextSession ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-amber-100">
                    <Clock3 className="h-4 w-4 text-amber-300/80" />
                    Proxima sessao
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                    {world.nextSession.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(world.nextSession.scheduledAt)} • {world.nextSession.campaign.name}
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-muted-foreground">
                  Nenhuma sessao agendada no momento.
                </div>
              )}
            </div>

            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Indicadores</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Campanhas prontas</span>
                  <span className="font-semibold text-foreground">{world?.campaigns.length ?? 0}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Timer de sessao</span>
                  <span className="font-semibold text-foreground">~1h30m</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Status de combate</span>
                  <span className="font-semibold text-amber-100">via mesa ao vivo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="cinematic-frame rounded-[28px] p-5">
          <div className="flex items-center gap-2 text-foreground">
            <Swords className="h-4 w-4 text-primary/80" />
            <span className="font-semibold">Fluxo recomendado</span>
          </div>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p>1. Forja de Sessao para preparar cena, reveal e encontro.</p>
            <p>2. Abrir `/app/play/[campaignId]` para operação tática/narrativa ao vivo.</p>
            <p>3. Consolidar consequências em Memória do Mundo após mesa.</p>
          </div>
        </div>

        <div className="cinematic-frame rounded-[28px] p-5">
          <div className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="h-4 w-4 text-amber-300/80" />
            <span className="font-semibold">Estado atual</span>
          </div>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p>Esta superfície organiza o acesso ao modo ao vivo sem duplicar lógica de combate.</p>
            <p>O núcleo operacional continua no cockpit de mesa já implementado no projeto.</p>
            <p className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-amber-100/80" />
              Próximo passo: acoplar fila visual/contextual diretamente aqui.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
