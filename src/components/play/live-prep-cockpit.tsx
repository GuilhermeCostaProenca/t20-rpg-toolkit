"use client";

import {
  Clapperboard,
  Eye,
  Lock,
  MonitorPlay,
  Shield,
  Target,
  Users2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type SessionForgeBeat,
  type SessionForgeDramaticItem,
  type SessionForgeEncounter,
  type SessionForgeScene,
  type SessionForgeState,
} from "@/lib/session-forge";
import {
  analyzeLiveCombatPressure,
  formatBalanceConfidence,
  formatEncounterRating,
  formatLivePressureState,
  suggestPublicScenePacing,
  suggestLiveAdjustment,
} from "@/lib/t20-balance";

type PrepSessionPacket = {
  session: {
    title: string;
    status?: "planned" | "active" | "finished";
  };
  forge: SessionForgeState;
};

type LiveCombat = {
  isActive: boolean;
  round: number;
  combatants: {
    id: string;
    kind: string;
    name: string;
    hpCurrent: number;
    hpMax: number;
  }[];
};

type SceneVisualEntity = {
  id: string;
  name: string;
  type: string;
  subtype?: string | null;
  imageUrl: string;
  role: "portrait" | "location";
};

type PublicQueueCandidate = {
  id: string;
  title: string;
  description: string;
  kind: "reveal" | "portrait" | "location";
  imageUrl?: string;
  objectiveHint?: string;
  sceneCue?: string;
  subsceneHint?: string;
  subsceneLinked?: boolean;
  inspectLinked?: boolean;
  subsceneRevealLinked?: boolean;
};

type LivePrepCockpitProps = {
  prepPacket: PrepSessionPacket | null;
  activeScene: SessionForgeScene | null;
  activeEncounter: SessionForgeEncounter | null;
  activeSceneReveals: SessionForgeDramaticItem[];
  currentPublicAsset: {
    title: string;
    detail: string;
  } | null;
  sceneVisualEntities: SceneVisualEntity[];
  liveCombat: LiveCombat | null;
  revealingId: string | null;
  secondScreenReady: boolean;
  activeInspectEntityId: string | null;
  onFocusScene: (sceneId: string) => void;
  onInspectEntity: (entityId: string) => void;
  onReveal: (revealId: string) => void | Promise<void>;
  onPresentAsset: (entityId: string, imageUrl: string, title: string) => void | Promise<void>;
};

