"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Activity,
  BookOpenText,
  CalendarClock,
  ChevronRight,
  Crown,
  Flame,
  Globe2,
  Images,
  LayoutGrid,
  Map as MapIcon,
  MapPin,
  RefreshCw,
  Settings2,
  Sparkles,
  Swords,
  Trash,
  Users2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CockpitDetailSheet } from "@/components/cockpit/cockpit-detail-sheet";
import { ModeSwitcher } from "@/components/world/mode-switcher";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/empty-state";
import { useAppFeedback } from "@/components/app-feedback-provider";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  inferLoreCampaignIds,
  inferLorePrepContexts,
  parseLoreTextIndex,
  type LorePrepContext,
  type LorePrepFocus,
} from "@/lib/lore";
import {
  formatMemoryEventTemporalLabel,
  formatMemoryEventKind,
  formatMemoryEventText,
  formatMemoryEventType,
  formatMemoryEventVisibility,
  getMemoryEventLinkedEntityIds,
  getMemoryEventLinkedEntityCount,
  getMemoryEventSearchText,
  getMemoryEventTone,
  isMemoryWorldEvent,
} from "@/lib/world-memory";
import { CampaignCreateSchema } from "@/lib/validators";

const initialForm = {
  name: "",
  description: "",
};
type CampaignCreateFormValues = typeof initialForm;

type WorldCampaign = {
  id: string;
  name: string;
  updatedAt: string;
  roomCode?: string;
};

type WorldStats = {
  locations: number;
  rules: number;
  npcs: number;
  sessions: number;
};

type NextSession = {
  id: string;
  title: string;
  scheduledAt: string;
  campaign: { id: string; name: string };
};

type World = {
  id: string;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  status: "ACTIVE" | "ARCHIVED" | "DELETED";
  createdAt: string;
  updatedAt: string;
  campaigns: WorldCampaign[];
  stats: WorldStats;
  nextSession?: NextSession | null;
};

type WorldEvent = {
  id: string;
  campaignId?: string | null;
  sessionId?: string | null;
  actorId?: string | null;
  targetId?: string | null;
  type: string;
  scope: string;
  ts: string;
  text?: string | null;
  visibility: string;
  payload?: Record<string, unknown> | null;
  meta?: Record<string, unknown> | null;
};
type MemoryTemporalBucket = { month: string; count: number };
type MemoryTemporalMeta = {
  last7d: number;
  last30d: number;
  last90d: number;
  older: number;
  byMonth: MemoryTemporalBucket[];
  newestTs: string | null;
  oldestTs: string | null;
};

type PoliticalCodexEntity = {
  id: string;
  name: string;
  type: string;
  campaign?: { id: string; name: string } | null;
  metadata?: Record<string, unknown> | null;
  outgoingRelations?: Array<{
    id: string;
    type: string;
    metadata?: Record<string, unknown> | null;
    toEntity?: { id: string; name: string; type: string } | null;
  }>;
  incomingRelations?: Array<{
    id: string;
    type: string;
    metadata?: Record<string, unknown> | null;
    fromEntity?: { id: string; name: string; type: string } | null;
  }>;
};

type LoreDoc = {
  id: string;
  title: string;
  textIndex?: string | null;
  createdAt: string;
};

type PrepBriefingItem = {
  id: string;
  title: string;
  summary: string;
  contexts: LorePrepContext[];
  focuses: LorePrepFocus[];
  campaignNames: string[];
  visibility: "MASTER" | "PLAYERS";
  href: string;
};

type PoliticalSummary = {
  institutions: number;
  offices: number;
  activeTensions: number;
  fragilities: string[];
};

function parsePoliticsMetadata(metadata: unknown) {
  const meta = metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>) : undefined;
  const politics =
    meta?.politics && typeof meta.politics === "object"
      ? (meta.politics as Record<string, unknown>)
      : undefined;

  return {
    fragilities: Array.isArray(politics?.fragilities)
      ? politics.fragilities.filter((item): item is string => typeof item === "string")
      : [],
  };
}

type InspectItem =
  | { type: "campaign"; title: string; subtitle: string; body: string; href: string }
  | { type: "event"; title: string; subtitle: string; body: string; href?: string }
  | { type: "memory"; item: WorldEvent; href?: string };

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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

function formatMonthBucketLabel(monthKey: string) {
  const [yearRaw, monthRaw] = monthKey.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return monthKey;
  }
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function isInsideTimeWindow(value: string, window: "ALL" | "7D" | "30D" | "90D") {
  if (window === "ALL") return true;
  const eventTime = new Date(value).getTime();
  if (Number.isNaN(eventTime)) return true;
  const days = window === "7D" ? 7 : window === "30D" ? 30 : 90;
  return eventTime >= Date.now() - days * 24 * 60 * 60 * 1000;
}

function formatEvent(event: WorldEvent) {
  if (event.text) return event.text;

  const payload = event.payload ?? {};
  switch (event.type) {
    case "WORLD_CREATED":
      return `Mundo criado: ${String(payload["title"] ?? "Sem titulo")}`;
    case "CAMPAIGN_CREATED":
      return `Nova campanha: ${String(payload["name"] ?? "Sem nome")}`;
    case "CHARACTER_CREATED":
      return `Novo personagem: ${String(payload["name"] ?? "Sem nome")}`;
    case "NPC_DEATH":
      return "Uma morte importante entrou para a memoria do mundo.";
    case "COMBAT_STARTED":
      return "Um novo confronto foi iniciado.";
    default:
      return event.type.replaceAll("_", " ");
  }
}

