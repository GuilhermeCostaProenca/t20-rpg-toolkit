"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { History, RefreshCw, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { ModeSwitcher } from "@/components/world/mode-switcher";
import {
  formatMemoryEventText,
  formatMemoryEventType,
  formatMemoryEventVisibility,
  formatMemoryEventKind,
  formatMemoryEventTemporalLabel,
} from "@/lib/world-memory";

type MemoryEvent = {
  id: string;
  type: string;
  text?: string | null;
  ts: string;
  visibility: string;
  campaignId?: string | null;
  sessionId?: string | null;
  meta?: Record<string, unknown> | null;
};

type EventVisualMeta = {
  label: string;
  color: string;
  dimColor: string;
};

function getEventVisualMeta(type: string): EventVisualMeta {
  switch (type) {
    case "NPC_DEATH":
      return { label: "Combate", color: "#bc4a3f", dimColor: "rgba(188,74,63,0.15)" };
    case "SESSION_END":
      return { label: "Narrativa", color: "#4b9f91", dimColor: "rgba(75,159,145,0.15)" };
    case "WORLD_CHANGE":
      return { label: "Descoberta", color: "#d5a240", dimColor: "rgba(213,162,64,0.15)" };
    default:
      return { label: "Nota", color: "#9b7f56", dimColor: "rgba(155,127,86,0.15)" };
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TimelineEvent({ event }: { event: MemoryEvent }) {
  const visual = getEventVisualMeta(event.type);
  const temporalLabel = formatMemoryEventTemporalLabel(event.ts);
  const kind = formatMemoryEventKind(event);

  return (
    <div className="relative mb-5 pl-4">
      <div
        className="absolute left-[-22px] top-[5px] h-[10px] w-[10px] rounded-full border-2"
        style={{
          background: visual.color,
          borderColor: "var(--background, #06070c)",
        }}
      />
      <div
        className="cinematic-frame rounded-[20px] p-4"
        style={{ borderColor: `${visual.color}22` }}
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {formatDate(event.ts)}
          </span>
          <span className="text-[10px] text-white/20">·</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {temporalLabel}
          </span>
          <div
            className="ml-auto rounded-full px-2 py-[2px] text-[9px] font-semibold uppercase tracking-[0.06em]"
            style={{
              border: `1px solid ${visual.color}44`,
              background: visual.dimColor,
              color: visual.color,
            }}
          >
            {visual.label}
          </div>
        </div>

        <p className="mb-1 text-sm font-semibold text-foreground">
          {formatMemoryEventText(event)}
        </p>
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{kind}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge className="border-white/10 bg-black/24 text-white/70">
            {formatMemoryEventVisibility(event.visibility)}
          </Badge>
          <Badge className="border-white/10 bg-black/24 text-white/60">
            {formatMemoryEventType(event.type)}
          </Badge>
          <span className="ml-auto text-[10px] text-muted-foreground/60">
            {formatDateTime(event.ts)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function WorldMemoryPage() {
  const params = useParams();
  const worldId = params?.id as string;

  const [query, setQuery] = useState("");
  const [events, setEvents] = useState<MemoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMemory = useCallback(async () => {
    setLoading(true);
    try {
      const search = new URLSearchParams({ limit: "50" });
      if (query.trim().length >= 2) search.set("q", query.trim());
      const response = await fetch(`/api/worlds/${worldId}/memory/search?${search.toString()}`, {
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({}));
      if (response.ok) setEvents((payload.data as MemoryEvent[] | undefined) ?? []);
    } finally {
      setLoading(false);
    }
  }, [query, worldId]);

  useEffect(() => {
    if (!worldId) return;
    void loadMemory();
  }, [loadMemory, worldId]);

  const grouped = useMemo(() => events.slice(0, 20), [events]);

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Memoria do mundo</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">
                {events.length} eventos
              </Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Continuidade narrativa</p>
              <h1 className="text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl">
                Memoria do Mundo
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                Linha narrativa consolidada. Tudo que ficou da mesa, em ordem cronologica.
              </p>
            </div>
            <ModeSwitcher worldId={worldId} />
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-white/10 bg-white/5" asChild>
                <Link href={`/app/worlds/${worldId}`}>Voltar ao cockpit</Link>
              </Button>
              <Button variant="outline" className="border-white/10 bg-white/5" asChild>
                <Link href={`/app/worlds/${worldId}/campaigns`}>Abrir campanhas</Link>
              </Button>
            </div>
          </div>

          <div className="cinematic-frame rounded-[28px] p-5">
            <p className="section-eyebrow">Busca de memoria</p>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por evento, fato, pessoa..."
                className="h-12 rounded-2xl border-white/10 bg-black/25 pl-11"
              />
            </div>
            <Button
              variant="outline"
              className="mt-3 w-full border-white/10 bg-white/5"
              onClick={() => void loadMemory()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar leitura
            </Button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-[28px] border border-white/10 bg-white/4 p-6 text-sm text-muted-foreground">
          Carregando memoria do mundo...
        </div>
      ) : grouped.length === 0 ? (
        <EmptyState
          title="Sem memoria registrada"
          description="Ainda nao existem eventos consolidados para este mundo."
          icon={<History className="h-6 w-6" />}
        />
      ) : (
        <div
          className="relative pl-6"
          style={{
            paddingLeft: "24px",
          }}
        >
          <div
            className="pointer-events-none absolute left-[6px] top-0 bottom-0 w-px"
            style={{
              background:
                "linear-gradient(180deg, rgba(188,74,63,0.5) 0%, rgba(188,74,63,0.15) 70%, rgba(188,74,63,0) 100%)",
            }}
          />
          {grouped.map((event) => (
            <TimelineEvent key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
