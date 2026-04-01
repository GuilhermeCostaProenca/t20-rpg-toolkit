"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CalendarClock,
  RefreshCw,
  Sparkles,
  Waypoints,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  buildChronologyMetadata,
  getEmptyChronologySettings,
  normalizeChronologySettings,
  parseChronologyMeta,
  resolveChronologySortKey,
  type ChronologyEventKind,
} from "@/lib/chronology";

type WorldEventItem = {
  id: string;
  type: string;
  scope: string;
  text?: string | null;
  ts: string;
  actorId?: string | null;
  targetId?: string | null;
  payload?: Record<string, unknown> | null;
  meta?: Record<string, unknown> | null;
};

type TimelineEntity = {
  id: string;
  name: string;
  type: string;
};

type WorldPayload = {
  id: string;
  title: string;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
};

type TimelineDraft = {
  kind: ChronologyEventKind;
  title: string;
  eraLabel: string;
  yearLabel: string;
  sortKey: string;
  notes: string;
  linkedEntityIds: string[];
};

const initialDraft: TimelineDraft = {
  kind: "era",
  title: "",
  eraLabel: "",
  yearLabel: "",
  sortKey: "",
  notes: "",
  linkedEntityIds: [],
};

type TimelineFilter = "all" | "politics" | "houses" | "places" | "characters";