function buildMemoryInspectBody(
  event: WorldEvent,
  options?: {
    campaignName?: string;
    linkedEntityNames?: string[];
    sessionHref?: string;
  }
) {
  const parts = [
    formatMemoryEventText(event),
    `Registrado em ${formatDateTime(event.ts)}.`,
    `Escopo: ${event.scope}.`,
    `Visibilidade: ${formatMemoryEventVisibility(event.visibility)}.`,
  ];

  if (options?.campaignName) {
    parts.push(`Campanha: ${options.campaignName}.`);
  }

  if (options?.linkedEntityNames?.length) {
    parts.push(`Entidades ligadas: ${options.linkedEntityNames.join(", ")}.`);
  } else {
    const linkedCount = getMemoryEventLinkedEntityCount(event);
    if (linkedCount > 0) {
      parts.push(`Entidades ligadas: ${linkedCount}.`);
    }
  }

  if (options?.sessionHref) {
    parts.push("Existe uma sessao ligada para abrir no fluxo tatico.");
  }

  return parts.join("\n");
}

function formatPrepFocus(focus: LorePrepFocus) {
  switch (focus) {
    case "foco_de_mesa":
      return "Foco de mesa";
    case "gancho":
      return "Gancho";
    case "arco":
      return "Arco";
    case "segredo":
      return "Segredo";
    case "referencia":
      return "Referencia";
    default:
      return focus;
  }
}

function formatPrepContext(context: LorePrepContext) {
  switch (context) {
    case "politica":
      return "Politica";
    case "casas":
      return "Casas";
    case "lugares":
      return "Lugares";
    case "figuras":
      return "Figuras";
    case "geral":
      return "Base";
    default:
      return context;
  }
}

function getPrepScore(
  doc: LoreDoc,
  entities: PoliticalCodexEntity[],
  nextCampaignId?: string
) {
  const meta = parseLoreTextIndex(doc.textIndex);
  const linked = meta.linkedEntityIds
    .map((id) => entities.find((entity) => entity.id === id))
    .filter((entity): entity is PoliticalCodexEntity => Boolean(entity));
  const campaigns = inferLoreCampaignIds(linked);

  let score = 0;
  if (nextCampaignId && campaigns.includes(nextCampaignId)) score += 60;
  if (!nextCampaignId && campaigns.length === 0) score += 20;
  if (meta.prepFocuses.includes("foco_de_mesa")) score += 30;
  if (meta.prepFocuses.includes("gancho")) score += 20;
  if (meta.prepFocuses.includes("arco")) score += 12;
  if (meta.prepFocuses.includes("referencia")) score += 6;
  if (meta.prepFocuses.includes("segredo")) score += 4;
  if (meta.visibility === "MASTER") score += 4;
  score += Math.min(meta.linkedEntityIds.length, 4);
  return score;
}

