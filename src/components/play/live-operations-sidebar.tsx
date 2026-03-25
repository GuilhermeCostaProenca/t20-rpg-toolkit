"use client";

import type { FormEvent, RefObject } from "react";
import { BookOpen, Map as MapIcon, MonitorUp, Search } from "lucide-react";

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
    onSummarize: () => void;
    onToggleMonitorMode: () => void;
    onFocusScene: (sceneId: string) => void;
    onInspectEntity: (entityId: string) => void;
    onReveal: (revealId: string) => void | Promise<void>;
    onPresentAsset: (entityId: string, imageUrl: string, title: string) => void | Promise<void>;
    onSpawnEncounterEnemy: (
        enemy: SessionForgeEncounter["enemies"][number],
        enemyIndex: number,
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
    onSaveSoundtrack: (next: { ambientUrl: string; combatUrl: string }) => void;
    onGmScratchpadChange: (next: string) => void;
    onFlowChecklistToggle: (
        key: "cockpit" | "combat" | "consult" | "visual" | "notes",
        checked: boolean,
    ) => void;
};

export function LiveOperationsSidebar({
    campaignId,
    campaignName,
    worldId,
    prepPacket,
    activeScene,
    activeEncounter,
    activeSceneReveals,
    currentPublicAsset,
    sceneVisualEntities,
    liveCombat,
    monitorMode,
    soundtrack,
    gmScratchpad,
    flowChecklist,
    partyStatus,
    revealingId,
    secondScreenReady,
    activeInspectEntityId,
    spawningEncounterEnemyId,
    spawnStatusMessage,
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
    onSummarize,
    onToggleMonitorMode,
    onFocusScene,
    onInspectEntity,
    onReveal,
    onPresentAsset,
    onSpawnEncounterEnemy,
    onInspectQueryChange,
    onInspectIdChange,
    onOpenSearch,
    onTimelineFilterChange,
    onPinToggle,
    onChatInputChange,
    onChatSubmit,
    onVoiceTranscription,
    onCombatChange,
    onSaveSoundtrack,
    onGmScratchpadChange,
    onFlowChecklistToggle,
}: LiveOperationsSidebarProps) {
    const jumpToSection = (sectionId: string) => {
        const target = document.getElementById(sectionId);
        if (!target) return;
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    };

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
                    <Badge
                        variant="outline"
                        className={`w-fit border-green-500/30 text-green-500 ${monitorMode ? "h-5 text-xs" : "h-4 text-[10px]"}`}
                    >
                        Online
                    </Badge>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" title="Busca rapida" onClick={onOpenSearch}>
                        <Search className="h-4 w-4 text-primary/90" />
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
            </div>

            <ScrollArea className="max-h-[56vh] border-b border-white/10">
                <div id="live-section-combate" className="px-3 pt-3">
                    <CombatTracker
                        campaignId={campaignId}
                        liveCombat={liveCombat}
                        onCombatChange={onCombatChange}
                    />
                </div>

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

                <div id="live-section-preparo" className="px-3 py-3">
                    <LivePrepCockpit
                    prepPacket={prepPacket}
                    activeScene={activeScene}
                    activeEncounter={activeEncounter}
                    activeSceneReveals={activeSceneReveals}
                    currentPublicAsset={currentPublicAsset}
                    sceneVisualEntities={sceneVisualEntities}
                        liveCombat={liveCombat}
                        revealingId={revealingId}
                        secondScreenReady={secondScreenReady}
                        activeInspectEntityId={activeInspectEntityId}
                        spawningEncounterEnemyId={spawningEncounterEnemyId}
                        spawnStatusMessage={spawnStatusMessage}
                        onFocusScene={onFocusScene}
                        onInspectEntity={onInspectEntity}
                        onReveal={onReveal}
                        onPresentAsset={onPresentAsset}
                        onSpawnEncounterEnemy={onSpawnEncounterEnemy}
                    />
                </div>

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
            </ScrollArea>

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
        </div>
    );
}