export default function WorldForgeTimelinePage() {
  const params = useParams();
  const worldId = params?.id as string;

  const [world, setWorld] = useState<WorldPayload | null>(null);
  const [events, setEvents] = useState<WorldEventItem[]>([]);
  const [entities, setEntities] = useState<TimelineEntity[]>([]);
  const [settings, setSettings] = useState(getEmptyChronologySettings());
  const [draft, setDraft] = useState<TimelineDraft>(initialDraft);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadTimeline = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [worldRes, eventsRes, codexRes] = await Promise.all([
        fetch(`/api/worlds/${worldId}`, { cache: "no-store" }),
        fetch(`/api/worlds/${worldId}/events?scope=MACRO`, { cache: "no-store" }),
        fetch(`/api/worlds/${worldId}/codex?limit=200`, { cache: "no-store" }),
      ]);
      const worldPayload = await worldRes.json().catch(() => ({}));
      const eventsPayload = await eventsRes.json().catch(() => ({}));
      const codexPayload = await codexRes.json().catch(() => ({}));

      if (!worldRes.ok || !worldPayload.data) {
        throw new Error(worldPayload.error ?? "Nao foi possivel abrir a oficina de cronologia");
      }

      const nextWorld = worldPayload.data as WorldPayload;
      setWorld(nextWorld);
      setSettings(normalizeChronologySettings(nextWorld.metadata));
      setEvents((eventsPayload.data as WorldEventItem[] | undefined) ?? []);
      setEntities(
        ((codexPayload.data?.entities as TimelineEntity[] | undefined) ?? []).filter((entity) =>
          ["house", "faction", "institution", "office", "place", "npc", "character"].includes(entity.type)
        )
      );
    } catch (loadError) {
      const messageValue =
        loadError instanceof Error ? loadError.message : "Erro inesperado ao carregar cronologia";
      setError(messageValue);
    } finally {
      setLoading(false);
    }
  }, [worldId]);

  useEffect(() => {
    if (worldId) void loadTimeline();
  }, [loadTimeline, worldId]);

  useEffect(() => {
    if (draft.linkedEntityIds.length === 0 && entities[0]) {
      setDraft((current) => ({ ...current, linkedEntityIds: [entities[0].id] }));
    }
  }, [draft.linkedEntityIds.length, entities]);

  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>("all");

  const entityMap = useMemo(() => new Map(entities.map((entity) => [entity.id, entity])), [entities]);

  const chronologyEvents = useMemo(
    () =>
      events
        .map((event) => ({
          ...event,
          chronology: parseChronologyMeta(event.meta),
          sortKey: resolveChronologySortKey(event.meta),
          linkedEntities: parseChronologyMeta(event.meta).linkedEntityIds
            .map((id) => entityMap.get(id))
            .filter((entity): entity is TimelineEntity => Boolean(entity)),
        }))
        .filter((event) => event.chronology.kind === "era" || event.chronology.kind === "founding_event" || event.chronology.kind === "milestone")
        .filter((event) => {
          if (timelineFilter === "all") return true;
          if (timelineFilter === "politics") {
            return event.linkedEntities.some((entity) =>
              ["house", "faction", "institution", "office"].includes(entity.type)
            );
          }
          if (timelineFilter === "houses") return event.linkedEntities.some((entity) => entity.type === "house");
          if (timelineFilter === "places") return event.linkedEntities.some((entity) => entity.type === "place");
          if (timelineFilter === "characters") {
            return event.linkedEntities.some((entity) => ["npc", "character"].includes(entity.type));
          }
          return true;
        })
        .sort((a, b) => a.sortKey - b.sortKey || new Date(a.ts).getTime() - new Date(b.ts).getTime()),
    [entityMap, events, timelineFilter]
  );

  const groupedChronologyEvents = useMemo(() => {
    const groups = new Map<string, typeof chronologyEvents>();
    chronologyEvents.forEach((event) => {
      const key = event.chronology.eraLabel || "Sem era definida";
      const existing = groups.get(key) ?? [];
      existing.push(event);
      groups.set(key, existing);
    });

    return Array.from(groups.entries()).map(([eraLabel, items]) => ({
      eraLabel,
      items,
    }));
  }, [chronologyEvents]);

  async function handleSaveSettings() {
    if (!world) return;
    setSavingSettings(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/worlds/${worldId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: buildChronologyMetadata(settings, world.metadata),
        }),
      });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error ?? "Nao foi possivel salvar configuracao da cronologia");
      setWorld(response.data as WorldPayload);
      setMessage("Configuracao de cronologia salva.");
    } catch (saveError) {
      const messageValue =
        saveError instanceof Error ? saveError.message : "Erro inesperado ao salvar cronologia";
      setError(messageValue);
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleCreateChronologyEvent() {
    if (!draft.title.trim()) {
      setError("Titulo obrigatorio para criar evento de cronologia.");
      return;
    }
    setCreatingEvent(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/worlds/${worldId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: draft.kind === "era" ? "WORLD_CHANGE" : "NOTE",
          scope: "MACRO",
          visibility: "MASTER",
          impactLevel: draft.kind === "era" ? 5 : 4,
          targetId: draft.linkedEntityIds[0] || undefined,
          text: draft.title,
          meta: {
            chronology: {
              kind: draft.kind,
              eraLabel: draft.eraLabel || undefined,
              yearLabel: draft.yearLabel || undefined,
              sortKey: draft.sortKey ? Number(draft.sortKey) : undefined,
              linkedEntityIds: draft.linkedEntityIds,
            },
          },
          payload: {
            notes: draft.notes || undefined,
          },
        }),
      });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error ?? "Nao foi possivel criar evento fundador");
      setDraft((current) => ({
        ...initialDraft,
        linkedEntityIds: current.linkedEntityIds,
      }));
      setMessage("Evento de cronologia registrado.");
      await loadTimeline();
    } catch (createError) {
      const messageValue =
        createError instanceof Error ? createError.message : "Erro inesperado ao criar evento";
      setError(messageValue);
    } finally {
      setCreatingEvent(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[280px] w-full rounded-[32px]" />
        <Skeleton className="h-[860px] w-full rounded-[32px]" />
      </div>
    );
  }

  if (!world) {
    return (
      <EmptyState
        title="Cronologia indisponivel"
        description={error ?? "Nao foi possivel abrir a oficina de cronologia deste mundo."}
        icon={<CalendarClock className="h-6 w-6" />}
        action={<Button onClick={() => void loadTimeline()}>Tentar novamente</Button>}
      />
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Cronologia</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">
                {chronologyEvents.length} marcos macro
              </Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Forja do mundo</p>
              <h1 className="max-w-4xl text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl xl:text-6xl">
                Eras, datas e eventos fundadores em uma oficina propria.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                Dê ao mundo um senso real de tempo: nome do calendário, era atual, datas marcantes,
                eventos fundadores e marcos que alimentam o resto do produto depois.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-white/10 bg-white/5" onClick={() => void loadTimeline()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
              <Button asChild variant="outline" className="border-white/10 bg-white/5">
                <Link href={`/app/worlds/${worldId}/forge`}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Voltar para forja
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/10 bg-white/5">
                <Link href={`/app/worlds/${worldId}/memory`}>
                  <Waypoints className="mr-2 h-4 w-4" />
                  Abrir memoria
                </Link>
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Leitura rapida</p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  Calendario: {settings.calendarName || "Nao definido"}
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  Era atual: {settings.currentEraLabel || "Nao definida"}
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  Ano corrente: {settings.currentYearLabel || "Nao definido"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)]">
        <section className="chrome-panel rounded-[30px] p-6">
          <div className="mb-5 space-y-2">
            <p className="section-eyebrow">Passo 1</p>
            <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">
              Configure o tempo do mundo
            </h2>
          </div>
          <div className="grid gap-4">
            <Input value={settings.calendarName} onChange={(e) => setSettings((c) => ({ ...c, calendarName: e.target.value }))} placeholder="Nome do calendario" />
            <Input value={settings.currentEraLabel} onChange={(e) => setSettings((c) => ({ ...c, currentEraLabel: e.target.value }))} placeholder="Era atual" />
            <Input value={settings.currentYearLabel} onChange={(e) => setSettings((c) => ({ ...c, currentYearLabel: e.target.value }))} placeholder="Ano atual" />
            <Input value={settings.datingRule} onChange={(e) => setSettings((c) => ({ ...c, datingRule: e.target.value }))} placeholder="Regra de datacao: AC/DC, Depois da Ruina, etc." />
            <Input value={settings.toneOfHistory} onChange={(e) => setSettings((c) => ({ ...c, toneOfHistory: e.target.value }))} placeholder="Tom historico: era de ruina, ouro perdido, paz rachada..." />
            <Button onClick={() => void handleSaveSettings()} disabled={savingSettings}>
              <Sparkles className="mr-2 h-4 w-4" />
              {savingSettings ? "Salvando..." : "Salvar cronologia base"}
            </Button>
          </div>
        </section>

        <section className="chrome-panel rounded-[30px] p-6">
          <div className="mb-5 space-y-2">
            <p className="section-eyebrow">Passo 2</p>
            <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">
              Registre eras e eventos fundadores
            </h2>
          </div>
          <div className="grid gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "Tudo" },
                { value: "politics", label: "Politica" },
                { value: "houses", label: "Casas" },
                { value: "places", label: "Lugares" },
                { value: "characters", label: "Figuras" },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className={timelineFilter === option.value ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"}
                  onClick={() => setTimelineFilter(option.value as TimelineFilter)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "era", label: "Era" },
                { value: "founding_event", label: "Evento fundador" },
                { value: "milestone", label: "Marco historico" },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className={draft.kind === option.value ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"}
                  onClick={() => setDraft((current) => ({ ...current, kind: option.value as ChronologyEventKind }))}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <Input value={draft.title} onChange={(e) => setDraft((c) => ({ ...c, title: e.target.value }))} placeholder="Titulo do evento ou da era" />
            <div className="grid gap-4 lg:grid-cols-2">
              <Input value={draft.eraLabel} onChange={(e) => setDraft((c) => ({ ...c, eraLabel: e.target.value }))} placeholder="Rotulo da era" />
              <Input value={draft.yearLabel} onChange={(e) => setDraft((c) => ({ ...c, yearLabel: e.target.value }))} placeholder="Ano ou marco temporal" />
            </div>
            <Input value={draft.sortKey} onChange={(e) => setDraft((c) => ({ ...c, sortKey: e.target.value }))} placeholder="Ordem historica (ex.: -300, 0, 172)" />
            <Input value={draft.notes} onChange={(e) => setDraft((c) => ({ ...c, notes: e.target.value }))} placeholder="Resumo curto do impacto deste marco" />
            <div className="flex flex-wrap gap-2">
              {entities.slice(0, 20).map((entity) => (
                <Button
                  key={entity.id}
                  variant="outline"
                  className={draft.linkedEntityIds.includes(entity.id) ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      linkedEntityIds: current.linkedEntityIds.includes(entity.id)
                        ? current.linkedEntityIds.filter((id) => id !== entity.id)
                        : [...current.linkedEntityIds, entity.id].slice(0, 6),
                    }))
                  }
                >
                  {entity.name}
                </Button>
              ))}
            </div>
            <Button onClick={() => void handleCreateChronologyEvent()} disabled={creatingEvent}>
              <Sparkles className="mr-2 h-4 w-4" />
              {creatingEvent ? "Registrando..." : "Registrar marco historico"}
            </Button>
            {message ? <p className="text-sm text-emerald-200">{message}</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <div className="mt-6 grid gap-5">
            {groupedChronologyEvents.length > 0 ? (
              groupedChronologyEvents.map((group) => (
                <div key={group.eraLabel} className="rounded-[28px] border border-white/8 bg-white/4 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Badge className="border-primary/20 bg-primary/10 text-primary">{group.eraLabel}</Badge>
                    <Badge className="border-white/10 bg-white/5 text-white/80">{group.items.length} marcos</Badge>
                  </div>
                  <div className="grid gap-3">
                    {group.items.map((event) => (
                      <div key={event.id} className="rounded-2xl border border-white/8 bg-black/15 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="border-white/10 bg-white/5 text-white/80">
                            {event.chronology.kind || event.type}
                          </Badge>
                          {event.chronology.yearLabel ? (
                            <Badge className="border-amber-300/20 bg-amber-300/10 text-amber-100">
                              {event.chronology.yearLabel}
                            </Badge>
                          ) : null}
                          <Badge className="border-white/10 bg-white/5 text-white/70">
                            ordem {event.sortKey}
                          </Badge>
                        </div>
                        <h3 className="mt-3 text-lg font-black uppercase tracking-[0.04em] text-foreground">
                          {event.text || "Marco sem titulo"}
                        </h3>
                        {"notes" in (event.payload ?? {}) && typeof event.payload?.notes === "string" ? (
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{event.payload.notes}</p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                          {event.linkedEntities.length > 0
                            ? event.linkedEntities.map((entity) => (
                                <Link
                                  key={entity.id}
                                  href={`/app/worlds/${worldId}/codex/${entity.id}`}
                                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.14em] text-white/80 hover:border-primary/20 hover:text-primary"
                                >
                                  {entity.name}
                                </Link>
                              ))
                            : null}
                          <span>Registrado em {new Date(event.ts).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/4 p-4 text-sm text-muted-foreground">
                Nenhuma era ou evento fundador registrado ainda.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

