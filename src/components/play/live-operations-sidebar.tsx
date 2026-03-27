"use client";

import { useEffect, type FormEvent, type RefObject } from "react";
import { BookOpen, Map as MapIcon, MonitorUp, MonitorPlay, MessageSquare, Search } from "lucide-react";

import { CombatTracker } from "@/components/play/combat-tracker";
import { LiveCodexInspect, type LiveCodexEntity, type LiveEntityDetail } from "@/components/play/live-codex-inspect";
import { LiveFlowChecklist } from "@/components/play/live-flow-checklist";
import { LiveGmScratchpad } from "@/components/play/live-gm-scratchpad";
import { LiveHistoryChatStack } from "@/components/play/live-history-chat-stack";
import { LivePartyStatus } from "@/components/play/live-party-status";
import { LivePrepCockpit } from "@/components/play/live-prep-cockpit";
import { LiveSessionSoundtrack } from "@/components/play/live-session-soundtrack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LiveCombat, LiveOpsStatusMessage } from "@/lib/live-combat";
import type {
    SessionForgeDramaticItem,
    SessionForgeEncounter,
    SessionForgeScene,
    SessionForgeState,
} from "@/lib/session-forge";

type GameEvent = {
    id: string;
    type: string;
    scope: string;
    ts: string;
    payload: unknown;
    actorName?: string;
    visibility: string;
};

type SessionRecord = {
    id: string;
    title: string;
    status?: "planned" | "active" | "finished";
    scheduledAt?: string | null;
    metadata?: Record<string, unknown> | null;
};

type PrepSessionPacket = {
    session: SessionRecord;
    forge: SessionForgeState;
};

type LiveOperationsSidebarProps = {
    campaignId: string;
    campaignName: string;
    roomCode?: string | null;
    worldId: string;
    prepPacket: PrepSessionPacket | null;
    activeScene: SessionForgeScene | null;
    activeEncounter: SessionForgeEncounter | null;
    activeSceneReveals: SessionForgeDramaticItem[];
    currentPublicAsset: {
        title: string;
        detail: string;
    } | null;
    sceneVisualEntities: {
        id: string;
        name: string;
        type: string;
        subtype?: string | null;
        imageUrl: string;
        role: "portrait" | "location";
    }[];
    liveCombat: LiveCombat | null;
    monitorMode: boolean;
    tableFocusMode: "narrative" | "tactical";
    panelVisibility: {
        showSupport: boolean;
        showCodex: boolean;
    };
    showHistoryChat: boolean;
    soundtrack: {
        ambientUrl: string;
        combatUrl: string;
    };
    gmScratchpad: string;
    flowChecklist: {
        cockpit: boolean;
        combat: boolean;
        consult: boolean;
        visual: boolean;
        notes: boolean;
    };
    publicLayerLocked: boolean;
    partyStatus: {
        total: number;
        downed: number;
        lowHp: number;
        lowPm: number;
        lowSan: number;
        avgHpPercent: number;
        avgPmPercent: number;
        avgSanPercent: number;
    };
    revealingId: string | null;
    secondScreenReady: boolean;
    activeInspectEntityId: string | null;
    spawningEncounterEnemyId: string | null;
    spawnStatusMessage?: LiveOpsStatusMessage | null;
    executionStatusMessage?: LiveOpsStatusMessage | null;
    executingScope?: "scene" | "subscene" | null;
    dramaticExecutionStatusMessage?: LiveOpsStatusMessage | null;
    executingDramaticId?: string | null;
    inspectQuery: string;
    inspectCandidates: LiveCodexEntity[];
    inspectId: string | null;
    inspectEntity: LiveEntityDetail | null;
    inspectLoading: boolean;
    events: GameEvent[];
    pinnedEventIds: Set<string>;
    timelineFilter: "ALL" | "COMBAT" | "CHAT" | "CASE";
    chatInput: string;
    scrollRef: RefObject<HTMLDivElement | null>;
    onOpenAtlas: () => void;
    onOpenSecondScreen: () => void;
    onSummarize: () => void;
    onToggleMonitorMode: () => void;
    onTableFocusModeChange: (next: "narrative" | "tactical") => void;
    onPanelVisibilityChange: (next: { showSupport: boolean; showCodex: boolean }) => void;
    onToggleHistoryChat: () => void;
    onApplyCockpitPreset: (preset: "narrative" | "tactical") => void;
    onFocusScene: (sceneId: string) => void;
    onInspectEntity: (entityId: string) => void;
    onReveal: (revealId: string) => void | Promise<void>;
    onPresentAsset: (entityId: string, imageUrl: string, title: string) => void | Promise<void>;
    onSpawnEncounterEnemy: (
        enemy: SessionForgeEncounter["enemies"][number],
        enemyIndex: number,
    ) => void | Promise<void>;
    onSpawnEncounterRemaining: () => void | Promise<void>;
    onMarkActiveSceneExecuted: () => void | Promise<void>;
    onMarkActiveSubsceneExecuted: () => void | Promise<void>;
    onMarkDramaticExecuted: (
        collection: "hooks" | "secrets",
        itemId: string,
    ) => void | Promise<void>;
    onInspectQueryChange: (value: string) => void;
    onInspectIdChange: (value: string | null) => void;
    onOpenSearch: () => void;
    onTimelineFilterChange: (value: "ALL" | "COMBAT" | "CHAT" | "CASE") => void;
    onPinToggle: (id: string) => void;
    onChatInputChange: (value: string) => void;
    onChatSubmit: (event: FormEvent) => void;
    onVoiceTranscription: (text: string) => void;
    onCombatChange: () => void | Promise<void>;
    onSelectCombatCharacter: (characterId: string) => void;
    onSaveSoundtrack: (next: { ambientUrl: string; combatUrl: string }) => void;
    onGmScratchpadChange: (next: string) => void;
    onFlowChecklistToggle: (
        key: "cockpit" | "combat" | "consult" | "visual" | "notes",
        checked: boolean,
    ) => void;
    onFlowChecklistSetAll: (checked: boolean) => void;
    onTogglePublicLayerLock: () => void;
};

