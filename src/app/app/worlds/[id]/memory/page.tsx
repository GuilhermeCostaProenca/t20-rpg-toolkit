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

type MemoryEvent = {
  id: string;
  type: string;
  text?: string | null;
  ts: string;
  visibility: string;
  campaignId?: string | null;
  sessionId?: string | null;
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
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
              <p className="section-eyebrow">Linha narrativa</p>
              <h1 className="text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl">
                O mundo lembra por eventos, nao por memoria manual.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                Esta rota canonica consolida a leitura de memoria do mundo e centraliza busca de acontecimentos para prep e mesa.
              </p>
            </div>
            <ModeSwitcher worldId={worldId} />
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-white/10 bg-white/5" asChild>
                <Link href={`/app/worlds/${worldId}`}>Voltar ao cockpit</Link>
              </Button>
              <Button variant="outline" className="border-white/10 bg-white/5" asChild>
                <Link href={`/app/worlds/${worldId}/diary`}>Abrir diario</Link>
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
        <div className="space-y-3">
          {grouped.map((event) => (
            <div key={event.id} className="rounded-[24px] border border-white/8 bg-white/4 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-white/10 bg-black/24 text-white/80">{event.type}</Badge>
                <Badge className="border-white/10 bg-black/24 text-white/60">{event.visibility}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground">
                {event.text || "Evento sem descricao textual."}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {formatDateTime(event.ts)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