export default function WorldDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { confirmDestructive, notifyError, notifySuccess } = useAppFeedback();
  const worldId = params?.id as string;

  const [world, setWorld] = useState<World | null>(null);
  const [events, setEvents] = useState<WorldEvent[]>([]);
  const [loreDocs, setLoreDocs] = useState<LoreDoc[]>([]);
  const [codexEntities, setCodexEntities] = useState<PoliticalCodexEntity[]>([]);
  const [politics, setPolitics] = useState<PoliticalSummary>({
    institutions: 0,
    offices: 0,
    activeTensions: 0,
    fragilities: [],
  });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const campaignForm = useForm<CampaignCreateFormValues>({
    resolver: zodResolver(CampaignCreateSchema.pick({ name: true, description: true })),
    defaultValues: initialForm,
  });
  const [inspectItem, setInspectItem] = useState<InspectItem | null>(null);
  const [memoryQuery, setMemoryQuery] = useState("");
  const [memoryVisibility, setMemoryVisibility] = useState<"ALL" | "MASTER" | "PLAYERS">("ALL");
  const [memoryTone, setMemoryTone] = useState<"ALL" | "summary" | "change" | "death" | "note">("ALL");
  const [memoryTimeFilter, setMemoryTimeFilter] = useState<"ALL" | "7D" | "30D" | "90D">("ALL");
  const [crossMemoryEvents, setCrossMemoryEvents] = useState<WorldEvent[] | null>(null);
  const [crossMemoryLoading, setCrossMemoryLoading] = useState(false);
  const [crossMemoryScoreById, setCrossMemoryScoreById] = useState<Record<string, number>>({});
  const [crossMemoryTemporal, setCrossMemoryTemporal] = useState<MemoryTemporalMeta | null>(null);

  const loadWorld = useCallback(async () => {
    setLoading(true);
    try {
      const [worldRes, eventsRes, codexRes, loreRes] = await Promise.all([
        fetch(`/api/worlds/${worldId}`, { cache: "no-store" }),
        fetch(`/api/worlds/${worldId}/events?limit=12`, { cache: "no-store" }),
        fetch(`/api/worlds/${worldId}/codex?limit=240`, { cache: "no-store" }),
        fetch(`/api/ruleset-docs?worldId=${worldId}&type=LORE`, { cache: "no-store" }),
      ]);

      const worldPayload = await worldRes.json().catch(() => ({}));
      const eventPayload = await eventsRes.json().catch(() => ({}));
      const codexPayload = await codexRes.json().catch(() => ({}));
      const lorePayload = await loreRes.json().catch(() => ({}));

      if (worldRes.ok && worldPayload.data) setWorld(worldPayload.data as World);
      if (eventsRes.ok && eventPayload.data) setEvents(eventPayload.data as WorldEvent[]);
      if (loreRes.ok && Array.isArray(lorePayload.data)) setLoreDocs(lorePayload.data as LoreDoc[]);
      if (codexPayload?.data?.entities) {
        const entities = codexPayload.data.entities as PoliticalCodexEntity[];
        setCodexEntities(entities);
        const institutions = entities.filter((entity) => entity.type === "institution").length;
        const offices = entities.filter((entity) => entity.type === "office").length;
        const activeTensions = entities.reduce((count, entity) => {
          const relations = [...(entity.outgoingRelations ?? []), ...(entity.incomingRelations ?? [])];
          return (
            count +
            relations.filter((relation) =>
              ["rivals_with", "bound_by_pact", "owes_allegiance_to", "pressures", "undermines"].includes(relation.type)
            ).length
          );
        }, 0);
        const fragilities = Array.from(
          new Set(
            entities.flatMap((entity) => parsePoliticsMetadata(entity.metadata).fragilities)
          )
        ).slice(0, 4);
        setPolitics({
          institutions,
          offices,
          activeTensions: Math.ceil(activeTensions / 2),
          fragilities,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [worldId]);

  useEffect(() => {
    if (worldId) void loadWorld();
  }, [loadWorld, worldId]);

  async function handleCreateCampaign(values: CampaignCreateFormValues) {
    try {
      const parsed = CampaignCreateSchema.parse({ ...values, worldId });
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (!response.ok) throw new Error("Erro ao criar campanha");
      campaignForm.reset(initialForm);
      setDialogOpen(false);
      notifySuccess("Campanha criada.");
      await loadWorld();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado ao salvar campanha";
      campaignForm.setError("root", { type: "server", message });
      notifyError("Falha ao salvar campanha", message, true);
    }
  }

  async function handleArchiveWorld() {
    const confirmed = await confirmDestructive({
      title: "Arquivar mundo?",
      description: "O mundo sera movido para arquivados e removido do fluxo ativo.",
      confirmText: "Arquivar",
      cancelText: "Cancelar",
      variant: "destructive",
    });
    if (!confirmed) return;
    await fetch(`/api/worlds/${worldId}`, { method: "DELETE" });
    notifySuccess("Mundo arquivado.");
    router.push("/app/worlds");
  }

  const spotlightCampaign = useMemo(() => world?.campaigns?.[0] ?? null, [world]);
  const recentEvents = useMemo(() => events.slice(0, 8), [events]);
  const memoryEvents = useMemo(
    () => events.filter((event) => isMemoryWorldEvent(event)),
    [events]
  );
  const filteredMemoryEvents = useMemo(() => {
    const query = memoryQuery.trim().toLowerCase();
    return memoryEvents.filter((event) => {
      if (memoryVisibility !== "ALL" && event.visibility !== memoryVisibility) return false;
      if (memoryTone !== "ALL" && getMemoryEventTone(event) !== memoryTone) return false;
      if (!isInsideTimeWindow(event.ts, memoryTimeFilter)) return false;
      if (query && !getMemoryEventSearchText(event).includes(query)) return false;
      return true;
    });
  }, [memoryEvents, memoryQuery, memoryTimeFilter, memoryTone, memoryVisibility]);
  useEffect(() => {
    const normalizedQuery = memoryQuery.trim();
    if (!worldId || normalizedQuery.length < 2) {
      setCrossMemoryEvents(null);
      setCrossMemoryLoading(false);
      setCrossMemoryScoreById({});
      setCrossMemoryTemporal(null);
      return;
    }

    let cancelled = false;
    setCrossMemoryLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: normalizedQuery,
          visibility: memoryVisibility,
          tone: memoryTone,
          timeWindow: memoryTimeFilter,
          limit: "120",
        });
        const response = await fetch(`/api/worlds/${worldId}/memory/search?${params.toString()}`, {
          cache: "no-store",
        });
        const payload = await response.json().catch(() => ({}));
        if (!cancelled) {
          setCrossMemoryEvents((payload.data as WorldEvent[] | undefined) ?? []);
          setCrossMemoryScoreById((payload.meta?.scores as Record<string, number> | undefined) ?? {});
          setCrossMemoryTemporal((payload.meta?.temporal as MemoryTemporalMeta | undefined) ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("World cross memory search failed", error);
          setCrossMemoryEvents([]);
          setCrossMemoryScoreById({});
          setCrossMemoryTemporal(null);
        }
      } finally {
        if (!cancelled) setCrossMemoryLoading(false);
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [memoryQuery, memoryTimeFilter, memoryTone, memoryVisibility, worldId]);
  const isCrossMemoryMode = memoryQuery.trim().length >= 2;
  const visibleMemoryEvents =
    isCrossMemoryMode && crossMemoryEvents !== null ? crossMemoryEvents : filteredMemoryEvents;
  const campaignNameById = useMemo(
    () => new Map((world?.campaigns ?? []).map((campaign) => [campaign.id, campaign.name])),
    [world?.campaigns]
  );
  const entityNameById = useMemo(
    () => new Map(codexEntities.map((entity) => [entity.id, entity.name])),
    [codexEntities]
  );
  const memoryInspectRelations = useMemo(() => {
    if (inspectItem?.type !== "memory") return [];
    const linked = new Set(getMemoryEventLinkedEntityIds(inspectItem.item));
    if (linked.size === 0) return [];

    const byId = new Map<
      string,
      {
        id: string;
        type: string;
        fromEntityId: string;
        fromEntityName: string;
        toEntityId: string;
        toEntityName: string;
      }
    >();

    for (const entity of codexEntities) {
      if (!linked.has(entity.id)) continue;

      for (const relation of entity.outgoingRelations ?? []) {
        if (!relation.toEntity) continue;
        byId.set(relation.id, {
          id: relation.id,
          type: relation.type,
          fromEntityId: entity.id,
          fromEntityName: entity.name,
          toEntityId: relation.toEntity.id,
          toEntityName: relation.toEntity.name,
        });
      }

      for (const relation of entity.incomingRelations ?? []) {
        if (!relation.fromEntity) continue;
        byId.set(relation.id, {
          id: relation.id,
          type: relation.type,
          fromEntityId: relation.fromEntity.id,
          fromEntityName: relation.fromEntity.name,
          toEntityId: entity.id,
          toEntityName: entity.name,
        });
      }
    }

    return Array.from(byId.values()).slice(0, 6);
  }, [codexEntities, inspectItem]);
  const inspectHref = inspectItem?.type === "campaign" ? inspectItem.href : null;
  const activeInspectHref = inspectItem?.type === "memory" ? inspectItem.href : inspectHref;
  const prepBriefing = useMemo<PrepBriefingItem[]>(() => {
    const nextCampaignId = world?.nextSession?.campaign?.id;
    return [...loreDocs]
      .sort((left, right) => {
        const scoreDiff =
          getPrepScore(right, codexEntities, nextCampaignId) -
          getPrepScore(left, codexEntities, nextCampaignId);
        if (scoreDiff !== 0) return scoreDiff;
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      })
      .slice(0, 4)
      .map((doc) => {
        const meta = parseLoreTextIndex(doc.textIndex);
        const linked = meta.linkedEntityIds
          .map((id) => codexEntities.find((entity) => entity.id === id))
          .filter((entity): entity is PoliticalCodexEntity => Boolean(entity));
        const contexts = inferLorePrepContexts(linked);
        const campaignNames = inferLoreCampaignIds(linked)
          .map((campaignId) => world?.campaigns.find((campaign) => campaign.id === campaignId)?.name)
          .filter((name): name is string => Boolean(name));

        return {
          id: doc.id,
          title: doc.title,
          summary: meta.summary || "Bloco do corpus pronto para consulta no prep da mesa.",
          contexts,
          focuses: meta.prepFocuses,
          campaignNames,
          visibility: meta.visibility,
          href: `/app/worlds/${worldId}/forge/lore?docId=${doc.id}`,
        };
      });
  }, [codexEntities, loreDocs, world, worldId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[340px] w-full rounded-[32px]" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.8fr)]">
          <Skeleton className="h-[640px] rounded-[30px]" />
          <Skeleton className="h-[640px] rounded-[30px]" />
        </div>
      </div>
    );
  }

  if (!world) {
    return (
      <EmptyState
        title="Mundo nao encontrado"
        description="O cockpit nao conseguiu localizar este mundo. Volte para a biblioteca e tente novamente."
        icon={<Globe2 className="h-6 w-6" />}
        action={
          <Button onClick={() => router.push("/app/worlds")}>
            Voltar para mundos
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6 pb-8 xl:space-y-7">
      <section
        className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10"
        style={{
          backgroundImage: world.coverImage
            ? `linear-gradient(120deg, rgba(8,8,13,0.92), rgba(12,10,13,0.8)), url(${world.coverImage})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.78fr)]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">{world.status}</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">
                {world.campaigns.length} campanhas
              </Badge>
            </div>

            <div className="space-y-3">
              <p className="section-eyebrow">Cockpit do mundo</p>
              <h1 className="max-w-4xl text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl xl:text-6xl">
                {world.title}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                {world.description || "Este mundo ainda nao tem descricao registrada, mas o cockpit ja esta pronto para operar campanhas, memoria e contexto."}
              </p>
            </div>

            <ModeSwitcher worldId={worldId} />

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="cinematic-frame rounded-2xl p-4">
                <p className="section-eyebrow">Campanhas</p>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-3xl font-black text-foreground">{world.campaigns.length}</span>
                  <Swords className="h-5 w-5 text-amber-300/80" />
                </div>
              </div>
              <div className="cinematic-frame rounded-2xl p-4">
                <p className="section-eyebrow">NPCs</p>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-3xl font-black text-foreground">{world.stats.npcs}</span>
                  <Users2 className="h-5 w-5 text-primary/80" />
                </div>
              </div>
              <div className="cinematic-frame rounded-2xl p-4">
                <p className="section-eyebrow">Locais</p>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-3xl font-black text-foreground">{world.stats.locations}</span>
                  <MapPin className="h-5 w-5 text-sky-200/80" />
                </div>
              </div>
              <div className="cinematic-frame rounded-2xl p-4">
                <p className="section-eyebrow">Sessoes</p>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-3xl font-black text-foreground">{world.stats.sessions}</span>
                  <Activity className="h-5 w-5 text-emerald-300/80" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Nova campanha
                  </Button>
                </DialogTrigger>
                <DialogContent className="chrome-panel border-white/10 bg-card/85">
                  <DialogHeader>
                    <DialogTitle>Iniciar nova campanha</DialogTitle>
                  </DialogHeader>
                  <Form {...campaignForm}>
                    <form onSubmit={campaignForm.handleSubmit(handleCreateCampaign)} className="space-y-4">
                      <FormField
                        control={campaignForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome da campanha" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={campaignForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descricao</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Descricao curta"
                                value={field.value ?? ""}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {campaignForm.formState.errors.root?.message ? (
                        <p className="text-sm text-destructive">
                          {campaignForm.formState.errors.root.message}
                        </p>
                      ) : null}
                      <Button type="submit" className="w-full" disabled={campaignForm.formState.isSubmitting}>
                        {campaignForm.formState.isSubmitting ? "Criando jornada..." : "Criar jornada"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="lg" className="border-white/10 bg-white/5" onClick={loadWorld}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Proxima batida</p>
              {world.nextSession ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-amber-100">
                    <CalendarClock className="h-4 w-4 text-amber-300/80" />
                    Sessao agendada
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                    {world.nextSession.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(world.nextSession.scheduledAt)} · {world.nextSession.campaign.name}
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-muted-foreground">
                  Nenhuma sessao futura agendada para este mundo.
                </div>
              )}
            </div>

            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Acesso rapido</p>
              <div className="mt-4 grid gap-3">
                <Button
                  variant="outline"
                  className="justify-between border-white/10 bg-white/5"
                  onClick={() => router.push(`/app/worlds/${worldId}/forge`)}
                >
                  Forja do Mundo
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="justify-between border-white/10 bg-white/5"
                  onClick={() => router.push(`/app/worlds/${worldId}/codex`)}
                >
                  Codex
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="justify-between border-white/10 bg-white/5"
                  onClick={() => router.push(`/app/worlds/${worldId}/campaigns`)}
                >
                  Campanhas
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="justify-between border-white/10 bg-white/5"
                  onClick={() => router.push(`/app/worlds/${worldId}/npcs`)}
                >
                  NPCs
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="justify-between border-white/10 bg-white/5"
                  onClick={() => router.push(`/app/worlds/${worldId}/locations`)}
                >
                  Locais
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="justify-between border-white/10 bg-white/5"
                  onClick={() => router.push(`/app/worlds/${worldId}/visual`)}
                >
                  Biblioteca visual
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="justify-between border-white/10 bg-white/5"
                  onClick={() => router.push(`/app/worlds/${worldId}/forge/politics`)}
                >
                  Politica
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="justify-between border-white/10 bg-white/5"
                  onClick={() => router.push(`/app/worlds/${worldId}/forge/timeline`)}
                >
                  Cronologia
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="justify-between border-white/10 bg-white/5"
                  onClick={() => router.push(`/app/worlds/${worldId}/forge/lore`)}
                >
                  Lore-base
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="justify-between border-white/10 bg-white/5"
                  onClick={() => router.push(`/app/worlds/${worldId}/compendium`)}
                >
                  Compendio
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Zona de decisao</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Flame className="h-4 w-4 text-amber-300/80" />
                    Forja do mundo
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Entre na oficina para fechar conceito, tom, pilares e o proximo foco criativo.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3 w-full justify-between border-white/10 bg-white/5"
                    onClick={() => router.push(`/app/worlds/${worldId}/forge`)}
                  >
                    Abrir forja
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Settings2 className="h-4 w-4 text-primary/80" />
                    Estado do mundo
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Criado em {formatDate(world.createdAt)} e atualizado em {formatDate(world.updatedAt)}.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Crown className="h-4 w-4 text-amber-300/80" />
                    Leitura politica
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {politics.institutions} instituicoes, {politics.offices} cargos e{" "}
                    {politics.activeTensions} tensoes estruturais ativas.
                  </p>
                  {politics.fragilities.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {politics.fragilities.map((fragility) => (
                        <Badge
                          key={fragility}
                          className="border-red-300/20 bg-red-300/10 text-red-100"
                        >
                          {fragility}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  <Button
                    variant="outline"
                    className="mt-3 w-full justify-between border-white/10 bg-white/5"
                    onClick={() => router.push(`/app/worlds/${worldId}/forge/politics`)}
                  >
                    Abrir politica
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="destructive" className="w-full" onClick={handleArchiveWorld}>
                  <Trash className="mr-2 h-4 w-4" />
                  Arquivar mundo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid-shell">
        <div className="space-y-6">
          <section className="chrome-panel rounded-[30px] p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="section-eyebrow">Continuar a operar</p>
                <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                  Campanhas em campo
                </h2>
              </div>
              <Button asChild variant="outline" className="border-white/10 bg-white/5">
                <Link href={`/app/worlds/${worldId}/campaigns`}>Ver todas</Link>
              </Button>
            </div>

            {world.campaigns.length === 0 ? (
              <EmptyState
                title="Nenhuma campanha"
                description="Crie a primeira campanha para transformar este mundo em operacao ativa."
                icon={<Swords className="h-6 w-6" />}
                action={
                  <Button onClick={() => setDialogOpen(true)}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Criar campanha
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                {world.campaigns.map((campaign, index) => (
                  <Card
                    key={campaign.id}
                    className="overflow-hidden rounded-[28px] border-white/10 bg-black/20 transition hover:border-primary/25"
                  >
                    <CardContent className="p-0">
                      <div
                        className="flex min-h-[196px] flex-col justify-between p-5 xl:min-h-[188px]"
                        style={{
                          background:
                            index % 2 === 0
                              ? "linear-gradient(135deg, rgba(188,74,63,0.18), rgba(9,9,14,0.88))"
                              : "linear-gradient(135deg, rgba(213,162,64,0.12), rgba(9,9,14,0.88))",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <Badge className="border-white/10 bg-black/30 text-white">Campanha</Badge>
                          <span className="text-xs uppercase tracking-[0.18em] text-white/55">
                            {formatDate(campaign.updatedAt)}
                          </span>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h3 className="text-2xl font-black uppercase tracking-[0.04em] text-white">
                              {campaign.name}
                            </h3>
                            <p className="mt-2 text-sm text-white/66">
                              Sala: {campaign.roomCode || "sem codigo publico"}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              className="flex-1 justify-between bg-white text-black hover:bg-white/90"
                              onClick={() => router.push(`/app/campaign/${campaign.id}`)}
                            >
                              Abrir campanha
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              className="border-white/10 bg-white/5"
                              onClick={() =>
                                setInspectItem({
                                  type: "campaign",
                                  title: campaign.name,
                                  subtitle: "Leitura rapida da campanha",
                                  body: `Atualizada em ${formatDateTime(campaign.updatedAt)}.\nCodigo de sala: ${campaign.roomCode || "nao definido"}.`,
                                  href: `/app/campaign/${campaign.id}`,
                                })
                              }
                            >
                              <LayoutGrid className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="chrome-panel rounded-[30px] p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="section-eyebrow">Cadencia do mundo</p>
                <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                  Linha viva de eventos
                </h2>
              </div>
              <Button asChild variant="outline" className="border-white/10 bg-white/5">
                <Link href={`/app/worlds/${worldId}/memory`}>Abrir memoria</Link>
              </Button>
            </div>

            {recentEvents.length === 0 ? (
              <EmptyState
                title="Nenhum evento ainda"
                description="Assim que o mundo registrar fatos, a memoria viva passa a aparecer aqui."
                icon={<Activity className="h-6 w-6" />}
              />
            ) : (
              <div className="grid gap-3 2xl:grid-cols-2">
                {recentEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className="w-full rounded-[24px] border border-white/8 bg-white/4 p-4 text-left transition hover:border-primary/20 hover:bg-white/6"
                    onClick={() =>
                      setInspectItem({
                        type: "event",
                        title: formatEvent(event),
                        subtitle: `${event.type} · ${event.scope}`,
                        body: `Registrado em ${formatDateTime(event.ts)}.\nVisibilidade: ${event.visibility}.`,
                      })
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="border-white/10 bg-black/30 text-white">{event.type}</Badge>
                          <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            {formatDateTime(event.ts)}
                          </span>
                        </div>
                        <p className="text-sm leading-6 text-foreground">{formatEvent(event)}</p>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 text-white/35" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="chrome-panel rounded-[30px] p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="section-eyebrow">Memoria consolidada</p>
                <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                  O que ficou da mesa
                </h2>
              </div>
              <Button asChild variant="outline" className="border-white/10 bg-white/5">
                <Link href={`/app/worlds/${worldId}/codex`}>Abrir Codex</Link>
              </Button>
            </div>

            {memoryEvents.length === 0 ? (
              <div className="rounded-[24px] border border-white/8 bg-white/4 p-4 text-sm text-muted-foreground">
                Ainda nao existe memoria consolidada neste mundo.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                  <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.6fr))]">
                    <Input
                      value={memoryQuery}
                      onChange={(currentEvent) => setMemoryQuery(currentEvent.target.value)}
                      placeholder="Buscar por morte, ausencia, mudanca, sessao..."
                    />
                    <SelectField
                      className="h-10 border-white/10 bg-black/20 px-3 text-sm text-foreground"
                      value={memoryVisibility}
                      onValueChange={(value) => setMemoryVisibility(value as "ALL" | "MASTER" | "PLAYERS")}
                      options={[
                        { value: "ALL", label: "Toda visibilidade" },
                        { value: "PLAYERS", label: "Publico" },
                        { value: "MASTER", label: "Mestre" },
                      ]}
                    />
                    <SelectField
                      className="h-10 border-white/10 bg-black/20 px-3 text-sm text-foreground"
                      value={memoryTone}
                      onValueChange={(value) =>
                        setMemoryTone(value as "ALL" | "summary" | "change" | "death" | "note")
                      }
                      options={[
                        { value: "ALL", label: "Todo tipo" },
                        { value: "summary", label: "Resumo" },
                        { value: "change", label: "Mudanca" },
                        { value: "death", label: "Morte" },
                        { value: "note", label: "Nota" },
                      ]}
                    />
                    <SelectField
                      className="h-10 border-white/10 bg-black/20 px-3 text-sm text-foreground"
                      value={memoryTimeFilter}
                      onValueChange={(value) => setMemoryTimeFilter(value as "ALL" | "7D" | "30D" | "90D")}
                      options={[
                        { value: "ALL", label: "Todo periodo" },
                        { value: "7D", label: "Ultimos 7 dias" },
                        { value: "30D", label: "Ultimos 30 dias" },
                        { value: "90D", label: "Ultimos 90 dias" },
                      ]}
                    />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {visibleMemoryEvents.length} eventos visiveis neste recorte
                    {isCrossMemoryMode ? " · busca transversal ativa" : ""}
                  </p>
                  {isCrossMemoryMode && crossMemoryTemporal ? (
                    <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Pulso temporal da busca
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge className="border-white/10 bg-white/5 text-white/75">
                          7d: {crossMemoryTemporal.last7d}
                        </Badge>
                        <Badge className="border-white/10 bg-white/5 text-white/75">
                          30d: {crossMemoryTemporal.last30d}
                        </Badge>
                        <Badge className="border-white/10 bg-white/5 text-white/75">
                          90d: {crossMemoryTemporal.last90d}
                        </Badge>
                        <Badge className="border-white/10 bg-white/5 text-white/75">
                          {'>'}90d: {crossMemoryTemporal.older}
                        </Badge>
                      </div>
                      {crossMemoryTemporal.byMonth.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {crossMemoryTemporal.byMonth.slice(0, 4).map((bucket) => (
                            <Badge key={bucket.month} className="border-amber-300/20 bg-amber-300/10 text-amber-100">
                              {formatMonthBucketLabel(bucket.month)}: {bucket.count}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {crossMemoryLoading ? (
                  <div className="rounded-[24px] border border-white/8 bg-white/4 p-4 text-sm text-muted-foreground">
                    Buscando memoria transversal...
                  </div>
                ) : visibleMemoryEvents.length === 0 ? (
                  <div className="rounded-[24px] border border-white/8 bg-white/4 p-4 text-sm text-muted-foreground">
                    {isCrossMemoryMode
                      ? "Nenhum evento de memoria encontrado na busca transversal."
                      : "Nenhum evento de memoria corresponde aos filtros atuais."}
                  </div>
                ) : (
                  <div className="grid gap-3 2xl:grid-cols-2">
                    {visibleMemoryEvents.slice(0, 10).map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        className="w-full rounded-[24px] border border-white/8 bg-white/4 p-4 text-left transition hover:border-primary/20 hover:bg-white/6"
                        onClick={() =>
                          setInspectItem({
                            type: "memory",
                            item: event,
                            href: event.campaignId ? `/app/campaign/${event.campaignId}` : undefined,
                          })
                        }
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              <Badge
                                className={
                                  getMemoryEventTone(event) === "death"
                                    ? "border-red-300/20 bg-red-300/10 text-red-100"
                                    : getMemoryEventTone(event) === "change"
                                      ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                                      : "border-primary/20 bg-primary/10 text-primary"
                                }
                              >
                                {formatMemoryEventType(event.type)}
                              </Badge>
                              <Badge className="border-white/10 bg-black/30 text-white">
                                {formatMemoryEventVisibility(event.visibility)}
                              </Badge>
                              <Badge className="border-white/10 bg-white/5 text-white/75">
                                {formatMemoryEventKind(event)}
                              </Badge>
                              <Badge className="border-white/10 bg-white/5 text-white/75">
                                {formatMemoryEventTemporalLabel(event.ts)}
                              </Badge>
                              {isCrossMemoryMode ? (
                                <Badge className="border-emerald-400/25 bg-emerald-500/10 text-emerald-100">
                                  Relevancia {crossMemoryScoreById[event.id] ?? 0}
                                </Badge>
                              ) : null}
                            </div>
                            <p className="text-sm leading-6 text-foreground">{formatMemoryEventText(event)}</p>
                            {event.campaignId ? (
                              <p className="text-xs uppercase tracking-[0.14em] text-amber-100/80">
                                {campaignNameById.get(event.campaignId) || "Campanha ligada"}
                              </p>
                            ) : null}
                          </div>
                          <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            {formatDateTime(event.ts)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="chrome-panel rounded-[30px] p-6">
            <p className="section-eyebrow">Painel tatico</p>
            <div className="mt-4 space-y-4">
              <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Crown className="h-4 w-4 text-primary/80" />
                  Proximo passo forte
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  O Codex do Mundo entrou no shell como a nova camada estrutural de entidades e consulta.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <BookOpenText className="h-4 w-4 text-amber-300/80" />
                  Camada atual
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Campanhas, eventos, atalhos e memoria recente integrados em uma superficie unica.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-violet-200/80" />
                  Prep imediato
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {world.nextSession?.campaign?.name
                    ? `Lore priorizado para a proxima mesa de ${world.nextSession.campaign.name}.`
                    : "Lore priorizado para a proxima batida criativa deste mundo."}
                </p>
                {prepBriefing.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {prepBriefing.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => router.push(item.href)}
                        className="w-full rounded-2xl border border-white/8 bg-black/20 p-3 text-left transition hover:border-primary/25 hover:bg-black/30"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {item.focuses.slice(0, 2).map((focus) => (
                            <Badge key={focus} className="border-violet-300/20 bg-violet-300/10 text-violet-100">
                              {formatPrepFocus(focus)}
                            </Badge>
                          ))}
                          {item.contexts.slice(0, 2).map((context) => (
                            <Badge key={context} className="border-white/10 bg-white/5 text-white/75">
                              {formatPrepContext(context)}
                            </Badge>
                          ))}
                          <Badge
                            className={
                              item.visibility === "MASTER"
                                ? "border-red-300/20 bg-red-300/10 text-red-100"
                                : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                            }
                          >
                            {item.visibility === "MASTER" ? "Mestre" : "Revelavel"}
                          </Badge>
                        </div>
                        <h4 className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
                          {item.title}
                        </h4>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                        {item.campaignNames.length > 0 ? (
                          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-amber-100/80">
                            {item.campaignNames.slice(0, 2).join(" · ")}
                          </p>
                        ) : (
                          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/45">
                            Base do mundo
                          </p>
                        )}
                      </button>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full justify-between border-white/10 bg-white/5"
                      onClick={() => router.push(`/app/worlds/${worldId}/forge/lore`)}
                    >
                      Abrir corpus completo
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="mt-3 rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-muted-foreground">
                    Ainda nao existe lore priorizado para a proxima mesa.
                  </div>
                )}
              </div>

              <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MapIcon className="h-4 w-4 text-sky-200/80" />
                  Areas ligadas
                </div>
                <div className="mt-3 grid gap-2">
                  <Button
                    variant="outline"
                    className="justify-between border-white/10 bg-white/5"
                    onClick={() => router.push(`/app/worlds/${worldId}/map`)}
                  >
                    Atlas do mundo
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-between border-white/10 bg-white/5"
                    onClick={() => router.push(`/app/worlds/${worldId}/visual`)}
                  >
                    Biblioteca visual
                    <Images className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-between border-white/10 bg-white/5"
                    onClick={() => router.push(`/app/worlds/${worldId}/forge/lore`)}
                  >
                    Lore-base
                    <BookOpenText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-between border-white/10 bg-white/5"
                    onClick={() => router.push(`/app/worlds/${worldId}/characters`)}
                  >
                    Personagens
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {spotlightCampaign ? (
            <section className="chrome-panel rounded-[30px] p-6">
              <p className="section-eyebrow">Campanha em destaque</p>
              <div className="mt-4 space-y-4">
                <h3 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                  {spotlightCampaign.name}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  Ultima atualizacao em {formatDateTime(spotlightCampaign.updatedAt)}.
                </p>
                <Button className="w-full justify-between" onClick={() => router.push(`/app/campaign/${spotlightCampaign.id}`)}>
                  Entrar na campanha
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {inspectItem ? (
        <CockpitDetailSheet
          open={inspectItem !== null}
          onOpenChange={(open) => !open && setInspectItem(null)}
          badge={
            inspectItem.type === "campaign"
              ? "Quick inspect"
              : inspectItem.type === "memory"
                ? "Memoria do mundo"
                : "Evento do mundo"
          }
          title={inspectItem.type === "memory" ? formatMemoryEventText(inspectItem.item) : inspectItem.title}
          description={
            inspectItem.type === "memory"
              ? `${formatMemoryEventType(inspectItem.item.type)} · ${formatMemoryEventVisibility(inspectItem.item.visibility)}`
              : inspectItem.subtitle
          }
          footer={
            activeInspectHref ? (
              <Button className="w-full justify-between" onClick={() => router.push(activeInspectHref)}>
                Abrir superficie completa
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : undefined
          }
        >
          <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
            <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {inspectItem.type === "memory"
                ? buildMemoryInspectBody(inspectItem.item, {
                    campaignName: inspectItem.item.campaignId
                      ? campaignNameById.get(inspectItem.item.campaignId)
                      : undefined,
                    linkedEntityNames: getMemoryEventLinkedEntityIds(inspectItem.item)
                      .map((id) => entityNameById.get(id))
                      .filter((name): name is string => Boolean(name))
                      .slice(0, 4),
                    sessionHref:
                      inspectItem.item.campaignId && inspectItem.item.sessionId
                        ? `/app/campaign/${inspectItem.item.campaignId}/forge/${inspectItem.item.sessionId}`
                        : undefined,
                  })
                : inspectItem.body}
            </p>
            {inspectItem.type === "memory" ? (
              <div className="mt-4 space-y-4">
                {isCrossMemoryMode && crossMemoryScoreById[inspectItem.item.id] !== undefined ? (
                  <p className="text-xs uppercase tracking-[0.14em] text-emerald-100/85">
                    Relevancia na busca transversal: {crossMemoryScoreById[inspectItem.item.id]}
                  </p>
                ) : null}
                {memoryInspectRelations.length > 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Relacoes ligadas ao evento
                    </p>
                    <div className="mt-2 space-y-2">
                      {memoryInspectRelations.map((relation) => (
                        <p key={relation.id} className="text-sm text-foreground">
                          <span className="font-semibold">{relation.fromEntityName}</span>
                          {" -> "}
                          <span className="text-amber-100/90">
                            {relation.type.replaceAll("_", " ")}
                          </span>
                          {" -> "}
                          <span className="font-semibold">{relation.toEntityName}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {inspectItem.item.campaignId ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 bg-white/5"
                      onClick={() => router.push(`/app/campaign/${inspectItem.item.campaignId}`)}
                    >
                      Abrir campanha
                    </Button>
                  ) : null}
                  {inspectItem.item.campaignId && inspectItem.item.sessionId ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 bg-white/5"
                      onClick={() => router.push(`/app/campaign/${inspectItem.item.campaignId}/forge/${inspectItem.item.sessionId}`)}
                    >
                      Abrir sessao
                    </Button>
                  ) : null}
                  {memoryInspectRelations.length > 0 ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 bg-white/5"
                      onClick={() => router.push(`/app/worlds/${worldId}/graph`)}
                    >
                      Abrir grafo de relacoes
                    </Button>
                  ) : null}
                  {getMemoryEventLinkedEntityIds(inspectItem.item).slice(0, 2).map((entityId) => (
                    <Button
                      key={entityId}
                      size="sm"
                      variant="outline"
                      className="border-white/10 bg-white/5"
                      onClick={() => router.push(`/app/worlds/${worldId}/codex/${entityId}`)}
                    >
                      {entityNameById.get(entityId) || "Abrir entidade"}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </CockpitDetailSheet>
      ) : null}
    </div>
  );
}
