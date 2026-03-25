"use client";

import type { FormEvent, RefObject } from "react";
import { BookOpen, Map as MapIcon } from "lucide-react";

import { CombatTracker } from "@/components/play/combat-tracker";
import { LiveCodexInspect, type LiveCodexEntity, type LiveEntityDetail } from "@/components/play/live-codex-inspect";
import { LiveHistoryChatStack } from "@/components/play/live-history-chat-stack";
import { LivePrepCockpit } from "@/components/play/live-prep-cockpit";
import { LiveSessionSoundtrack } from "@/components/play/live-session-soundtrack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    soundtrack: {
        ambientUrl: string;
        combatUrl: string;
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
    soundtrack,
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
}: LiveOperationsSidebarProps) {
    return (
        <div className="z-[60] flex w-full flex-col border-l border-white/10 bg-sidebar md:w-[350px]">
            <div className="flex items-center justify-between border-b border-white/10 bg-black/20 p-3">
                <div className="flex flex-col">
                    <span className="max-w-[150px] truncate text-sm font-bold uppercase tracking-wider text-primary/80">
                        {campaignName}
                    </span>
                    <Badge
                        variant="outline"
                        className="h-4 w-fit border-green-500/30 text-[10px] text-green-500"
                    >
                        Online
                    </Badge>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" title="Abrir Atlas" onClick={onOpenAtlas}>
                        <MapIcon className="h-4 w-4 text-blue-400" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Invocar O Escriba" onClick={onSummarize}>
                        <BookOpen className="h-4 w-4 text-amber-500" />
                    </Button>
                </div>
            </div>

            <div className="px-3 pt-3">
                <CombatTracker
                    campaignId={campaignId}
                    liveCombat={liveCombat}
                    onCombatChange={onCombatChange}
                />
            </div>

            <div className="px-3 pt-3">
                <LiveSessionSoundtrack
                    isCombatActive={Boolean(liveCombat?.isActive)}
                    soundtrack={soundtrack}
                    onSave={onSaveSoundtrack}
                />
            </div>

            <div className="px-3 pt-3">
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

            <div className="px-3 pt-3">
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
    );
}
