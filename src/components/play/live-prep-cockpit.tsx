"use client";

import { Clapperboard, Eye, Shield, Target, Users2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
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

type LivePrepCockpitProps = {
  prepPacket: PrepSessionPacket | null;
  activeScene: SessionForgeScene | null;
  activeEncounter: SessionForgeEncounter | null;
  activeSceneReveals: SessionForgeDramaticItem[];
  sceneVisualEntities: {
    id: string;
    name: string;
    type: string;
    subtype?: string | null;
    imageUrl: string;
    role: "portrait" | "location";
  }[];
  liveCombat: LiveCombat | null;
  revealingId: string | null;
  onFocusScene: (sceneId: string) => void;
  onInspectEntity: (entityId: string) => void;
  onReveal: (revealId: string) => void | Promise<void>;
};

export function LivePrepCockpit({
  prepPacket,
  activeScene,
  activeEncounter,
  activeSceneReveals,
  sceneVisualEntities,
  liveCombat,
  revealingId,
  onFocusScene,
  onInspectEntity,
  onReveal,
}: LivePrepCockpitProps) {
  const livePressure =
    liveCombat?.isActive && liveCombat.combatants.length > 0
      ? analyzeLiveCombatPressure(liveCombat.combatants)
      : null;
  const liveAdjustment = livePressure
    ? suggestLiveAdjustment(livePressure, activeEncounter?.rating ?? null)
    : null;
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
  const portraitRefs = sceneVisualEntities.filter((item) => item.role === "portrait");
  const locationRefs = sceneVisualEntities.filter((item) => item.role === "location");

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
          {prepPacket.forge.tableObjective ? (
            <div className="rounded-xl border border-white/8 bg-white/5 p-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/80">
                <Target className="h-3 w-3" />
                Objetivo de mesa
              </div>
              <p className="mt-2 text-sm text-foreground/90">{prepPacket.forge.tableObjective}</p>
            </div>
          ) : null}

          <div className="grid gap-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-3 py-2">
              <span className="inline-flex items-center gap-2">
                <Clapperboard className="h-3 w-3" /> Cenas prontas
              </span>
              <span className="font-semibold text-foreground">
                {prepPacket.forge.scenes.filter((scene) => scene.status !== "discarded").length}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-3 py-2">
              <span className="inline-flex items-center gap-2">
                <Eye className="h-3 w-3" /> Reveals ativos
              </span>
              <span className="font-semibold text-foreground">
                {prepPacket.forge.reveals.filter((item) => item.status !== "canceled").length}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-3 py-2">
              <span className="inline-flex items-center gap-2">
                <Users2 className="h-3 w-3" /> Entidades em foco
              </span>
              <span className="font-semibold text-foreground">
                {prepPacket.forge.linkedEntityIds.length}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-3 py-2">
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
                        : "border-white/8 bg-white/5 hover:border-white/15"
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
            <div className="rounded-xl border border-white/8 bg-white/5 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                Cena em foco
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {activeScene.title || "Cena sem titulo"}
              </p>
              {activeScene.objective ? (
                <p className="mt-2 text-sm text-muted-foreground">{activeScene.objective}</p>
              ) : null}
            </div>
          ) : null}

          {activeEncounter ? (
            <div className="rounded-xl border border-white/8 bg-white/5 p-3">
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
            <div className="rounded-xl border border-white/8 bg-white/5 p-3">
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
                <div className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-3 py-2">
                  <span>HP medio do grupo</span>
                  <span className="font-semibold text-foreground">
                    {Math.round(livePressure.playerHpRatio * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-3 py-2">
                  <span>HP medio hostil</span>
                  <span className="font-semibold text-foreground">
                    {Math.round(livePressure.hostileHpRatio * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-3 py-2">
                  <span>Contagem viva</span>
                  <span className="font-semibold text-foreground">
                    {livePressure.playerCount} x {livePressure.hostileCount}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-3 py-2">
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
            <div className="rounded-xl border border-white/8 bg-white/5 p-3">
              <div className="flex flex-wrap items-center gap-2">
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
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">{liveAdjustment.title}</p>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                {liveAdjustment.actions.map((action) => (
                  <p key={action}>{action}</p>
                ))}
              </div>
            </div>
          ) : null}

          {primarySceneReveal ? (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Reveal principal da cena
              </p>
              <div className="rounded-xl border border-primary/20 bg-primary/10 p-3">
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
                <div key={item.id} className="rounded-xl border border-white/8 bg-white/5 p-3">
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
                <div key={item.id} className="rounded-xl border border-white/8 bg-white/5 p-3">
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
                      <div
                        key={entity.id}
                        className="overflow-hidden rounded-xl border border-white/8 bg-white/5"
                      >
                        <div
                          className="h-28 bg-cover bg-center"
                          style={{
                            backgroundImage: `linear-gradient(180deg, rgba(8,8,13,0.08), rgba(8,8,13,0.72)), url(${entity.imageUrl})`,
                          }}
                        />
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {entity.name}
                              </p>
                              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                {entity.subtype || entity.type}
                              </p>
                            </div>
                            <Badge variant="outline" className="border-white/10 text-white/70">
                              Retrato
                            </Badge>
                          </div>
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
                          </div>
                        </div>
                      </div>
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
                      <div
                        key={entity.id}
                        className="overflow-hidden rounded-xl border border-white/8 bg-white/5"
                      >
                        <div
                          className="h-24 bg-cover bg-center"
                          style={{
                            backgroundImage: `linear-gradient(180deg, rgba(8,8,13,0.08), rgba(8,8,13,0.78)), url(${entity.imageUrl})`,
                          }}
                        />
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {entity.name}
                              </p>
                              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                {entity.subtype || entity.type}
                              </p>
                            </div>
                            <Badge variant="outline" className="border-white/10 text-white/70">
                              Cenario
                            </Badge>
                          </div>
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
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
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