export function LiveOperationsSidebar({
    campaignId,
    campaignName,
    roomCode,
    worldId,
    prepPacket,
    activeScene,
    activeEncounter,
    activeSceneReveals,
    currentPublicAsset,
    sceneVisualEntities,
    liveCombat,
    monitorMode,
    tableFocusMode,
    panelVisibility,
    showHistoryChat,
    soundtrack,
    gmScratchpad,
    flowChecklist,
    publicLayerLocked,
    partyStatus,
    revealingId,
    secondScreenReady,
    activeInspectEntityId,
    spawningEncounterEnemyId,
    spawnStatusMessage,
    executionStatusMessage,
    executingScope,
    dramaticExecutionStatusMessage,
    executingDramaticId,
    inspectQuery,
    inspectCandidates,
    inspectId,
    inspectEntity,
    inspectLoading,
    events,
    pinnedEventIds,
    timelineFilter,
    chatInput,
    scrollRef,
    onOpenAtlas,
    onOpenSecondScreen,
    onSummarize,
    onToggleMonitorMode,
    onTableFocusModeChange,
    onPanelVisibilityChange,
    onToggleHistoryChat,
    onApplyCockpitPreset,
    onFocusScene,
    onInspectEntity,
    onReveal,
    onPresentAsset,
    onSpawnEncounterEnemy,
    onSpawnEncounterRemaining,
    onMarkActiveSceneExecuted,
    onMarkActiveSubsceneExecuted,
    onMarkDramaticExecuted,
    onInspectQueryChange,
    onInspectIdChange,
    onOpenSearch,
    onTimelineFilterChange,
    onPinToggle,
    onChatInputChange,
    onChatSubmit,
    onVoiceTranscription,
    onCombatChange,
    onSelectCombatCharacter,
    onSaveSoundtrack,
    onGmScratchpadChange,
    onFlowChecklistToggle,
    onFlowChecklistSetAll,
    onTogglePublicLayerLock,
}: LiveOperationsSidebarProps) {
    const jumpToSection = (sectionId: string) => {
        const target = document.getElementById(sectionId);
        if (!target) return;
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const isTacticalFocus = tableFocusMode === "tactical" || Boolean(liveCombat?.isActive);
    const flowChecklistDoneCount = Object.values(flowChecklist).filter(Boolean).length;

    const combatSection = (
        <div id="live-section-combate" className="px-3 pt-3">
            <CombatTracker
                campaignId={campaignId}
                liveCombat={liveCombat}
                onCombatChange={onCombatChange}
                onSelectCharacter={onSelectCombatCharacter}
            />
        </div>
    );

    const supportSection = (
        <>
            <div id="live-section-suporte" className="px-3 pt-3">
                <LivePartyStatus {...partyStatus} />
            </div>

            <div className="px-3 pt-3">
                <LiveSessionSoundtrack
                    isCombatActive={Boolean(liveCombat?.isActive)}
                    soundtrack={soundtrack}
                    onSave={onSaveSoundtrack}
                />
            </div>

            <div className="px-3 pt-3">
                <LiveGmScratchpad
                    value={gmScratchpad}
                    onChange={onGmScratchpadChange}
                />
            </div>

            <div className="px-3 pt-3">
                <LiveFlowChecklist
                    state={flowChecklist}
                    onToggle={onFlowChecklistToggle}
                />
            </div>
        </>
    );

    const prepSection = (
        <div id="live-section-preparo" className="px-3 py-3">
            <LivePrepCockpit
                worldId={worldId}
                campaignId={campaignId}
                prepPacket={prepPacket}
                activeScene={activeScene}
                activeEncounter={activeEncounter}
                activeSceneReveals={activeSceneReveals}
                currentPublicAsset={currentPublicAsset}
                sceneVisualEntities={sceneVisualEntities}
                liveCombat={liveCombat}
                partyStatus={partyStatus}
                revealingId={revealingId}
                secondScreenReady={secondScreenReady}
                activeInspectEntityId={activeInspectEntityId}
                spawningEncounterEnemyId={spawningEncounterEnemyId}
                spawnStatusMessage={spawnStatusMessage}
                executionStatusMessage={executionStatusMessage}
                executingScope={executingScope}
                dramaticExecutionStatusMessage={dramaticExecutionStatusMessage}
                executingDramaticId={executingDramaticId}
                publicLayerLocked={publicLayerLocked}
                onFocusScene={onFocusScene}
                onInspectEntity={onInspectEntity}
                onReveal={onReveal}
                onPresentAsset={onPresentAsset}
                onSpawnEncounterEnemy={onSpawnEncounterEnemy}
                onSpawnEncounterRemaining={onSpawnEncounterRemaining}
                onMarkActiveSceneExecuted={onMarkActiveSceneExecuted}
                onMarkActiveSubsceneExecuted={onMarkActiveSubsceneExecuted}
                onMarkDramaticExecuted={onMarkDramaticExecuted}
                onTogglePublicLayerLock={onTogglePublicLayerLock}
            />
        </div>
    );

    const codexSection = (
        <div id="live-section-codex" className="px-3 pb-3">
            <LiveCodexInspect
                worldId={worldId}
                inspectQuery={inspectQuery}
                inspectCandidates={inspectCandidates}
                inspectId={inspectId}
                inspectEntity={inspectEntity}
                inspectLoading={inspectLoading}
                onInspectQueryChange={onInspectQueryChange}
                onInspectIdChange={onInspectIdChange}
                onOpenSearch={onOpenSearch}
            />
        </div>
    );

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const tagName = target?.tagName.toLowerCase();
            const isTypingTarget =
                tagName === "input" ||
                tagName === "textarea" ||
                target?.isContentEditable;
            if (isTypingTarget || !event.altKey) return;

            if (event.key === "1") {
                event.preventDefault();
                jumpToSection("live-section-combate");
            } else if (event.key === "2") {
                event.preventDefault();
                jumpToSection("live-section-preparo");
            } else if (event.key === "3") {
                event.preventDefault();
                jumpToSection("live-section-codex");
            } else if (event.key === "4") {
                event.preventDefault();
                jumpToSection("live-section-suporte");
            } else if (event.key === "0") {
                event.preventDefault();
                onToggleHistoryChat();
            } else if (event.key === "6" && roomCode) {
                event.preventDefault();
                onOpenSecondScreen();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onOpenSecondScreen, onToggleHistoryChat, roomCode]);

    return (
        <div
            className={`z-[60] flex w-full flex-col border-l border-white/10 bg-sidebar ${
                monitorMode ? "md:w-[390px]" : "md:w-[350px]"
            }`}
        >
            <div className={`flex items-center justify-between border-b border-white/10 bg-black/20 ${monitorMode ? "p-4" : "p-3"}`}>
                <div className="flex flex-col">
                    <span className={`truncate font-bold uppercase tracking-wider text-primary/80 ${monitorMode ? "max-w-[190px] text-base" : "max-w-[150px] text-sm"}`}>
                        {campaignName}
                    </span>
                    <div className="flex items-center gap-1">
                        <Badge
                            variant="outline"
                            className={`w-fit border-green-500/30 text-green-500 ${monitorMode ? "h-5 text-xs" : "h-4 text-[10px]"}`}
                        >
                            Online
                        </Badge>
                        <Badge
                            variant="outline"
                            className={`w-fit ${roomCode ? "border-primary/30 text-primary" : "border-white/15 text-white/55"} ${monitorMode ? "h-5 text-xs" : "h-4 text-[10px]"}`}
                        >
                            {roomCode ? "2a tela pronta" : "2a tela offline"}
                        </Badge>
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" title="Busca rapida" onClick={onOpenSearch}>
                        <Search className="h-4 w-4 text-primary/90" />
                    </Button>
                    <Button
                        variant={showHistoryChat ? "default" : "ghost"}
                        size="icon"
                        title={showHistoryChat ? "Ocultar historico/chat" : "Mostrar historico/chat"}
                        onClick={onToggleHistoryChat}
                    >
                        <MessageSquare className={`h-4 w-4 ${showHistoryChat ? "text-primary-foreground" : "text-white/80"}`} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Abrir segunda tela"
                        onClick={onOpenSecondScreen}
                        disabled={!roomCode}
                    >
                        <MonitorPlay className={`h-4 w-4 ${roomCode ? "text-primary/90" : "text-white/35"}`} />
                    </Button>
                    <Button
                        variant={monitorMode ? "default" : "ghost"}
                        size="icon"
                        title="Alternar modo monitor"
                        onClick={onToggleMonitorMode}
                    >
                        <MonitorUp className={`text-primary ${monitorMode ? "h-5 w-5" : "h-4 w-4"}`} />
                    </Button>
                    <Button variant="ghost" size="icon" title="Abrir Atlas" onClick={onOpenAtlas}>
                        <MapIcon className="h-4 w-4 text-blue-400" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Invocar O Escriba" onClick={onSummarize}>
                        <BookOpen className="h-4 w-4 text-amber-500" />
                    </Button>
                </div>
            </div>

            <div className="border-b border-white/10 bg-black/10 px-3 py-2">
                <div className="mb-2 flex items-center gap-2">
                    <button
                        type="button"
                        className={`rounded border px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${
                            !isTacticalFocus
                                ? "border-primary/40 bg-primary/15 text-primary"
                                : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                        }`}
                        disabled={Boolean(liveCombat?.isActive)}
                        onClick={() => onTableFocusModeChange("narrative")}
                    >
                        Narracao
                    </button>
                    <button
                        type="button"
                        className={`rounded border px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${
                            isTacticalFocus
                                ? "border-red-500/40 bg-red-500/15 text-red-300"
                                : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                        }`}
                        onClick={() => onTableFocusModeChange("tactical")}
                    >
                        Tatica
                    </button>
                    {liveCombat?.isActive ? (
                        <span className="text-[10px] uppercase tracking-[0.14em] text-red-300/90">
                            combate ativo
                        </span>
                    ) : null}
                    <span className="ml-auto rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-emerald-300">
                        pronto {flowChecklistDoneCount}/5
                    </span>
                </div>
                <div className="mb-2 flex items-center gap-2">
                    <button
                        type="button"
                        className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/75 hover:bg-white/10"
                        onClick={() => onApplyCockpitPreset("narrative")}
                    >
                        Preset narrativo
                    </button>
                    <button
                        type="button"
                        className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/75 hover:bg-white/10"
                        onClick={() => onApplyCockpitPreset("tactical")}
                    >
                        Preset tatico
                    </button>
                </div>
                <div className="mb-2 flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-white/60">Secundarios:</span>
                    <button
                        type="button"
                        className={`rounded border px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${
                            panelVisibility.showCodex
                                ? "border-primary/40 bg-primary/15 text-primary"
                                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                        }`}
                        onClick={() =>
                            onPanelVisibilityChange({
                                ...panelVisibility,
                                showCodex: !panelVisibility.showCodex,
                            })
                        }
                    >
                        Codex
                    </button>
                    <button
                        type="button"
                        className={`rounded border px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${
                            panelVisibility.showSupport
                                ? "border-primary/40 bg-primary/15 text-primary"
                                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                        }`}
                        onClick={() =>
                            onPanelVisibilityChange({
                                ...panelVisibility,
                                showSupport: !panelVisibility.showSupport,
                            })
                        }
                    >
                        Suporte
                    </button>
                </div>
                <div className="flex flex-wrap gap-1">
                    <button
                        type="button"
                        className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/80 hover:bg-white/10"
                        onClick={() => jumpToSection("live-section-combate")}
                    >
                        Combate
                    </button>
                    <button
                        type="button"
                        className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/80 hover:bg-white/10"
                        onClick={() => jumpToSection("live-section-preparo")}
                    >
                        Preparo
                    </button>
                    <button
                        type="button"
                        className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/80 hover:bg-white/10"
                        onClick={() => jumpToSection("live-section-codex")}
                    >
                        Codex
                    </button>
                    <button
                        type="button"
                        className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/80 hover:bg-white/10"
                        onClick={() => jumpToSection("live-section-suporte")}
                    >
                        Suporte
                    </button>
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-white/45">
                    Atalhos: Alt+1..4 secoes, Alt+5 chat, Alt+6 2a tela, Alt+0 chat on/off, Ctrl/Cmd+K busca
                </p>
                <div className="mt-2 flex gap-2">
                    <button
                        type="button"
                        className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/75 hover:bg-white/10"
                        onClick={() => onFlowChecklistSetAll(true)}
                    >
                        Marcar tudo
                    </button>
                    <button
                        type="button"
                        className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/75 hover:bg-white/10"
                        onClick={() => onFlowChecklistSetAll(false)}
                    >
                        Limpar
                    </button>
                </div>
            </div>

            <ScrollArea className="max-h-[56vh] border-b border-white/10">
                {isTacticalFocus ? (
                    <>
                        {combatSection}
                        {panelVisibility.showSupport ? supportSection : null}
                        {prepSection}
                        {panelVisibility.showCodex ? codexSection : null}
                    </>
                ) : (
                    <>
                        {prepSection}
                        {panelVisibility.showCodex ? codexSection : null}
                        {panelVisibility.showSupport ? supportSection : null}
                        {combatSection}
                    </>
                )}
            </ScrollArea>

            {showHistoryChat ? (
                <div className="min-h-0 flex-1">
                    <LiveHistoryChatStack
                        events={events}
                        pinnedEventIds={pinnedEventIds}
                        timelineFilter={timelineFilter}
                        chatInput={chatInput}
                        scrollRef={scrollRef}
                        onTimelineFilterChange={onTimelineFilterChange}
                        onPinToggle={onPinToggle}
                        onChatInputChange={onChatInputChange}
                        onChatSubmit={onChatSubmit}
                        onVoiceTranscription={onVoiceTranscription}
                    />
                </div>
            ) : (
                <div className="border-t border-white/10 bg-black/20 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-white/50">
                    Historico/chat oculto para foco operacional
                </div>
            )}
        </div>
    );
}