function PlayerFacingAssetCard({
  entity,
  secondScreenReady,
  activeInspectEntityId,
  onInspectEntity,
  onPresentAsset,
}: {
  entity: SceneVisualEntity;
  secondScreenReady: boolean;
  activeInspectEntityId: string | null;
  onInspectEntity: (entityId: string) => void;
  onPresentAsset: (entityId: string, imageUrl: string, title: string) => void | Promise<void>;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-black/20 ${
        activeInspectEntityId === entity.id
          ? "border-primary/30 shadow-[0_0_0_1px_rgba(201,161,74,0.25)]"
          : "border-white/8"
      }`}
    >
      <div
        className={entity.role === "portrait" ? "h-28 bg-cover bg-center" : "h-24 bg-cover bg-center"}
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(8,8,13,0.08), rgba(8,8,13,0.78)), url(${entity.imageUrl})`,
        }}
      />
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{entity.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {entity.subtype || entity.type}
            </p>
          </div>
          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
            Jogadores
          </Badge>
        </div>
        {secondScreenReady ? (
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-primary/80">
            Asset pronto para segunda tela
          </p>
        ) : null}
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-white/10 bg-white/5"
            onClick={() => onInspectEntity(entity.id)}
          >
            Consultar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 bg-white/5"
            onClick={() => window.open(entity.imageUrl, "_blank", "noopener,noreferrer")}
          >
            Asset
          </Button>
          {secondScreenReady ? (
            <Button
              size="sm"
              variant="outline"
              className="border-primary/20 bg-primary/10 text-primary"
              onClick={() => void onPresentAsset(entity.id, entity.imageUrl, entity.name)}
            >
              Exibir na TV
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function getPublicQueuePriority(
  candidate: PublicQueueCandidate,
  publicPacing: ReturnType<typeof suggestPublicScenePacing>,
) {
  let score = 0;

  if (candidate.kind === "reveal") {
    if (publicPacing?.posture === "ease") score = 34;
    else if (publicPacing?.posture === "hold") score = 38;
    else score = 42;
  }

  if (candidate.kind === "location") {
    if (publicPacing?.posture === "ease") score = 18;
    else if (publicPacing?.posture === "hold") score = 28;
    else score = 34;
  }

  if (candidate.kind === "portrait") {
    if (publicPacing?.posture === "ease") score = 32;
    else if (publicPacing?.posture === "hold") score = 26;
    else score = 22;
  }

  if (candidate.sceneCue) score += 4;
  if (candidate.subsceneHint) score += 3;
  if (candidate.subsceneLinked) score += 4;
  if (candidate.inspectLinked) score += 5;
  if (candidate.subsceneRevealLinked) score += 6;
  if (candidate.objectiveHint) score += 2;

  return score;
}

function describeSceneCue(
  sceneObjective: string,
  beats: SessionForgeBeat[],
  activeSubscene: SessionForgeScene["subscenes"][number] | null,
) {
  const objectiveHint = sceneObjective.trim();
  const firstBeat = beats.find((beat) => beat.status !== "discarded");
  const beatCue = firstBeat?.title?.trim() || firstBeat?.summary?.trim() || "";
  const subsceneTitle = activeSubscene?.title?.trim() || "";
  const subsceneObjective = activeSubscene?.objective?.trim() || "";

  return {
    objectiveHint: objectiveHint ? `Objetivo: ${objectiveHint}` : "",
    beatCue: beatCue ? `Beat em foco: ${beatCue}` : "",
    subsceneHint: subsceneTitle
      ? `Subcena: ${subsceneTitle}`
      : subsceneObjective
        ? `Subobjetivo: ${subsceneObjective}`
        : "",
  };
}

function pickReservePublicCandidate(
  queue: PublicQueueCandidate[],
  nextCandidate: PublicQueueCandidate | null,
  currentCandidate: PublicQueueCandidate | null,
) {
  if (!nextCandidate) return null;

  const remaining = queue.filter(
    (candidate) =>
      candidate.id !== nextCandidate.id && candidate.id !== currentCandidate?.id,
  );
  if (remaining.length === 0) return null;

  if (nextCandidate.kind === "reveal") {
    return remaining.find((candidate) => candidate.kind !== "reveal") ?? remaining[0];
  }

  return remaining.find((candidate) => candidate.kind === "reveal") ?? remaining[0];
}

function getDesiredPublicPhase(
  currentCandidate: PublicQueueCandidate | null,
  publicPacing: ReturnType<typeof suggestPublicScenePacing>,
  subsceneRevealCount: number,
  subsceneEntityCount: number,
) {
  if (!currentCandidate) {
    if (subsceneRevealCount > 0) {
      return {
        label: "Abertura",
        detail: "A subcena ja pede uma revelacao inicial para abrir a camada publica.",
        preferredKind: "reveal" as PublicQueueCandidate["kind"],
      };
    }

    return {
      label: "Abertura",
      detail:
        subsceneEntityCount > 0
          ? "A subcena pede primeiro uma base visual para situar personagens e lugar."
          : "A cena esta pedindo a primeira camada publica forte.",
      preferredKind: "location" as PublicQueueCandidate["kind"],
    };
  }

  if (publicPacing?.posture === "hold") {
    return {
      label: "Sustentacao",
      detail: "A cena ainda pede permanencia e leitura antes da proxima virada visual.",
      preferredKind: currentCandidate.kind,
    };
  }

  if (currentCandidate.kind === "location") {
    return {
      label: "Virada",
      detail:
        subsceneRevealCount > 0
          ? "A base espacial ja entrou; a subcena pede agora uma revelacao para virar o momento."
          : "A cena pede sair da base espacial e abrir uma camada mais dramatica ou revelatoria.",
      preferredKind:
        subsceneRevealCount > 0
          ? ("reveal" as PublicQueueCandidate["kind"])
          : ("portrait" as PublicQueueCandidate["kind"]),
    };
  }

  if (currentCandidate.kind === "reveal") {
    return {
      label: subsceneEntityCount > 0 ? "Sustentacao" : "Virada",
      detail:
        subsceneEntityCount > 0
          ? "A revelacao ja entrou; agora a subcena pede um rosto ou lugar para sustentar o impacto."
          : "A revelacao ja entrou; agora a cena pede um rosto ou um lugar para sustentar o impacto.",
      preferredKind: "portrait" as PublicQueueCandidate["kind"],
    };
  }

  return {
    label: "Continuacao",
    detail: "A cena segue na mesma linha visual antes da proxima ruptura mais forte.",
    preferredKind: "location" as PublicQueueCandidate["kind"],
  };
}

function pickNextPublicCandidate(
  queue: PublicQueueCandidate[],
  currentCandidate: PublicQueueCandidate | null,
  desiredKind: PublicQueueCandidate["kind"] | null,
) {
  if (queue.length === 0) return null;
  if (desiredKind) {
    const preferred = queue.find((candidate) => candidate.kind === desiredKind);
    if (preferred) return preferred;
  }

  if (!currentCandidate) return queue[0];

  if (currentCandidate.kind === "reveal") {
    return queue.find((candidate) => candidate.kind !== "reveal") ?? queue[0];
  }

  return queue.find((candidate) => candidate.kind === "reveal") ?? queue[0];
}

function getPublicAdvanceCue(
  currentCandidate: PublicQueueCandidate | null,
  nextCandidate: PublicQueueCandidate | null,
  publicPacing: ReturnType<typeof suggestPublicScenePacing>,
) {
  if (!currentCandidate || !nextCandidate) return null;

  if (publicPacing?.posture === "hold") {
    return {
      label: "Segure mais um pouco",
      detail: "A cena ainda comporta manter a camada atual antes de trocar a exposicao.",
    };
  }

  if (currentCandidate.kind === nextCandidate.kind) {
    return {
      label: "Avanco suave",
      detail: "A proxima troca mantem a mesma leitura visual e pode entrar sem ruptura forte.",
    };
  }

  return {
    label: "Hora de virar a camada",
    detail: "A proxima exposicao complementa o que ja esta na tela e ajuda a cena a avancar.",
  };
}

export function LivePrepCockpit({
  prepPacket,
  activeScene,
  activeEncounter,
  activeSceneReveals,
  currentPublicAsset,
  sceneVisualEntities,
  liveCombat,
  revealingId,
  secondScreenReady,
  activeInspectEntityId,
  onFocusScene,
  onInspectEntity,
  onReveal,
  onPresentAsset,
}: LivePrepCockpitProps) {
  const livePressure =
    liveCombat?.isActive && liveCombat.combatants.length > 0
      ? analyzeLiveCombatPressure(liveCombat.combatants)
      : null;
  const liveAdjustment = livePressure
    ? suggestLiveAdjustment(livePressure, activeEncounter?.rating ?? null)
    : null;
  const publicPacing = suggestPublicScenePacing(livePressure, Boolean(activeScene));
  const generalReveals = prepPacket
    ? prepPacket.forge.reveals.filter(
        (item) =>
          item.status !== "canceled" &&
          !activeSceneReveals.some((sceneItem) => sceneItem.id === item.id),
      )
    : [];
  const primarySceneReveal =
    activeSceneReveals.find((item) => item.status === "planned") ?? activeSceneReveals[0] ?? null;
  const secondarySceneReveals = primarySceneReveal
    ? activeSceneReveals.filter((item) => item.id !== primarySceneReveal.id)
    : activeSceneReveals;
  const activeSceneBeats = activeScene && prepPacket
    ? prepPacket.forge.beats.filter((beat) => activeScene.linkedBeatIds.includes(beat.id))
    : [];
  const activeSubscene =
    activeScene?.subscenes.find((subscene) => subscene.status !== "discarded") ?? null;
  const activeSubsceneEntityIds = new Set(activeSubscene?.linkedEntityIds ?? []);
  const activeSubsceneRevealIds = new Set(activeSubscene?.linkedRevealIds ?? []);
  const sceneCue = describeSceneCue(
    activeScene?.objective || "",
    activeSceneBeats,
    activeSubscene,
  );
  const prioritizedSceneVisualEntities =
    activeSubsceneEntityIds.size > 0
      ? sceneVisualEntities.filter((item) => activeSubsceneEntityIds.has(item.id))
      : sceneVisualEntities;
  const gmSupportVisualEntities =
    activeSubsceneEntityIds.size > 0
      ? sceneVisualEntities.filter((item) => !activeSubsceneEntityIds.has(item.id))
      : [];
  const portraitRefs = prioritizedSceneVisualEntities.filter((item) => item.role === "portrait");
  const locationRefs = prioritizedSceneVisualEntities.filter((item) => item.role === "location");
  const publicRevealCount = [
    primarySceneReveal,
    ...secondarySceneReveals,
    ...generalReveals,
  ].filter((item): item is SessionForgeDramaticItem => Boolean(item?.imageUrl)).length;
  const publicAssetCount = prioritizedSceneVisualEntities.length;
  const fullPublicSceneQueue = [
    ...[primarySceneReveal, ...secondarySceneReveals, ...generalReveals]
      .filter((item): item is SessionForgeDramaticItem => Boolean(item?.imageUrl))
      .map((item) => ({
        id: item.id,
        title: item.title || "Reveal da cena",
        description: sceneCue.beatCue || "Reveal sugerido para a proxima camada visual da cena.",
        kind: "reveal" as const,
        imageUrl: item.imageUrl || undefined,
        objectiveHint: sceneCue.objectiveHint || undefined,
        sceneCue: sceneCue.beatCue || undefined,
        subsceneHint: sceneCue.subsceneHint || undefined,
        subsceneLinked: true,
        inspectLinked: false,
        subsceneRevealLinked: activeSubsceneRevealIds.has(item.id),
      })),
    ...locationRefs.map((item) => ({
      id: item.id,
      title: item.name,
      description:
        sceneCue.subsceneHint ||
        sceneCue.objectiveHint ||
        "Lugar sugerido para aprofundar a leitura espacial da cena.",
      kind: "location" as const,
      imageUrl: item.imageUrl,
      objectiveHint: sceneCue.objectiveHint || undefined,
      subsceneHint: sceneCue.subsceneHint || undefined,
      subsceneLinked: activeSubsceneEntityIds.has(item.id),
      inspectLinked: item.id === activeInspectEntityId,
      subsceneRevealLinked: false,
    })),
    ...portraitRefs.map((item) => ({
      id: item.id,
      title: item.name,
      description: "Rosto sugerido para aprofundar a leitura dramática da cena.",
      kind: "portrait" as const,
      imageUrl: item.imageUrl,
      objectiveHint: sceneCue.objectiveHint || undefined,
      sceneCue: sceneCue.beatCue || undefined,
      subsceneLinked: activeSubsceneEntityIds.has(item.id),
      inspectLinked: item.id === activeInspectEntityId,
      subsceneRevealLinked: false,
    })),
  ]
    .sort(
      (left, right) =>
        getPublicQueuePriority(right, publicPacing) - getPublicQueuePriority(left, publicPacing),
    )
    .map((item) =>
      item.kind === "portrait"
        ? {
            ...item,
            description:
              sceneCue.subsceneHint ||
              "Rosto sugerido para aprofundar a leitura dramatica da cena.",
            subsceneHint: sceneCue.subsceneHint || undefined,
            inspectLinked: item.id === activeInspectEntityId,
          }
        : item,
    );
  const currentDisplayedCandidate =
    fullPublicSceneQueue.find((item) => item.title === currentPublicAsset?.title) ?? null;
  const publicSceneQueue = fullPublicSceneQueue.filter(
    (item) => item.title !== currentPublicAsset?.title,
  );
  const publicScenePhase = getDesiredPublicPhase(
    currentDisplayedCandidate,
    publicPacing,
    activeSubsceneRevealIds.size,
    activeSubsceneEntityIds.size,
  );
  const nextPublicCandidate = pickNextPublicCandidate(
    publicSceneQueue,
    currentDisplayedCandidate,
    publicScenePhase?.preferredKind ?? null,
  );
  const reservePublicCandidate = pickReservePublicCandidate(
    publicSceneQueue,
    nextPublicCandidate,
    currentDisplayedCandidate,
  );
  const publicAdvanceCue = getPublicAdvanceCue(
    currentDisplayedCandidate,
    nextPublicCandidate,
    publicPacing,
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Pacote de preparo
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {prepPacket?.session.title ?? "Nenhuma sessao preparada"}
          </p>
        </div>
        <Badge variant="outline" className="border-primary/20 text-primary">
          {prepPacket?.session.status ?? "sem sessao"}
        </Badge>
      </div>

      {prepPacket ? (
        <div className="mt-4 space-y-4">
          <div className="space-y-3 rounded-2xl border border-primary/15 bg-primary/5 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                  Para jogadores
                </p>
                <p className="mt-1 text-sm text-foreground/90">
                  O que esta pronto para aparecer na TV ou na segunda tela.
                </p>
              </div>
              <Badge className="border-primary/20 bg-primary/10 text-primary">
                <MonitorPlay className="mr-1 h-3 w-3" />
                {secondScreenReady ? "Publico pronto" : "TV indisponivel"}
              </Badge>
            </div>

            <div className="grid gap-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-black/20 px-3 py-2">
                <span className="inline-flex items-center gap-2">
                  <Eye className="h-3 w-3" /> Reveals publicos
                </span>
                <span className="font-semibold text-foreground">{publicRevealCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-black/20 px-3 py-2">
                <span className="inline-flex items-center gap-2">
                  <Users2 className="h-3 w-3" /> Assets de cena
                </span>
                <span className="font-semibold text-foreground">{publicAssetCount}</span>
              </div>
            </div>

            {!secondScreenReady ? (
              <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-xs text-muted-foreground">
                Sem `roomCode` ativo. O pacote continua visivel para o mestre, mas ainda nao ha
                superficie publica pronta para os jogadores.
              </div>
            ) : null}

            {currentPublicAsset ? (
              <div className="rounded-xl border border-primary/20 bg-black/20 p-3">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/80">
                  <MonitorPlay className="h-3 w-3" />
                  Na tela agora
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {currentPublicAsset.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{currentPublicAsset.detail}</p>
                {publicAdvanceCue ? (
                  <div className="mt-3 rounded-xl border border-white/8 bg-sidebar/50 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary/80">
                      {publicAdvanceCue.label}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{publicAdvanceCue.detail}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {publicPacing ? (
              <div className="rounded-xl border border-primary/20 bg-black/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                    Ritmo da cena
                  </p>
                  <Badge
                    variant="outline"
                    className={`${
                      publicPacing.posture === "ease"
                        ? "border-red-500/30 text-red-300"
                        : publicPacing.posture === "escalate"
                          ? "border-emerald-500/30 text-emerald-300"
                          : "border-amber-500/30 text-amber-300"
                    }`}
                  >
                    {publicPacing.label}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{publicPacing.guidance}</p>
              </div>
            ) : null}

            {publicScenePhase ? (
              <div className="rounded-xl border border-primary/20 bg-black/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                    Fase da cena
                  </p>
                  <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                    {publicScenePhase.label}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{publicScenePhase.detail}</p>
              </div>
            ) : null}

            {nextPublicCandidate ? (
              <div className="rounded-xl border border-primary/20 bg-black/20 p-3">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/80">
                  <Eye className="h-3 w-3" />
                  Proxima exposicao sugerida
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">{nextPublicCandidate.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{nextPublicCandidate.description}</p>
                {nextPublicCandidate.objectiveHint ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/60">
                    {nextPublicCandidate.objectiveHint}
                  </p>
                ) : null}
                {nextPublicCandidate.subsceneHint ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-primary/70">
                    {nextPublicCandidate.subsceneHint}
                  </p>
                ) : null}
                {nextPublicCandidate.subsceneRevealLinked ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-primary">
                    Reveal ligado diretamente a subcena
                  </p>
                ) : null}
                {nextPublicCandidate.inspectLinked ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-emerald-300">
                    Ja em consulta pelo mestre
                  </p>
                ) : null}
                {currentDisplayedCandidate ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/60">
                    {currentDisplayedCandidate.kind === nextPublicCandidate.kind
                      ? "Mantem a camada visual atual"
                      : "Complementa o que ja esta na tela"}
                  </p>
                ) : null}
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                    Proxima
                  </Badge>
                  <Badge variant="outline" className="border-white/10 text-white/70">
                    {nextPublicCandidate.kind === "reveal"
                      ? "Reveal"
                      : nextPublicCandidate.kind === "location"
                        ? "Lugar"
                        : "Rosto"}
                  </Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  {nextPublicCandidate.kind === "reveal" ? (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => void onReveal(nextPublicCandidate.id)}
                      disabled={revealingId === nextPublicCandidate.id}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {revealingId === nextPublicCandidate.id ? "Enviando..." : "Revelar"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-white/10 bg-white/5"
                      onClick={() => onInspectEntity(nextPublicCandidate.id)}
                    >
                      Consultar
                    </Button>
                  )}
                  {secondScreenReady && nextPublicCandidate.imageUrl ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary/20 bg-primary/10 text-primary"
                      onClick={() =>
                        void onPresentAsset(
                          nextPublicCandidate.id,
                          nextPublicCandidate.imageUrl!,
                          nextPublicCandidate.title,
                        )
                      }
                    >
                      TV
                    </Button>
                  ) : null}
                </div>

                {reservePublicCandidate ? (
                  <div className="mt-3 rounded-xl border border-white/8 bg-sidebar/50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-white/10 text-white/70">
                        Depois
                      </Badge>
                      <p className="text-sm font-medium text-foreground">
                        {reservePublicCandidate.title}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {reservePublicCandidate.description}
                    </p>
                    {reservePublicCandidate.objectiveHint ? (
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/60">
                        {reservePublicCandidate.objectiveHint}
                      </p>
                    ) : null}
                    {reservePublicCandidate.subsceneHint ? (
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-primary/70">
                        {reservePublicCandidate.subsceneHint}
                      </p>
                    ) : null}
                    {reservePublicCandidate.subsceneRevealLinked ? (
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-primary">
                        Reveal ligado diretamente a subcena
                      </p>
                    ) : null}
                    {reservePublicCandidate.inspectLinked ? (
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-emerald-300">
                        Ja em consulta pelo mestre
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            {primarySceneReveal ? (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Reveal principal da cena
                </p>
                <div className="rounded-xl border border-primary/20 bg-black/20 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {primarySceneReveal.title || "Revelacao sem titulo"}
                      </p>
                      {primarySceneReveal.notes ? (
                        <p className="mt-1 line-clamp-3 text-sm text-foreground/80">
                          {primarySceneReveal.notes}
                        </p>
                      ) : null}
                    </div>
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      {primarySceneReveal.status}
                    </Badge>
                  </div>
                  {secondScreenReady && primarySceneReveal.imageUrl ? (
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-primary/80">
                      Pronto para segunda tela
                    </p>
                  ) : null}
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => void onReveal(primarySceneReveal.id)}
                      disabled={revealingId === primarySceneReveal.id}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {revealingId === primarySceneReveal.id ? "Enviando..." : "Revelar agora"}
                    </Button>
                    {primarySceneReveal.imageUrl ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/10 bg-white/5"
                        onClick={() =>
                          window.open(primarySceneReveal.imageUrl, "_blank", "noopener,noreferrer")
                        }
                      >
                        Ver asset
                      </Button>
                    ) : null}
                    {secondScreenReady && primarySceneReveal.imageUrl ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary/20 bg-primary/10 text-primary"
                        onClick={() =>
                          void onPresentAsset(
                            primarySceneReveal.id,
                            primarySceneReveal.imageUrl!,
                            primarySceneReveal.title || "Reveal da cena",
                          )
                        }
                      >
                        Exibir na TV
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {secondarySceneReveals.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Reveals secundarios da cena
                </p>
                {secondarySceneReveals.slice(0, 2).map((item) => (
                  <div key={item.id} className="rounded-xl border border-white/8 bg-black/20 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {item.title || "Revelacao sem titulo"}
                        </p>
                        {item.notes ? (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {item.notes}
                          </p>
                        ) : null}
                      </div>
                      <Badge variant="outline" className="border-white/10 text-white/70">
                        {item.status}
                      </Badge>
                    </div>
                    {secondScreenReady && item.imageUrl ? (
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-primary/80">
                        Pronto para segunda tela
                      </p>
                    ) : null}
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => void onReveal(item.id)}
                        disabled={revealingId === item.id}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        {revealingId === item.id ? "Enviando..." : "Revelar"}
                      </Button>
                      {secondScreenReady && item.imageUrl ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-primary/20 bg-primary/10 text-primary"
                          onClick={() =>
                            void onPresentAsset(item.id, item.imageUrl!, item.title || "Reveal da cena")
                          }
                        >
                          TV
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {generalReveals.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Reveals gerais da sessao
                </p>
                {generalReveals.slice(0, activeScene ? 2 : 3).map((item) => (
                  <div key={item.id} className="rounded-xl border border-white/8 bg-black/20 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {item.title || "Revelacao sem titulo"}
                        </p>
                        {item.notes ? (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {item.notes}
                          </p>
                        ) : null}
                      </div>
                      <Badge variant="outline" className="border-white/10 text-white/70">
                        {item.status}
                      </Badge>
                    </div>
                    {secondScreenReady && item.imageUrl ? (
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-primary/80">
                        Pronto para segunda tela
                      </p>
                    ) : null}
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-white/10 bg-white/5"
                        onClick={() => void onReveal(item.id)}
                        disabled={revealingId === item.id}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        {revealingId === item.id ? "Enviando..." : "Revelar"}
                      </Button>
                      {secondScreenReady && item.imageUrl ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-primary/20 bg-primary/10 text-primary"
                          onClick={() =>
                            void onPresentAsset(item.id, item.imageUrl!, item.title || "Reveal da sessao")
                          }
                        >
                          TV
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {sceneVisualEntities.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Referencias da cena
                </p>
                {portraitRefs.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-primary/80">
                      Rostos em foco
                    </p>
                    <div className="grid gap-2">
                      {portraitRefs.slice(0, 2).map((entity) => (
                        <PlayerFacingAssetCard
                          key={entity.id}
                          entity={entity}
                          secondScreenReady={secondScreenReady}
                          activeInspectEntityId={activeInspectEntityId}
                          onInspectEntity={onInspectEntity}
                          onPresentAsset={onPresentAsset}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                {locationRefs.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-primary/80">
                      Lugares em foco
                    </p>
                    <div className="grid gap-2">
                      {locationRefs.slice(0, 2).map((entity) => (
                        <PlayerFacingAssetCard
                          key={entity.id}
                          entity={entity}
                          secondScreenReady={secondScreenReady}
                          activeInspectEntityId={activeInspectEntityId}
                          onInspectEntity={onInspectEntity}
                          onPresentAsset={onPresentAsset}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-3 rounded-2xl border border-white/8 bg-white/5 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                  Apenas mestre
                </p>
                <p className="mt-1 text-sm text-foreground/90">
                  Leitura tatico-narrativa, ajuste de combate e contexto privado da sessao.
                </p>
              </div>
              <Badge variant="outline" className="border-white/10 text-white/70">
                <Lock className="mr-1 h-3 w-3" />
                Privado
              </Badge>
            </div>

            {prepPacket.forge.tableObjective ? (
              <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/80">
                  <Target className="h-3 w-3" />
                  Objetivo de mesa
                </div>
                <p className="mt-2 text-sm text-foreground/90">{prepPacket.forge.tableObjective}</p>
              </div>
            ) : null}

            <div className="grid gap-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-3 py-2">
                <span className="inline-flex items-center gap-2">
                  <Clapperboard className="h-3 w-3" /> Cenas prontas
                </span>
                <span className="font-semibold text-foreground">
                  {prepPacket.forge.scenes.filter((scene) => scene.status !== "discarded").length}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-3 py-2">
                <span className="inline-flex items-center gap-2">
                  <Eye className="h-3 w-3" /> Reveals ativos
                </span>
                <span className="font-semibold text-foreground">
                  {prepPacket.forge.reveals.filter((item) => item.status !== "canceled").length}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-3 py-2">
                <span className="inline-flex items-center gap-2">
                  <Users2 className="h-3 w-3" /> Entidades em foco
                </span>
                <span className="font-semibold text-foreground">
                  {prepPacket.forge.linkedEntityIds.length}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-3 py-2">
                <span className="inline-flex items-center gap-2">
                  <Shield className="h-3 w-3" /> Encontros prontos
                </span>
                <span className="font-semibold text-foreground">
                  {prepPacket.forge.encounters.length}
                </span>
              </div>
            </div>

            {prepPacket.forge.scenes.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Foco de cena
                </p>
                {prepPacket.forge.scenes
                  .filter((scene) => scene.status !== "discarded")
                  .slice(0, 3)
                  .map((scene) => (
                    <button
                      key={scene.id}
                      type="button"
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        activeScene?.id === scene.id
                          ? "border-primary/25 bg-primary/10"
                          : "border-white/8 bg-black/20 hover:border-white/15"
                      }`}
                      onClick={() => onFocusScene(scene.id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {scene.title || "Cena sem titulo"}
                        </p>
                        <Badge variant="outline" className="border-white/10 text-white/70">
                          {scene.status}
                        </Badge>
                      </div>
                      {scene.objective ? (
                        <p className="mt-2 text-sm text-muted-foreground">{scene.objective}</p>
                      ) : null}
                    </button>
                  ))}
              </div>
            ) : null}

            {activeScene ? (
              <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                  Cena em foco
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {activeScene.title || "Cena sem titulo"}
                </p>
                {activeScene.objective ? (
                  <p className="mt-2 text-sm text-muted-foreground">{activeScene.objective}</p>
                ) : null}
                {activeSubscene ? (
                  <div className="mt-3 rounded-xl border border-primary/10 bg-primary/5 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                      Subcena ativa
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {activeSubscene.title || "Subcena sem titulo"}
                    </p>
                    {activeSubscene.objective ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {activeSubscene.objective}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            {gmSupportVisualEntities.length > 0 ? (
              <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                  Consulta do mestre
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Referencias fora da vitrine publica desta subcena, mantidas como apoio rapido de
                  consulta privada.
                </p>
                <div className="mt-3 space-y-2">
                  {gmSupportVisualEntities.slice(0, 3).map((entity) => (
                    <div
                      key={entity.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-sidebar/60 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{entity.name}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                          {entity.subtype || entity.type}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/10 bg-white/5"
                        onClick={() => onInspectEntity(entity.id)}
                      >
                        Consultar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {activeEncounter ? (
              <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-primary/20 bg-primary/10 text-primary">
                    {formatEncounterRating(activeEncounter.rating)}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 text-white/70">
                    Confianca {formatBalanceConfidence(activeEncounter.confidence)}
                  </Badge>
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {activeEncounter.title || "Encontro preparado"}
                </p>
                <div className="mt-3 grid gap-1 text-sm text-muted-foreground">
                  {activeEncounter.enemies.map((enemy) => (
                    <p key={`${activeEncounter.id}:${enemy.npcId ?? enemy.label}`}>
                      {enemy.quantity}x {enemy.label || "Ameaca sem nome"}
                    </p>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{activeEncounter.recommendation}</p>
              </div>
            ) : null}

            {livePressure ? (
              <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className={`${
                      livePressure.state === "critical"
                        ? "border-red-500/30 bg-red-500/15 text-red-300"
                        : livePressure.state === "rising"
                          ? "border-amber-500/30 bg-amber-500/15 text-amber-300"
                          : "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                    }`}
                  >
                    {formatLivePressureState(livePressure.state)}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 text-white/70">
                    Round {liveCombat?.round ?? 1}
                  </Badge>
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">Sinais ao vivo</p>
                <p className="mt-2 text-sm text-foreground/90">{livePressure.summary}</p>
                <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between rounded-xl border border-white/8 bg-sidebar/70 px-3 py-2">
                    <span>HP medio do grupo</span>
                    <span className="font-semibold text-foreground">
                      {Math.round(livePressure.playerHpRatio * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/8 bg-sidebar/70 px-3 py-2">
                    <span>HP medio hostil</span>
                    <span className="font-semibold text-foreground">
                      {Math.round(livePressure.hostileHpRatio * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/8 bg-sidebar/70 px-3 py-2">
                    <span>Contagem viva</span>
                    <span className="font-semibold text-foreground">
                      {livePressure.playerCount} x {livePressure.hostileCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/8 bg-sidebar/70 px-3 py-2">
                    <span>Quedas no grupo</span>
                    <span className="font-semibold text-foreground">{livePressure.downedPlayers}</span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{livePressure.recommendation}</p>
                {livePressure.factors.length > 0 ? (
                  <div className="mt-3 space-y-1 text-xs text-white/60">
                    {livePressure.factors.slice(0, 2).map((factor) => (
                      <p key={factor}>{factor}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {liveAdjustment ? (
              <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                <Badge
                  className={`${
                    liveAdjustment.posture === "ease"
                      ? "border-red-500/30 bg-red-500/15 text-red-300"
                      : liveAdjustment.posture === "escalate"
                        ? "border-sky-500/30 bg-sky-500/15 text-sky-300"
                        : "border-amber-500/30 bg-amber-500/15 text-amber-300"
                  }`}
                >
                  Ajuste rapido
                </Badge>
                <p className="mt-3 text-sm font-semibold text-foreground">{liveAdjustment.title}</p>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {liveAdjustment.actions.map((action) => (
                    <p key={action}>{action}</p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          Crie uma sessao na campanha e use a Forja de Sessao para trazer briefing, cenas e
          reveals para a mesa.
        </p>
      )}
    </div>
  );
}
