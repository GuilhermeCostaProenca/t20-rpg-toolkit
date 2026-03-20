"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpenText,
  CalendarClock,
  Eye,
  LayoutGrid,
  ArrowDown,
  ArrowUp,
  Plus,
  RefreshCw,
  ScrollText,
  Skull,
  Sparkles,
  Swords,
  Target,
  Users2,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  inferLoreCampaignIds,
  inferLorePrepContexts,
  parseLoreTextIndex,
  type LorePrepContext,
  type LorePrepFocus,
} from "@/lib/lore";
import { getVisualKindLabel, getVisualKindPriority } from "@/lib/visual-library";
import {
  buildSessionMetadata,
  getEmptySessionForgeState,
  normalizeSessionForgeState,
  type SessionForgeBeat,
  type SessionForgeBeatStatus,
  type SessionForgeDramaticItem,
  type SessionForgeDramaticStatus,
  type SessionForgeMemoryAttendanceItem,
  type SessionForgeMemoryChangeItem,
  type SessionForgeMemoryChangeType,
  type SessionForgeMemoryDeathItem,
  type SessionForgeMemoryVisibility,
  type SessionForgeScene,
  type SessionForgeSceneStatus,
  type SessionForgeSubscene,
  type SessionForgeState,
} from "@/lib/session-forge";

type Campaign = {
  id: string;
  name: string;
  description?: string | null;
  roomCode: string;
  world: { id: string; title: string };
};

type Session = {
  id: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  scheduledAt?: string | null;
  status?: "planned" | "active" | "finished";
  updatedAt: string;
};

type CodexEntity = {
  id: string;
  name: string;
  type: string;
  subtype?: string | null;
  summary?: string | null;
  coverImageUrl?: string | null;
  portraitImageUrl?: string | null;
  images?: {
    id: string;
    url: string;
    kind?: string | null;
    caption?: string | null;
    sortOrder?: number | null;
  }[];
  campaign?: { id: string; name: string } | null;
};

type SessionVisualAsset = {
  id: string;
  entityId: string;
  entityName: string;
  entityType: string;
  kind: string;
  url: string;
  caption?: string | null;
  campaignId?: string | null;
};

type LoreDoc = {
  id: string;
  title: string;
  textIndex?: string | null;
  createdAt: string;
};

type PrepItem = {
  id: string;
  title: string;
  summary: string;
  contexts: LorePrepContext[];
  focuses: LorePrepFocus[];
  visibility: "MASTER" | "PLAYERS";
  href: string;
};

const beatStatusOptions: SessionForgeBeatStatus[] = [
  "planned",
  "optional",
  "improvised",
  "discarded",
];

const dramaticStatusOptions: SessionForgeDramaticStatus[] = [
  "planned",
  "executed",
  "delayed",
  "canceled",
];

const sceneStatusOptions: SessionForgeSceneStatus[] = [
  "planned",
  "optional",
  "improvised",
  "discarded",
];

const memoryVisibilityOptions: SessionForgeMemoryVisibility[] = ["MASTER", "PLAYERS"];

const memoryChangeTypeOptions: SessionForgeMemoryChangeType[] = [
  "world_change",
  "status",
  "discovery",
  "alliance",
  "rupture",
  "secret",
  "other",
];

function formatDateTime(value?: string | null) {
  if (!value) return "Sem agenda";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
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

function formatMemoryChangeType(type: SessionForgeMemoryChangeType) {
  switch (type) {
    case "world_change":
      return "Mudanca de mundo";
    case "status":
      return "Mudanca de status";
    case "discovery":
      return "Descoberta";
    case "alliance":
      return "Alianca";
    case "rupture":
      return "Ruptura";
    case "secret":
      return "Segredo";
    default:
      return "Outro";
  }
}

function formatMemoryVisibility(visibility: SessionForgeMemoryVisibility) {
  return visibility === "PLAYERS" ? "Publico" : "Mestre";
}

function buildVisualAssets(entities: CodexEntity[]): SessionVisualAsset[] {
  const assets = entities.flatMap((entity) => {
    const base: SessionVisualAsset[] = [];

    if (entity.coverImageUrl) {
      base.push({
        id: `cover:${entity.id}`,
        entityId: entity.id,
        entityName: entity.name,
        entityType: entity.type,
        kind: "cover",
        url: entity.coverImageUrl,
        caption: entity.summary,
        campaignId: entity.campaign?.id,
      });
    }

    if (entity.portraitImageUrl && entity.portraitImageUrl !== entity.coverImageUrl) {
      base.push({
        id: `portrait:${entity.id}`,
        entityId: entity.id,
        entityName: entity.name,
        entityType: entity.type,
        kind: "portrait",
        url: entity.portraitImageUrl,
        caption: entity.summary,
        campaignId: entity.campaign?.id,
      });
    }

    for (const image of entity.images ?? []) {
      base.push({
        id: image.id,
        entityId: entity.id,
        entityName: entity.name,
        entityType: entity.type,
        kind: image.kind || "reference",
        url: image.url,
        caption: image.caption,
        campaignId: entity.campaign?.id,
      });
    }

    return base;
  });

  const deduped = new Map<string, SessionVisualAsset>();
  for (const asset of assets) {
    const key = `${asset.entityId}:${asset.url}`;
    if (!deduped.has(key)) {
      deduped.set(key, asset);
    }
  }

  return [...deduped.values()].sort((left, right) => {
    const kindDiff = getVisualKindPriority(left.kind) - getVisualKindPriority(right.kind);
    if (kindDiff !== 0) return kindDiff;
    return left.entityName.localeCompare(right.entityName, "pt-BR");
  });
}

function buildBeat(): SessionForgeBeat {
  return {
    id: `beat-${Math.random().toString(36).slice(2, 10)}`,
    title: "",
    summary: "",
    status: "planned",
    linkedEntityIds: [],
  };
}

function buildSubscene(): SessionForgeSubscene {
  return {
    id: `subscene-${Math.random().toString(36).slice(2, 10)}`,
    title: "",
    objective: "",
    status: "planned",
    linkedEntityIds: [],
    linkedRevealIds: [],
  };
}

function buildScene(): SessionForgeScene {
  return {
    id: `scene-${Math.random().toString(36).slice(2, 10)}`,
    title: "",
    objective: "",
    status: "planned",
    linkedEntityIds: [],
    linkedRevealIds: [],
    linkedBeatIds: [],
    subscenes: [],
  };
}

function buildDramaticItem(): SessionForgeDramaticItem {
  return {
    id: `dramatic-${Math.random().toString(36).slice(2, 10)}`,
    title: "",
    notes: "",
    status: "planned",
  };
}

function buildAttendanceItem(status: "appeared" | "absent"): SessionForgeMemoryAttendanceItem {
  return {
    id: `attendance-${Math.random().toString(36).slice(2, 10)}`,
    label: "",
    status,
    notes: "",
    visibility: status === "appeared" ? "PLAYERS" : "MASTER",
  };
}

function buildDeathItem(): SessionForgeMemoryDeathItem {
  return {
    id: `death-${Math.random().toString(36).slice(2, 10)}`,
    label: "",
    notes: "",
    visibility: "MASTER",
  };
}

function buildMemoryChange(): SessionForgeMemoryChangeItem {
  return {
    id: `change-${Math.random().toString(36).slice(2, 10)}`,
    title: "",
    type: "world_change",
    notes: "",
    linkedEntityIds: [],
    visibility: "MASTER",
  };
}

function moveItem<T>(items: T[], fromIndex: number, direction: "up" | "down") {
  const nextIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

function getLoreScore(doc: LoreDoc, entities: CodexEntity[], campaignId: string) {
  const meta = parseLoreTextIndex(doc.textIndex);
  const linked = meta.linkedEntityIds
    .map((id) => entities.find((entity) => entity.id === id))
    .filter((entity): entity is CodexEntity => Boolean(entity));
  const campaignIds = inferLoreCampaignIds(linked);

  let score = 0;
  if (campaignIds.includes(campaignId)) score += 50;
  if (meta.prepFocuses.includes("foco_de_mesa")) score += 30;
  if (meta.prepFocuses.includes("gancho")) score += 20;
  if (meta.prepFocuses.includes("arco")) score += 12;
  if (meta.prepFocuses.includes("segredo")) score += 8;
  if (meta.visibility === "MASTER") score += 4;
  return score;
}

export default function SessionForgePage() {
  const params = useParams<{ id: string; sessionId: string }>();
  const router = useRouter();
  const campaignId = params?.id;
  const sessionId = params?.sessionId;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [entities, setEntities] = useState<CodexEntity[]>([]);
  const [loreDocs, setLoreDocs] = useState<LoreDoc[]>([]);
  const [forge, setForge] = useState<SessionForgeState>(getEmptySessionForgeState());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [revealingId, setRevealingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadWorkspace = useCallback(async () => {
    if (!campaignId) return;
    setLoading(true);
    setError(null);
    try {
      const campaignRes = await fetch(`/api/campaigns/${campaignId}`, { cache: "no-store" });
      const campaignPayload = await campaignRes.json().catch(() => ({}));
      if (!campaignRes.ok || !campaignPayload.data) {
        throw new Error(campaignPayload.error ?? "Nao foi possivel abrir a forja da sessao");
      }

      const nextCampaign = campaignPayload.data as Campaign;
      const [sessionsRes, codexRes, loreRes] = await Promise.all([
        fetch(`/api/campaigns/${campaignId}/sessions`, { cache: "no-store" }),
        fetch(`/api/worlds/${nextCampaign.world.id}/codex?limit=240`, { cache: "no-store" }),
        fetch(`/api/ruleset-docs?worldId=${nextCampaign.world.id}&type=LORE`, { cache: "no-store" }),
      ]);

      const sessionsPayload = await sessionsRes.json().catch(() => ({}));
      const codexPayload = await codexRes.json().catch(() => ({}));
      const lorePayload = await loreRes.json().catch(() => ({}));

      setCampaign(nextCampaign);
      setSessions((sessionsPayload.data as Session[] | undefined) ?? []);
      setEntities((codexPayload.data?.entities as CodexEntity[] | undefined) ?? []);
      setLoreDocs((lorePayload.data as LoreDoc[] | undefined) ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Erro inesperado ao abrir a forja");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === sessionId) ?? null,
    [sessionId, sessions]
  );

  useEffect(() => {
    if (selectedSession) {
      setForge(normalizeSessionForgeState(selectedSession.metadata));
    }
  }, [selectedSession]);

  const prepLore = useMemo<PrepItem[]>(() => {
    if (!campaignId) return [];
    return [...loreDocs]
      .sort((left, right) => {
        const diff = getLoreScore(right, entities, campaignId) - getLoreScore(left, entities, campaignId);
        if (diff !== 0) return diff;
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      })
      .slice(0, 5)
      .map((doc) => {
        const meta = parseLoreTextIndex(doc.textIndex);
        const linked = meta.linkedEntityIds
          .map((id) => entities.find((entity) => entity.id === id))
          .filter((entity): entity is CodexEntity => Boolean(entity));
        return {
          id: doc.id,
          title: doc.title,
          summary: meta.summary || "Bloco de lore ligado ao preparo desta sessao.",
          contexts: inferLorePrepContexts(linked),
          focuses: meta.prepFocuses,
          visibility: meta.visibility,
          href: `/app/worlds/${campaign?.world.id}/forge/lore?docId=${doc.id}`,
        };
      });
  }, [campaign?.world.id, campaignId, entities, loreDocs]);

  const forgeEntityIds = useMemo(() => {
    const ids = new Set<string>(forge.linkedEntityIds);
    for (const beat of forge.beats) {
      for (const entityId of beat.linkedEntityIds) ids.add(entityId);
    }
    for (const scene of forge.scenes) {
      for (const entityId of scene.linkedEntityIds) ids.add(entityId);
      for (const subscene of scene.subscenes) {
        for (const entityId of subscene.linkedEntityIds) ids.add(entityId);
      }
    }
    return [...ids];
  }, [forge]);

  const focusedEntities = useMemo(
    () => entities.filter((entity) => forgeEntityIds.includes(entity.id)),
    [entities, forgeEntityIds]
  );

  const prepVisualAssets = useMemo(
    () => buildVisualAssets(focusedEntities).slice(0, 20),
    [focusedEntities]
  );

  const readyScenes = useMemo(
    () =>
      forge.scenes.filter(
        (scene) =>
          scene.status !== "discarded" && (scene.linkedEntityIds.length > 0 || scene.linkedRevealIds.length > 0)
      ),
    [forge.scenes]
  );

  const memoryEntityOptions = useMemo(() => {
    if (focusedEntities.length > 0) return focusedEntities.slice(0, 18);
    return entities.slice(0, 18);
  }, [entities, focusedEntities]);

  async function handleSaveForge() {
    if (!selectedSession) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/sessions/${selectedSession.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedSession.title,
          description: selectedSession.description,
          coverUrl: selectedSession.coverUrl,
          scheduledAt: selectedSession.scheduledAt ?? undefined,
          status: selectedSession.status ?? "planned",
          metadata: buildSessionMetadata(forge, selectedSession.metadata),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? "Nao foi possivel salvar a forja da sessao");
      }
      setSessions((current) =>
        current.map((session) => (session.id === selectedSession.id ? (payload.data as Session) : session))
      );
      setMessage("Preparo salvo na propria sessao. Voce pode retomar daqui depois.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Erro inesperado ao salvar a sessao");
    } finally {
      setSaving(false);
    }
  }

  function updateBeat(beatId: string, updater: (beat: SessionForgeBeat) => SessionForgeBeat) {
    setForge((current) => ({
      ...current,
      beats: current.beats.map((beat) => (beat.id === beatId ? updater(beat) : beat)),
    }));
  }

  function updateDramaticCollection(
    key: "hooks" | "secrets" | "reveals",
    itemId: string,
    updater: (item: SessionForgeDramaticItem) => SessionForgeDramaticItem
  ) {
    setForge((current) => ({
      ...current,
      [key]: current[key].map((item) => (item.id === itemId ? updater(item) : item)),
    }));
  }

  function updateAttendanceItem(
    itemId: string,
    updater: (item: SessionForgeMemoryAttendanceItem) => SessionForgeMemoryAttendanceItem
  ) {
    setForge((current) => ({
      ...current,
      memory: {
        ...current.memory,
        attendance: current.memory.attendance.map((item) => (item.id === itemId ? updater(item) : item)),
      },
    }));
  }

  function updateDeathItem(
    itemId: string,
    updater: (item: SessionForgeMemoryDeathItem) => SessionForgeMemoryDeathItem
  ) {
    setForge((current) => ({
      ...current,
      memory: {
        ...current.memory,
        deaths: current.memory.deaths.map((item) => (item.id === itemId ? updater(item) : item)),
      },
    }));
  }

  function updateMemoryChangeItem(
    itemId: string,
    updater: (item: SessionForgeMemoryChangeItem) => SessionForgeMemoryChangeItem
  ) {
    setForge((current) => ({
      ...current,
      memory: {
        ...current.memory,
        changes: current.memory.changes.map((item) => (item.id === itemId ? updater(item) : item)),
      },
    }));
  }

  async function handleRevealNow(item: SessionForgeDramaticItem) {
    if (!campaign?.roomCode) {
      setError("A campanha precisa ter roomCode para enviar reveals para a mesa.");
      return;
    }

    setRevealingId(item.id);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: campaign.roomCode,
          type: item.imageUrl ? "image" : "note",
          title: item.title || "Revelacao sem titulo",
          content: item.notes || undefined,
          imageUrl: item.imageUrl || undefined,
          visibility: "players",
          expiresAt: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? "Nao foi possivel enviar a revelacao para a mesa");
      }

      updateDramaticCollection("reveals", item.id, (current) => ({
        ...current,
        status: "executed",
      }));
      setMessage(`Revelacao "${item.title || "sem titulo"}" enviada para a mesa.`);
    } catch (revealError) {
      setError(revealError instanceof Error ? revealError.message : "Erro inesperado ao enviar reveal");
    } finally {
      setRevealingId(null);
    }
  }

  function updateScene(sceneId: string, updater: (scene: SessionForgeScene) => SessionForgeScene) {
    setForge((current) => ({
      ...current,
      scenes: current.scenes.map((scene) => (scene.id === sceneId ? updater(scene) : scene)),
    }));
  }

  function updateSubscene(
    sceneId: string,
    subsceneId: string,
    updater: (subscene: SessionForgeSubscene) => SessionForgeSubscene
  ) {
    updateScene(sceneId, (scene) => ({
      ...scene,
      subscenes: scene.subscenes.map((subscene) =>
        subscene.id === subsceneId ? updater(subscene) : subscene
      ),
    }));
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[280px] w-full rounded-[32px]" />
        <Skeleton className="h-[920px] w-full rounded-[32px]" />
      </div>
    );
  }

  if (!campaign || !selectedSession) {
    return (
      <EmptyState
        title="Forja de sessao indisponivel"
        description={error ?? "A sessao nao foi encontrada para abrir o preparo."}
        icon={<Swords className="h-6 w-6" />}
        action={
          <Button onClick={() => router.push(campaignId ? `/app/campaign/${campaignId}` : "/app/worlds")}>
            Voltar
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
          backgroundImage: selectedSession.coverUrl
            ? `linear-gradient(120deg, rgba(8,8,13,0.92), rgba(12,10,13,0.84)), url(${selectedSession.coverUrl})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Forja de sessao</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">
                {selectedSession.status ?? "planned"}
              </Badge>
              <Badge className="border-white/10 bg-white/5 text-white/80">{campaign.name}</Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Preparacao world-first</p>
              <h1 className="max-w-4xl text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl xl:text-6xl">
                {selectedSession.title}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                Estruture briefing, roteiro, cenas e notas operacionais da sessao em cima da propria campanha.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSaveForge} disabled={saving}>
                <Sparkles className="mr-2 h-4 w-4" />
                {saving ? "Salvando..." : "Salvar preparo"}
              </Button>
              <Button
                variant="outline"
                className="border-white/10 bg-white/5"
                onClick={() => void loadWorkspace()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Recarregar
              </Button>
              <Button asChild variant="outline" className="border-white/10 bg-white/5">
                <Link href={`/app/campaign/${campaign.id}`}>
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Voltar para campanha
                </Link>
              </Button>
            </div>
            {message ? <p className="text-sm text-emerald-200">{message}</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Sessao em foco</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-amber-100">
                  <CalendarClock className="h-4 w-4 text-amber-300/80" />
                  {formatDateTime(selectedSession.scheduledAt ?? selectedSession.updatedAt)}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {selectedSession.description || "Sem briefing curto registrado ainda na sessao."}
                </p>
              </div>
            </div>

            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Acessos</p>
              <div className="mt-4 grid gap-3">
                <Button asChild variant="outline" className="justify-between border-white/10 bg-white/5">
                  <Link href={`/app/play/${campaign.id}`}>
                    Mesa ao vivo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-between border-white/10 bg-white/5">
                  <Link href={`/app/worlds/${campaign.world.id}/forge/lore`}>
                    Corpus de lore
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-between border-white/10 bg-white/5">
                  <Link href={`/app/worlds/${campaign.world.id}/visual-library`}>
                    Biblioteca visual
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]">
        <div className="space-y-6">
          <section className="chrome-panel rounded-[30px] p-6">
            <div className="mb-5 space-y-2">
              <p className="section-eyebrow">Briefing</p>
              <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                Norte da mesa
              </h2>
            </div>
            <div className="grid gap-4">
              <Input
                value={forge.currentArc}
                onChange={(event) => setForge((current) => ({ ...current, currentArc: event.target.value }))}
                placeholder="Arco atual ou eixo principal da sessao"
              />
              <Input
                value={forge.tableObjective}
                onChange={(event) =>
                  setForge((current) => ({ ...current, tableObjective: event.target.value }))
                }
                placeholder="Objetivo de mesa: o que precisa acontecer hoje"
              />
              <Textarea
                rows={5}
                value={forge.briefing}
                onChange={(event) => setForge((current) => ({ ...current, briefing: event.target.value }))}
                placeholder="Briefing do mestre para a sessao"
              />
            </div>
          </section>

          <section className="chrome-panel rounded-[30px] p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="section-eyebrow">Cenas em jogo</p>
                <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                  Estrutura de cena
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Transforme os beats em cenas jogaveis, organize subcenas e prenda entidades e revelacoes no fluxo real da mesa.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-white/10 bg-white/5"
                onClick={() => setForge((current) => ({ ...current, scenes: [...current.scenes, buildScene()] }))}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova cena
              </Button>
            </div>

            {forge.scenes.length === 0 ? (
              <EmptyState
                title="Nenhuma cena ainda"
                description="Cenas viram a espinha da mesa. Elas organizam ritmo, revelacoes e quem precisa entrar em foco."
                icon={<LayoutGrid className="h-6 w-6" />}
                action={
                  <Button onClick={() => setForge((current) => ({ ...current, scenes: [buildScene()] }))}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar primeira cena
                  </Button>
                }
              />
            ) : (
              <div className="space-y-5">
                {forge.scenes.map((scene, sceneIndex) => (
                  <div key={scene.id} className="rounded-[24px] border border-white/10 bg-white/4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
                          Cena {sceneIndex + 1}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Macrobloco que pode ser quebrado em subcenas, reveals e entidades em foco.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          className="border-white/10 bg-white/5"
                          onClick={() =>
                            setForge((current) => ({
                              ...current,
                              scenes: moveItem(current.scenes, sceneIndex, "up"),
                            }))
                          }
                          disabled={sceneIndex === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          className="border-white/10 bg-white/5"
                          onClick={() =>
                            setForge((current) => ({
                              ...current,
                              scenes: moveItem(current.scenes, sceneIndex, "down"),
                            }))
                          }
                          disabled={sceneIndex === forge.scenes.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          className="border-white/10 bg-white/5"
                          onClick={() =>
                            setForge((current) => ({
                              ...current,
                              scenes: current.scenes.filter((item) => item.id !== scene.id),
                            }))
                          }
                        >
                          Remover
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3">
                      <Input
                        value={scene.title}
                        onChange={(event) =>
                          updateScene(scene.id, (current) => ({ ...current, title: event.target.value }))
                        }
                        placeholder="Titulo da cena"
                      />
                      <Textarea
                        rows={3}
                        value={scene.objective}
                        onChange={(event) =>
                          updateScene(scene.id, (current) => ({ ...current, objective: event.target.value }))
                        }
                        placeholder="O que precisa acontecer nesta cena"
                      />
                      <div className="flex flex-wrap gap-2">
                        {sceneStatusOptions.map((status) => (
                          <Button
                            key={status}
                            type="button"
                            variant="outline"
                            className={
                              scene.status === status
                                ? "border-primary/30 bg-primary/10 text-primary"
                                : "border-white/10 bg-white/5"
                            }
                            onClick={() => updateScene(scene.id, (current) => ({ ...current, status }))}
                          >
                            {status}
                          </Button>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                          Beats-base
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {forge.beats.length > 0 ? (
                            forge.beats.map((beat) => (
                              <Button
                                key={beat.id}
                                type="button"
                                variant="outline"
                                className={
                                  scene.linkedBeatIds.includes(beat.id)
                                    ? "border-primary/30 bg-primary/10 text-primary"
                                    : "border-white/10 bg-white/5"
                                }
                                onClick={() =>
                                  updateScene(scene.id, (current) => ({
                                    ...current,
                                    linkedBeatIds: current.linkedBeatIds.includes(beat.id)
                                      ? current.linkedBeatIds.filter((item) => item !== beat.id)
                                      : [...current.linkedBeatIds, beat.id].slice(0, 6),
                                  }))
                                }
                              >
                                {beat.title || "Beat sem titulo"}
                              </Button>
                            ))
                          ) : (
                            <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-3 py-2 text-sm text-muted-foreground">
                              Crie beats antes ou use a cena como estrutura principal.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                          Entidades em cena
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {entities.slice(0, 20).map((entity) => (
                            <Button
                              key={entity.id}
                              type="button"
                              variant="outline"
                              className={
                                scene.linkedEntityIds.includes(entity.id)
                                  ? "border-primary/30 bg-primary/10 text-primary"
                                  : "border-white/10 bg-white/5"
                              }
                              onClick={() =>
                                updateScene(scene.id, (current) => ({
                                  ...current,
                                  linkedEntityIds: current.linkedEntityIds.includes(entity.id)
                                    ? current.linkedEntityIds.filter((item) => item !== entity.id)
                                    : [...current.linkedEntityIds, entity.id].slice(0, 10),
                                }))
                              }
                            >
                              {entity.name}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                          Revelacoes ligadas
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {forge.reveals.length > 0 ? (
                            forge.reveals.map((reveal) => (
                              <Button
                                key={reveal.id}
                                type="button"
                                variant="outline"
                                className={
                                  scene.linkedRevealIds.includes(reveal.id)
                                    ? "border-primary/30 bg-primary/10 text-primary"
                                    : "border-white/10 bg-white/5"
                                }
                                onClick={() =>
                                  updateScene(scene.id, (current) => ({
                                    ...current,
                                    linkedRevealIds: current.linkedRevealIds.includes(reveal.id)
                                      ? current.linkedRevealIds.filter((item) => item !== reveal.id)
                                      : [...current.linkedRevealIds, reveal.id].slice(0, 6),
                                  }))
                                }
                              >
                                {reveal.title || "Revelacao sem titulo"}
                              </Button>
                            ))
                          ) : (
                            <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-3 py-2 text-sm text-muted-foreground">
                              Crie revelacoes na camada dramatica para prende-las a cenas.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[22px] border border-white/8 bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
                            Subcenas
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Quebre a cena em entradas menores, improvisos guiados ou viradas de ritmo.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="border-white/10 bg-white/5"
                          onClick={() =>
                            updateScene(scene.id, (current) => ({
                              ...current,
                              subscenes: [...current.subscenes, buildSubscene()],
                            }))
                          }
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Nova subcena
                        </Button>
                      </div>

                      <div className="mt-4 space-y-3">
                        {scene.subscenes.length > 0 ? (
                          scene.subscenes.map((subscene, subsceneIndex) => (
                            <div key={subscene.id} className="rounded-[20px] border border-white/8 bg-white/4 p-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
                                  Subcena {sceneIndex + 1}.{subsceneIndex + 1}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    variant="outline"
                                    className="border-white/10 bg-white/5"
                                    onClick={() =>
                                      updateScene(scene.id, (current) => ({
                                        ...current,
                                        subscenes: moveItem(current.subscenes, subsceneIndex, "up"),
                                      }))
                                    }
                                    disabled={subsceneIndex === 0}
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="border-white/10 bg-white/5"
                                    onClick={() =>
                                      updateScene(scene.id, (current) => ({
                                        ...current,
                                        subscenes: moveItem(current.subscenes, subsceneIndex, "down"),
                                      }))
                                    }
                                    disabled={subsceneIndex === scene.subscenes.length - 1}
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="border-white/10 bg-white/5"
                                    onClick={() =>
                                      updateScene(scene.id, (current) => ({
                                        ...current,
                                        subscenes: current.subscenes.filter((item) => item.id !== subscene.id),
                                      }))
                                    }
                                  >
                                    Remover
                                  </Button>
                                </div>
                              </div>

                              <div className="mt-3 grid gap-3">
                                <Input
                                  value={subscene.title}
                                  onChange={(event) =>
                                    updateSubscene(scene.id, subscene.id, (current) => ({
                                      ...current,
                                      title: event.target.value,
                                    }))
                                  }
                                  placeholder="Titulo da subcena"
                                />
                                <Textarea
                                  rows={2}
                                  value={subscene.objective}
                                  onChange={(event) =>
                                    updateSubscene(scene.id, subscene.id, (current) => ({
                                      ...current,
                                      objective: event.target.value,
                                    }))
                                  }
                                  placeholder="Objetivo, virada ou improviso guiado"
                                />
                                <div className="flex flex-wrap gap-2">
                                  {sceneStatusOptions.map((status) => (
                                    <Button
                                      key={status}
                                      type="button"
                                      variant="outline"
                                      className={
                                        subscene.status === status
                                          ? "border-primary/30 bg-primary/10 text-primary"
                                          : "border-white/10 bg-white/5"
                                      }
                                      onClick={() =>
                                        updateSubscene(scene.id, subscene.id, (current) => ({
                                          ...current,
                                          status,
                                        }))
                                      }
                                    >
                                      {status}
                                    </Button>
                                  ))}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {forge.reveals.length > 0 ? (
                                    forge.reveals.map((reveal) => (
                                      <Button
                                        key={reveal.id}
                                        type="button"
                                        variant="outline"
                                        className={
                                          subscene.linkedRevealIds.includes(reveal.id)
                                            ? "border-primary/30 bg-primary/10 text-primary"
                                            : "border-white/10 bg-white/5"
                                        }
                                        onClick={() =>
                                          updateSubscene(scene.id, subscene.id, (current) => ({
                                            ...current,
                                            linkedRevealIds: current.linkedRevealIds.includes(reveal.id)
                                              ? current.linkedRevealIds.filter((item) => item !== reveal.id)
                                              : [...current.linkedRevealIds, reveal.id].slice(0, 4),
                                          }))
                                        }
                                      >
                                        {reveal.title || "Revelacao sem titulo"}
                                      </Button>
                                    ))
                                  ) : (
                                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-3 py-2 text-sm text-muted-foreground">
                                      Sem revelacoes disponiveis ainda.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-3 text-sm text-muted-foreground">
                            Nenhuma subcena ainda.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="chrome-panel rounded-[30px] p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="section-eyebrow">Roteiro flexivel</p>
                <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                  Beats da sessao
                </h2>
              </div>
              <Button
                variant="outline"
                className="border-white/10 bg-white/5"
                onClick={() => setForge((current) => ({ ...current, beats: [...current.beats, buildBeat()] }))}
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo beat
              </Button>
            </div>

            {forge.beats.length === 0 ? (
              <EmptyState
                title="Nenhum beat ainda"
                description="Abra o primeiro bloco da sessao para organizar o que e principal, opcional ou improvisado."
                icon={<Target className="h-6 w-6" />}
                action={
                  <Button onClick={() => setForge((current) => ({ ...current, beats: [buildBeat()] }))}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar primeiro beat
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {forge.beats.map((beat, index) => (
                  <div key={beat.id} className="rounded-[24px] border border-white/10 bg-white/4 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
                        Beat {index + 1}
                      </p>
                      <Button
                        variant="outline"
                        className="border-white/10 bg-white/5"
                        onClick={() =>
                          setForge((current) => ({
                            ...current,
                            beats: current.beats.filter((item) => item.id !== beat.id),
                          }))
                        }
                      >
                        Remover
                      </Button>
                    </div>
                    <div className="mt-4 grid gap-3">
                      <Input
                        value={beat.title}
                        onChange={(event) =>
                          updateBeat(beat.id, (current) => ({ ...current, title: event.target.value }))
                        }
                        placeholder="Titulo do beat ou cena"
                      />
                      <Textarea
                        rows={3}
                        value={beat.summary}
                        onChange={(event) =>
                          updateBeat(beat.id, (current) => ({ ...current, summary: event.target.value }))
                        }
                        placeholder="O que precisa acontecer aqui"
                      />
                      <div className="flex flex-wrap gap-2">
                        {beatStatusOptions.map((status) => (
                          <Button
                            key={status}
                            type="button"
                            variant="outline"
                            className={
                              beat.status === status
                                ? "border-primary/30 bg-primary/10 text-primary"
                                : "border-white/10 bg-white/5"
                            }
                            onClick={() => updateBeat(beat.id, (current) => ({ ...current, status }))}
                          >
                            {status}
                          </Button>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {entities.slice(0, 16).map((entity) => (
                          <Button
                            key={entity.id}
                            type="button"
                            variant="outline"
                            className={
                              beat.linkedEntityIds.includes(entity.id)
                                ? "border-primary/30 bg-primary/10 text-primary"
                                : "border-white/10 bg-white/5"
                            }
                            onClick={() =>
                              updateBeat(beat.id, (current) => ({
                                ...current,
                                linkedEntityIds: current.linkedEntityIds.includes(entity.id)
                                  ? current.linkedEntityIds.filter((item) => item !== entity.id)
                                  : [...current.linkedEntityIds, entity.id].slice(0, 6),
                              }))
                            }
                          >
                            {entity.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="chrome-panel rounded-[30px] p-6">
            <div className="mb-5 space-y-2">
              <p className="section-eyebrow">Camada dramatica</p>
              <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                Ganchos, segredos e revelacoes
              </h2>
            </div>
            <div className="grid gap-6 xl:grid-cols-3">
              {([
                { key: "hooks", title: "Ganchos", singular: "Gancho", description: "O que deve puxar a mesa para frente." },
                { key: "secrets", title: "Segredos", singular: "Segredo", description: "O que so o mestre ou poucos sabem." },
                { key: "reveals", title: "Revelacoes", singular: "Revelacao", description: "O que pode explodir na sessao." },
              ] as const).map((column) => (
                <div key={column.key} className="rounded-[24px] border border-white/10 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
                        {column.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{column.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-white/10 bg-white/5"
                      onClick={() =>
                        setForge((current) => ({
                          ...current,
                          [column.key]: [...current[column.key], buildDramaticItem()],
                        }))
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {forge[column.key].length > 0 ? (
                      forge[column.key].map((item) => (
                        <div key={item.id} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-foreground">{column.singular}</p>
                            <div className="flex flex-wrap gap-2">
                              {column.key === "reveals" ? (
                                <Button
                                  variant="outline"
                                  className="border-primary/20 bg-primary/10 text-primary"
                                  onClick={() => void handleRevealNow(item)}
                                  disabled={revealingId === item.id || !campaign.roomCode}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  {revealingId === item.id ? "Enviando..." : "Enviar para mesa"}
                                </Button>
                              ) : null}
                              <Button
                                variant="outline"
                                className="border-white/10 bg-white/5"
                                onClick={() =>
                                  setForge((current) => ({
                                    ...current,
                                    [column.key]: current[column.key].filter((entry) => entry.id !== item.id),
                                  }))
                                }
                              >
                                Remover
                              </Button>
                            </div>
                          </div>
                          <div className="mt-3 grid gap-3">
                            <Input
                              value={item.title}
                              onChange={(event) =>
                                updateDramaticCollection(column.key, item.id, (current) => ({
                                  ...current,
                                  title: event.target.value,
                                }))
                              }
                              placeholder={`${column.singular} principal`}
                            />
                            <Textarea
                              rows={3}
                              value={item.notes}
                              onChange={(event) =>
                                updateDramaticCollection(column.key, item.id, (current) => ({
                                  ...current,
                                  notes: event.target.value,
                                }))
                              }
                              placeholder="Notas de preparo"
                            />
                            {column.key === "reveals" ? (
                              <div className="grid gap-3">
                                <Input
                                  value={item.imageUrl ?? ""}
                                  onChange={(event) =>
                                    updateDramaticCollection(column.key, item.id, (current) => ({
                                      ...current,
                                      imageUrl: event.target.value,
                                    }))
                                  }
                                  placeholder="URL da imagem para reveal visual"
                                />
                                {item.imageUrl ? (
                                  <div className="overflow-hidden rounded-[20px] border border-white/10 bg-black/30">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={item.imageUrl} alt={item.title || "Reveal"} className="h-40 w-full object-cover" />
                                  </div>
                                ) : null}
                                <div className="flex flex-wrap gap-2">
                                  {prepVisualAssets.slice(0, 12).map((asset) => {
                                      const candidateUrl = asset.url;
                                      const selected = item.imageUrl === candidateUrl;
                                      return (
                                        <Button
                                          key={`${item.id}:${asset.id}`}
                                          type="button"
                                          variant="outline"
                                          className={
                                            selected
                                              ? "border-primary/30 bg-primary/10 text-primary"
                                              : "border-white/10 bg-white/5"
                                          }
                                          onClick={() =>
                                            updateDramaticCollection(column.key, item.id, (current) => ({
                                              ...current,
                                              imageUrl:
                                                current.imageUrl === candidateUrl ? undefined : candidateUrl,
                                            }))
                                          }
                                        >
                                          {asset.entityName}
                                        </Button>
                                      );
                                    })}
                                </div>
                              </div>
                            ) : null}
                            <div className="flex flex-wrap gap-2">
                              {dramaticStatusOptions.map((status) => (
                                <Button
                                  key={status}
                                  type="button"
                                  variant="outline"
                                  className={
                                    item.status === status
                                      ? "border-primary/30 bg-primary/10 text-primary"
                                      : "border-white/10 bg-white/5"
                                  }
                                  onClick={() =>
                                    updateDramaticCollection(column.key, item.id, (current) => ({
                                      ...current,
                                      status,
                                    }))
                                  }
                                >
                                  {status}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-3 text-sm text-muted-foreground">
                        Nenhum item ainda.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="chrome-panel rounded-[30px] p-6">
            <div className="mb-5 space-y-2">
              <p className="section-eyebrow">Notas operacionais</p>
              <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                O que precisa ficar na mao
              </h2>
            </div>
            <div className="grid gap-4">
              <Textarea
                rows={5}
                value={forge.masterNotes}
                onChange={(event) => setForge((current) => ({ ...current, masterNotes: event.target.value }))}
                placeholder="Segredos, gatilhos, detalhes que so o mestre precisa ver"
              />
              <Textarea
                rows={5}
                value={forge.operationalNotes}
                onChange={(event) =>
                  setForge((current) => ({ ...current, operationalNotes: event.target.value }))
                }
                placeholder="Musicas, reveals, momentos de consulta ou operacao rapida"
              />
            </div>
          </section>

          <section className="chrome-panel rounded-[30px] p-6">
            <div className="mb-5 space-y-2">
              <p className="section-eyebrow">Memoria do mundo</p>
              <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                Fechamento pos-sessao
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Consolide o que realmente ficou da mesa: resumo publico, resumo do mestre, presencas,
                mortes e mudancas persistentes do mundo.
              </p>
            </div>

            <div className="grid gap-4">
              <Textarea
                rows={4}
                value={forge.memory.publicSummary}
                onChange={(event) =>
                  setForge((current) => ({
                    ...current,
                    memory: { ...current.memory, publicSummary: event.target.value },
                  }))
                }
                placeholder="Resumo publico do que a mesa e o mundo ja podem tratar como ocorrido"
              />
              <Textarea
                rows={5}
                value={forge.memory.masterSummary}
                onChange={(event) =>
                  setForge((current) => ({
                    ...current,
                    memory: { ...current.memory, masterSummary: event.target.value },
                  }))
                }
                placeholder="Resumo privado do mestre, com contexto, leitura politica e consequencias ocultas"
              />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
                      Presencas e ausencias
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Quem apareceu ou nao apareceu nesta sessao.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="border-white/10 bg-white/5"
                      onClick={() =>
                        setForge((current) => ({
                          ...current,
                          memory: {
                            ...current.memory,
                            attendance: [...current.memory.attendance, buildAttendanceItem("appeared")],
                          },
                        }))
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white/10 bg-white/5"
                      onClick={() =>
                        setForge((current) => ({
                          ...current,
                          memory: {
                            ...current.memory,
                            attendance: [...current.memory.attendance, buildAttendanceItem("absent")],
                          },
                        }))
                      }
                    >
                      <Users2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {forge.memory.attendance.length > 0 ? (
                    forge.memory.attendance.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <Badge
                            className={
                              item.status === "appeared"
                                ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                                : "border-amber-300/20 bg-amber-300/10 text-amber-100"
                            }
                          >
                            {item.status === "appeared" ? "Apareceu" : "Nao apareceu"}
                          </Badge>
                          <Button
                            variant="outline"
                            className="border-white/10 bg-white/5"
                            onClick={() =>
                              setForge((current) => ({
                                ...current,
                                memory: {
                                  ...current.memory,
                                  attendance: current.memory.attendance.filter((entry) => entry.id !== item.id),
                                },
                              }))
                            }
                          >
                            Remover
                          </Button>
                        </div>
                        <div className="mt-3 grid gap-3">
                          <Input
                            value={item.label}
                            onChange={(event) =>
                              updateAttendanceItem(item.id, (current) => ({
                                ...current,
                                label: event.target.value,
                              }))
                            }
                            placeholder="Quem apareceu ou faltou"
                          />
                          <Textarea
                            rows={3}
                            value={item.notes}
                            onChange={(event) =>
                              updateAttendanceItem(item.id, (current) => ({
                                ...current,
                                notes: event.target.value,
                              }))
                            }
                            placeholder="Contexto curto do papel na sessao"
                          />
                          <div className="flex flex-wrap gap-2">
                            {memoryVisibilityOptions.map((visibility) => (
                              <Button
                                key={`${item.id}:${visibility}`}
                                type="button"
                                variant="outline"
                                className={
                                  item.visibility === visibility
                                    ? "border-primary/30 bg-primary/10 text-primary"
                                    : "border-white/10 bg-white/5"
                                }
                                onClick={() =>
                                  updateAttendanceItem(item.id, (current) => ({
                                    ...current,
                                    visibility,
                                  }))
                                }
                              >
                                {formatMemoryVisibility(visibility)}
                              </Button>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {memoryEntityOptions.map((entity) => {
                              const selected = item.entityId === entity.id;
                              return (
                                <Button
                                  key={`${item.id}:${entity.id}`}
                                  type="button"
                                  variant="outline"
                                  className={
                                    selected
                                      ? "border-primary/30 bg-primary/10 text-primary"
                                      : "border-white/10 bg-white/5"
                                  }
                                  onClick={() =>
                                    updateAttendanceItem(item.id, (current) => ({
                                      ...current,
                                      entityId: current.entityId === entity.id ? undefined : entity.id,
                                      label:
                                        current.entityId === entity.id && current.label === entity.name
                                          ? ""
                                          : current.label || entity.name,
                                    }))
                                  }
                                >
                                  {entity.name}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-3 text-sm text-muted-foreground">
                      Ainda nao houve consolidacao de presencas.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
                      Mortes
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Quem morreu, sumiu ou precisa marcar ruptura irreversivel.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-white/10 bg-white/5"
                    onClick={() =>
                      setForge((current) => ({
                        ...current,
                        memory: {
                          ...current.memory,
                          deaths: [...current.memory.deaths, buildDeathItem()],
                        },
                      }))
                    }
                  >
                    <Skull className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 space-y-3">
                  {forge.memory.deaths.length > 0 ? (
                    forge.memory.deaths.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <Badge className="border-red-300/20 bg-red-300/10 text-red-100">Morte</Badge>
                          <Button
                            variant="outline"
                            className="border-white/10 bg-white/5"
                            onClick={() =>
                              setForge((current) => ({
                                ...current,
                                memory: {
                                  ...current.memory,
                                  deaths: current.memory.deaths.filter((entry) => entry.id !== item.id),
                                },
                              }))
                            }
                          >
                            Remover
                          </Button>
                        </div>
                        <div className="mt-3 grid gap-3">
                          <Input
                            value={item.label}
                            onChange={(event) =>
                              updateDeathItem(item.id, (current) => ({
                                ...current,
                                label: event.target.value,
                              }))
                            }
                            placeholder="Quem morreu"
                          />
                          <Textarea
                            rows={3}
                            value={item.notes}
                            onChange={(event) =>
                              updateDeathItem(item.id, (current) => ({
                                ...current,
                                notes: event.target.value,
                              }))
                            }
                            placeholder="Circunstancia, impacto e como isso fica registrado"
                          />
                          <div className="flex flex-wrap gap-2">
                            {memoryVisibilityOptions.map((visibility) => (
                              <Button
                                key={`${item.id}:${visibility}`}
                                type="button"
                                variant="outline"
                                className={
                                  item.visibility === visibility
                                    ? "border-primary/30 bg-primary/10 text-primary"
                                    : "border-white/10 bg-white/5"
                                }
                                onClick={() =>
                                  updateDeathItem(item.id, (current) => ({
                                    ...current,
                                    visibility,
                                  }))
                                }
                              >
                                {formatMemoryVisibility(visibility)}
                              </Button>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {memoryEntityOptions.map((entity) => {
                              const selected = item.entityId === entity.id;
                              return (
                                <Button
                                  key={`${item.id}:${entity.id}`}
                                  type="button"
                                  variant="outline"
                                  className={
                                    selected
                                      ? "border-primary/30 bg-primary/10 text-primary"
                                      : "border-white/10 bg-white/5"
                                  }
                                  onClick={() =>
                                    updateDeathItem(item.id, (current) => ({
                                      ...current,
                                      entityId: current.entityId === entity.id ? undefined : entity.id,
                                      label:
                                        current.entityId === entity.id && current.label === entity.name
                                          ? ""
                                          : current.label || entity.name,
                                    }))
                                  }
                                >
                                  {entity.name}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-3 text-sm text-muted-foreground">
                      Nenhuma morte consolidada ainda.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
                      Mudancas persistentes
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      O que o mundo precisa lembrar depois da sessao.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-white/10 bg-white/5"
                    onClick={() =>
                      setForge((current) => ({
                        ...current,
                        memory: {
                          ...current.memory,
                          changes: [...current.memory.changes, buildMemoryChange()],
                        },
                      }))
                    }
                  >
                    <ScrollText className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 space-y-3">
                  {forge.memory.changes.length > 0 ? (
                    forge.memory.changes.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <Badge className="border-primary/20 bg-primary/10 text-primary">
                            {formatMemoryChangeType(item.type)}
                          </Badge>
                          <Button
                            variant="outline"
                            className="border-white/10 bg-white/5"
                            onClick={() =>
                              setForge((current) => ({
                                ...current,
                                memory: {
                                  ...current.memory,
                                  changes: current.memory.changes.filter((entry) => entry.id !== item.id),
                                },
                              }))
                            }
                          >
                            Remover
                          </Button>
                        </div>
                        <div className="mt-3 grid gap-3">
                          <Input
                            value={item.title}
                            onChange={(event) =>
                              updateMemoryChangeItem(item.id, (current) => ({
                                ...current,
                                title: event.target.value,
                              }))
                            }
                            placeholder="O que mudou de verdade"
                          />
                          <Textarea
                            rows={3}
                            value={item.notes}
                            onChange={(event) =>
                              updateMemoryChangeItem(item.id, (current) => ({
                                ...current,
                                notes: event.target.value,
                              }))
                            }
                            placeholder="Como isso afeta o mundo, a campanha ou a proxima sessao"
                          />
                          <div className="flex flex-wrap gap-2">
                            {memoryChangeTypeOptions.map((type) => (
                              <Button
                                key={`${item.id}:${type}`}
                                type="button"
                                variant="outline"
                                className={
                                  item.type === type
                                    ? "border-primary/30 bg-primary/10 text-primary"
                                    : "border-white/10 bg-white/5"
                                }
                                onClick={() =>
                                  updateMemoryChangeItem(item.id, (current) => ({
                                    ...current,
                                    type,
                                  }))
                                }
                              >
                                {formatMemoryChangeType(type)}
                              </Button>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {memoryVisibilityOptions.map((visibility) => (
                              <Button
                                key={`${item.id}:${visibility}`}
                                type="button"
                                variant="outline"
                                className={
                                  item.visibility === visibility
                                    ? "border-primary/30 bg-primary/10 text-primary"
                                    : "border-white/10 bg-white/5"
                                }
                                onClick={() =>
                                  updateMemoryChangeItem(item.id, (current) => ({
                                    ...current,
                                    visibility,
                                  }))
                                }
                              >
                                {formatMemoryVisibility(visibility)}
                              </Button>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {memoryEntityOptions.map((entity) => {
                              const selected = item.linkedEntityIds.includes(entity.id);
                              return (
                                <Button
                                  key={`${item.id}:${entity.id}`}
                                  type="button"
                                  variant="outline"
                                  className={
                                    selected
                                      ? "border-primary/30 bg-primary/10 text-primary"
                                      : "border-white/10 bg-white/5"
                                  }
                                  onClick={() =>
                                    updateMemoryChangeItem(item.id, (current) => ({
                                      ...current,
                                      linkedEntityIds: current.linkedEntityIds.includes(entity.id)
                                        ? current.linkedEntityIds.filter((entry) => entry !== entity.id)
                                        : [...current.linkedEntityIds, entity.id].slice(0, 6),
                                    }))
                                  }
                                >
                                  {entity.name}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-3 text-sm text-muted-foreground">
                      Nenhuma mudanca persistente consolidada ainda.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="chrome-panel rounded-[30px] p-6">
            <p className="section-eyebrow">Lore em foco</p>
            <div className="mt-4 space-y-3">
              {prepLore.length > 0 ? (
                prepLore.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="block rounded-[24px] border border-white/8 bg-white/4 p-4 transition hover:border-primary/25"
                  >
                    <div className="flex flex-wrap gap-2">
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
                    <h3 className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                  </Link>
                ))
              ) : (
                <div className="rounded-[24px] border border-white/8 bg-white/4 p-4 text-sm text-muted-foreground">
                  Nenhum bloco de lore priorizado para esta campanha ainda.
                </div>
              )}
            </div>
          </section>

          <section className="chrome-panel rounded-[30px] p-6">
            <p className="section-eyebrow">Pacote visual da mesa</p>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm leading-6 text-muted-foreground">
                  Assets puxados das entidades ligadas ao preparo. Use isso para montar reveals e consulta rapida sem sair da sessao.
                </p>
                <Button asChild variant="outline" className="border-white/10 bg-white/5">
                  <Link href={`/app/worlds/${campaign.world.id}/visual-library?campaignId=${campaign.id}`}>
                    Biblioteca visual
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {prepVisualAssets.length > 0 ? (
                <div className="grid gap-3">
                  {prepVisualAssets.slice(0, 6).map((asset) => (
                    <div
                      key={asset.id}
                      className="overflow-hidden rounded-[24px] border border-white/8 bg-white/4"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={asset.url} alt={asset.entityName} className="h-28 w-full object-cover" />
                      <div className="space-y-2 p-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge className="border-white/10 bg-white/5 text-white/75">
                            {getVisualKindLabel(asset.kind)}
                          </Badge>
                          <Badge className="border-primary/20 bg-primary/10 text-primary">
                            {asset.entityName}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {asset.caption || "Asset em foco para consulta ou reveal."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-white/8 bg-white/4 p-4 text-sm text-muted-foreground">
                  Ligue entidades ao preparo, cenas ou beats para trazer assets visuais automaticamente para a sessao.
                </div>
              )}
            </div>
          </section>

          <section className="chrome-panel rounded-[30px] p-6">
            <p className="section-eyebrow">Entidades em foco</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {entities.slice(0, 18).map((entity) => (
                <Button
                  key={entity.id}
                  type="button"
                  variant="outline"
                  className={
                    forge.linkedEntityIds.includes(entity.id)
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-white/10 bg-white/5"
                  }
                  onClick={() =>
                    setForge((current) => ({
                      ...current,
                      linkedEntityIds: current.linkedEntityIds.includes(entity.id)
                        ? current.linkedEntityIds.filter((item) => item !== entity.id)
                        : [...current.linkedEntityIds, entity.id].slice(0, 10),
                    }))
                  }
                >
                  {entity.name}
                </Button>
              ))}
            </div>
            <Button asChild variant="outline" className="mt-4 w-full justify-between border-white/10 bg-white/5">
              <Link href={`/app/worlds/${campaign.world.id}/codex`}>
                Abrir Codex
                <Users2 className="h-4 w-4" />
              </Link>
            </Button>
          </section>

          <section className="chrome-panel rounded-[30px] p-6">
            <p className="section-eyebrow">Passagem para a mesa</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
                  Pacote operacional
                </p>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                  <p>{readyScenes.length} cenas com estrutura operacional</p>
                  <p>{forge.reveals.filter((item) => item.status !== "canceled").length} reveals preparados</p>
                  <p>{forge.hooks.filter((item) => item.status !== "canceled").length} ganchos ativos</p>
                </div>
              </div>
              <Button asChild className="justify-between">
                <Link href={`/app/play/${campaign.id}`}>
                  Abrir modo sessao
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-between border-white/10 bg-white/5">
                <Link href={`/app/worlds/${campaign.world.id}/visual-library`}>
                  Biblioteca visual
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-between border-white/10 bg-white/5">
                <Link href={`/app/worlds/${campaign.world.id}/compendium`}>
                  Compendio
                  <BookOpenText className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
