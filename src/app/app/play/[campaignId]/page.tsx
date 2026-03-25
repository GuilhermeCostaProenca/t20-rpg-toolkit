"use client";

import { useCallback, useEffect, useState, useRef, FormEvent } from "react";
import { useParams } from "next/navigation";
import { QuickSheet } from "./quick-sheet";
import {
    type LiveCodexEntity,
    type LiveEntityDetail,
} from "@/components/play/live-codex-inspect";
import { LiveOperationsSidebar } from "@/components/play/live-operations-sidebar";
import { LiveWarRoom } from "@/components/play/live-war-room";
import { OmniSearch } from "@/components/archives/omni-search";
import { GrimoireDetailView, type GrimoireItem } from "@/components/archives/grimoire-detail-view";
import { DiceCanvas, DiceCanvasRef } from "@/components/dice/dice-canvas";
import { DieType } from "@/components/dice/die";
import { RevealOverlay } from "@/components/reveal-overlay";
import { type Pin, type Token } from "@/components/map/interactive-map";
import { CortexOverlay } from "@/components/cortex/cortex-overlay";

import { Button } from "@/components/ui/button";
import type {
    CampaignNpc,
    LiveCombat,
    LiveOpsStatusMessage,
} from "@/lib/live-combat";
import {
    LIVE_COMBAT_POLL_MS,
    LIVE_PARTY_POLL_MS,
    LIVE_SPAWN_STATUS_MS,
    getCampaignCombatPath,
    getCampaignCombatantsPath,
    getCampaignCombatTurnPath,
    getCampaignNpcsPath,
} from "@/lib/live-combat";
import {
    normalizeSessionForgeState,
    type SessionForgeEncounterEnemy,
    type SessionForgeState,
} from "@/lib/session-forge";

// --- Types ---
type GameEvent = {
    id: string;
    type: string;
    scope: string;
    ts: string;
    payload: Record<string, unknown>;
    actorName?: string;
    visibility: string;
    campaignId?: string | null;
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

type CampaignContext = {
    id: string;
    name: string;
    roomCode?: string | null;
};

type LivePublicAsset = {
    title: string;
    detail: string;
};

type SessionSoundtrack = {
    ambientUrl: string;
    combatUrl: string;
};

type LivePartyStatusSnapshot = {
    total: number;
    downed: number;
    lowHp: number;
    lowPm: number;
    lowSan: number;
    avgHpPercent: number;
    avgPmPercent: number;
    avgSanPercent: number;
};

type LiveFlowChecklistState = {
    cockpit: boolean;
    combat: boolean;
    consult: boolean;
    visual: boolean;
    notes: boolean;
};

type TableFocusMode = "narrative" | "tactical";
type LiveCockpitPanelVisibility = {
    showSupport: boolean;
    showCodex: boolean;
};

const EMPTY_PARTY_STATUS: LivePartyStatusSnapshot = {
    total: 0,
    downed: 0,
    lowHp: 0,
    lowPm: 0,
    lowSan: 0,
    avgHpPercent: 0,
    avgPmPercent: 0,
    avgSanPercent: 0,
};

const EMPTY_FLOW_CHECKLIST: LiveFlowChecklistState = {
    cockpit: false,
    combat: false,
    consult: false,
    visual: false,
    notes: false,
};

const DEFAULT_COCKPIT_PANELS: LiveCockpitPanelVisibility = {
    showSupport: true,
    showCodex: true,
};

export default function PlayPage() {
    const params = useParams();
    const campaignId = params?.campaignId as string;
    const [events, setEvents] = useState<GameEvent[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [sheetCollapsed, setSheetCollapsed] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const diceRef = useRef<DiceCanvasRef>(null);
    // Physics State Sync
    const [pendingRoll, setPendingRoll] = useState<{ expression: string, modifier: number, count: number } | null>(null);
    const processedEventsRef = useRef<Set<string>>(new Set());
    const hasHydratedEventsRef = useRef(false);
    const lastEventsFingerprintRef = useRef("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [viewingGrimoireItem, setViewingGrimoireItem] = useState<GrimoireItem | null>(null);
    const [pins, setPins] = useState<Pin[]>([]);
    const [pinnedEventIds, setPinnedEventIds] = useState<Set<string>>(new Set());
    const [timelineFilter, setTimelineFilter] = useState<'ALL' | 'COMBAT' | 'CHAT' | 'CASE'>('ALL'); // Added CASE
    const [prepPacket, setPrepPacket] = useState<PrepSessionPacket | null>(null);
    const [liveCodexEntities, setLiveCodexEntities] = useState<LiveCodexEntity[]>([]);
    const [inspectQuery, setInspectQuery] = useState("");
    const [inspectId, setInspectId] = useState<string | null>(null);
    const [inspectEntity, setInspectEntity] = useState<LiveEntityDetail | null>(null);
    const [inspectLoading, setInspectLoading] = useState(false);
    const [revealingId, setRevealingId] = useState<string | null>(null);
    const [focusedSceneId, setFocusedSceneId] = useState<string | null>(null);
    const [liveCombat, setLiveCombat] = useState<LiveCombat | null>(null);
    const [mapTokens, setMapTokens] = useState<Token[]>([]);
    const [currentPublicAsset, setCurrentPublicAsset] = useState<LivePublicAsset | null>(null);
    const [spawningEncounterEnemyId, setSpawningEncounterEnemyId] = useState<string | null>(null);
    const [spawnStatusMessage, setSpawnStatusMessage] = useState<LiveOpsStatusMessage | null>(null);
    const [soundtrack, setSoundtrack] = useState<SessionSoundtrack>({
        ambientUrl: "",
        combatUrl: "",
    });
    const [gmScratchpad, setGmScratchpad] = useState("");
    const [monitorMode, setMonitorMode] = useState(false);
    const [tableFocusMode, setTableFocusMode] = useState<TableFocusMode>("narrative");
    const [cockpitPanels, setCockpitPanels] = useState<LiveCockpitPanelVisibility>(DEFAULT_COCKPIT_PANELS);
    const [showHistoryChat, setShowHistoryChat] = useState(true);
    const [flowChecklist, setFlowChecklist] = useState<LiveFlowChecklistState>(EMPTY_FLOW_CHECKLIST);
    const [partyStatus, setPartyStatus] = useState<LivePartyStatusSnapshot>(EMPTY_PARTY_STATUS);

    const loadLiveCombat = useCallback(async () => {
        if (!campaignId) return;
        try {
            const res = await fetch(getCampaignCombatPath(campaignId), { cache: "no-store" });
            const json = await res.json();
            setLiveCombat((json.data as LiveCombat | null | undefined) ?? null);
        } catch (error) {
            console.error("Live combat load failed", error);
            setLiveCombat(null);
        }
    }, [campaignId]);

    // Initial Map Load
    useEffect(() => {
        if (!campaignId) return;

        fetch(`/api/campaigns/${campaignId}/map`)
            .then(res => res.json())
            .then(data => {
                if (data.tokens) setMapTokens(data.tokens);
                if (data.pins) setPins(data.pins);
            })
            .catch(err => console.error("Map load failed", err));
    }, [campaignId]);

    useEffect(() => {
        hasHydratedEventsRef.current = false;
        processedEventsRef.current = new Set();
        lastEventsFingerprintRef.current = "";
        setEvents([]);
    }, [campaignId]);

    useEffect(() => {
        if (!campaignId) return;
        try {
            const raw = window.localStorage.getItem(`t20.live.soundtrack.${campaignId}`);
            if (!raw) {
                setSoundtrack({ ambientUrl: "", combatUrl: "" });
                return;
            }
            const parsed = JSON.parse(raw) as Partial<SessionSoundtrack>;
            setSoundtrack({
                ambientUrl: typeof parsed.ambientUrl === "string" ? parsed.ambientUrl : "",
                combatUrl: typeof parsed.combatUrl === "string" ? parsed.combatUrl : "",
            });
        } catch (error) {
            console.error("Failed to load soundtrack presets", error);
            setSoundtrack({ ambientUrl: "", combatUrl: "" });
        }
    }, [campaignId]);

    useEffect(() => {
        if (!campaignId) return;
        try {
            const notes = window.localStorage.getItem(`t20.live.gm-scratchpad.${campaignId}`) ?? "";
            setGmScratchpad(notes);
        } catch (error) {
            console.error("Failed to load GM scratchpad", error);
            setGmScratchpad("");
        }
    }, [campaignId]);

    useEffect(() => {
        if (!campaignId) return;
        try {
            const saved = window.localStorage.getItem(`t20.live.monitor-mode.${campaignId}`);
            setMonitorMode(saved === "true");
        } catch (error) {
            console.error("Failed to load monitor mode", error);
            setMonitorMode(false);
        }
    }, [campaignId]);

    useEffect(() => {
        if (!campaignId) return;
        try {
            const saved = window.localStorage.getItem(`t20.live.table-focus.${campaignId}`);
            setTableFocusMode(saved === "tactical" ? "tactical" : "narrative");
        } catch (error) {
            console.error("Failed to load table focus mode", error);
            setTableFocusMode("narrative");
        }
    }, [campaignId]);

    useEffect(() => {
        if (!campaignId) return;
        try {
            const saved = window.localStorage.getItem(`t20.live.cockpit-panels.${campaignId}`);
            if (!saved) {
                setCockpitPanels(DEFAULT_COCKPIT_PANELS);
                return;
            }
            const parsed = JSON.parse(saved) as Partial<LiveCockpitPanelVisibility>;
            setCockpitPanels({
                showSupport: parsed.showSupport !== false,
                showCodex: parsed.showCodex !== false,
            });
        } catch (error) {
            console.error("Failed to load cockpit panel visibility", error);
            setCockpitPanels(DEFAULT_COCKPIT_PANELS);
        }
    }, [campaignId]);

    useEffect(() => {
        if (!campaignId) return;
        try {
            const saved = window.localStorage.getItem(`t20.live.history-chat.${campaignId}`);
            setShowHistoryChat(saved !== "false");
        } catch (error) {
            console.error("Failed to load history chat visibility", error);
            setShowHistoryChat(true);
        }
    }, [campaignId]);

    useEffect(() => {
        if (!campaignId) return;
        try {
            const raw = window.localStorage.getItem(`t20.live.flow-checklist.${campaignId}`);
            if (!raw) {
                setFlowChecklist(EMPTY_FLOW_CHECKLIST);
                return;
            }
            const parsed = JSON.parse(raw) as Partial<LiveFlowChecklistState>;
            setFlowChecklist({
                cockpit: Boolean(parsed.cockpit),
                combat: Boolean(parsed.combat),
                consult: Boolean(parsed.consult),
                visual: Boolean(parsed.visual),
                notes: Boolean(parsed.notes),
            });
        } catch (error) {
            console.error("Failed to load flow checklist", error);
            setFlowChecklist(EMPTY_FLOW_CHECKLIST);
        }
    }, [campaignId]);

    // Token Sync (Optimistic + DB)
    const handleTokenMove = async (id: string, x: number, y: number) => {
        // Optimistic UI
        setMapTokens(prev => prev.map(t => t.id === id ? { ...t, x, y } : t));

        // Save (Debouce could be added here if needed, but for now direct save)
        await fetch(`/api/campaigns/${campaignId}/map/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, x, y })
        });
    };

    // Pin Sync
    const handlePinCreate = async (pin: Pin) => {
        setPins(prev => [...prev, pin]);

        if (pin.type === 'PING') {
            handleAction('PING', { x: pin.x, y: pin.y });
            setTimeout(() => {
                setPins(prev => prev.filter(p => p.id !== pin.id));
            }, 3000);
        } else {
            // Save Persistent Pin (MARKER)
            await fetch(`/api/campaigns/${campaignId}/map/pin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pin)
            });
        }
    };

    // Scroll to bottom & Process Auto-Rolls
    useEffect(() => {
        if (scrollRef.current) {
            const scrollArea = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight;
        }

        // Auto-Roll Logic (Passive AI / Visuals)
        const newInitiatives = events.filter(e =>
            e.type === 'INITIATIVE' && !processedEventsRef.current.has(e.id)
        );

        if (newInitiatives.length > 0) {
            // Trigger 3D Dice for each new initiative
            const diceTypes: DieType[] = newInitiatives.map(() => 'd20');
            // Limit to 10 dice max to avoid physics explosion
            const limitedDice = diceTypes.slice(0, 10);

            diceRef.current?.roll(limitedDice);

            // Mark as processed
            newInitiatives.forEach(e => processedEventsRef.current.add(e.id));
        }

    }, [events]);

    // NOTE: We need to fetch the Campaign first to get the WorldID.
    const [context, setContext] = useState<{ worldId: string; campaign: CampaignContext } | null>(null);

    useEffect(() => {
        if (campaignId) {
            fetch(`/api/campaigns/${campaignId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.data) setContext({ worldId: data.data.worldId, campaign: data.data });
                });
        }
    }, [campaignId]);

    // Real polling with context
    useEffect(() => {
        if (!context) return;

        const poll = async () => {
            try {
                const res = await fetch(`/api/worlds/${context.worldId}/events`);
                const json = await res.json();
                if (json.data) {
                    // Filter client side for MVP or use query param
                    const campaignEvents = (json.data as GameEvent[]).filter(
                        (event) => event.campaignId === campaignId || event.scope === "MACRO",
                    );
                    if (!hasHydratedEventsRef.current) {
                        const historicalInitiativeIds = campaignEvents
                            .filter((event) => event.type === "INITIATIVE")
                            .map((event) => event.id);
                        processedEventsRef.current = new Set(historicalInitiativeIds);
                        hasHydratedEventsRef.current = true;
                    }

                    const fingerprint = campaignEvents.map((event) => `${event.id}:${event.ts}`).join("|");
                    if (fingerprint !== lastEventsFingerprintRef.current) {
                        lastEventsFingerprintRef.current = fingerprint;
                        setEvents(campaignEvents);
                    }
                }
            } catch (e) { console.error("Poll fail", e); }
        };

        poll();
        const interval = setInterval(poll, 2000);
        return () => clearInterval(interval);
    }, [context, campaignId]);

    useEffect(() => {
        if (!campaignId) return;

        const loadPrepPacket = async () => {
            try {
                const res = await fetch(`/api/campaigns/${campaignId}/sessions`, { cache: "no-store" });
                const json = await res.json();
                const sessions = (json.data as SessionRecord[] | undefined) ?? [];
                const ordered = [...sessions].sort((left, right) => {
                    const leftPriority = left.status === "active" ? 0 : left.status === "planned" ? 1 : 2;
                    const rightPriority = right.status === "active" ? 0 : right.status === "planned" ? 1 : 2;
                    if (leftPriority !== rightPriority) return leftPriority - rightPriority;

                    const leftDate = left.scheduledAt ? new Date(left.scheduledAt).getTime() : Number.MAX_SAFE_INTEGER;
                    const rightDate = right.scheduledAt ? new Date(right.scheduledAt).getTime() : Number.MAX_SAFE_INTEGER;
                    return leftDate - rightDate;
                });

                const target = ordered.find((session) => session.status === "active")
                    ?? ordered.find((session) => session.status === "planned")
                    ?? null;

                if (!target) {
                    setPrepPacket(null);
                    return;
                }

                setPrepPacket({
                    session: target,
                    forge: normalizeSessionForgeState(target.metadata),
                });
            } catch (error) {
                console.error("Prep packet load failed", error);
            }
        };

        void loadPrepPacket();
    }, [campaignId]);

    useEffect(() => {
        if (!campaignId) return;
        void loadLiveCombat();
        const interval = setInterval(() => {
            void loadLiveCombat();
        }, LIVE_COMBAT_POLL_MS);

        return () => {
            clearInterval(interval);
        };
    }, [campaignId, loadLiveCombat]);

    useEffect(() => {
        if (!campaignId) return;

        const pollPartyStatus = async () => {
            try {
                const response = await fetch(`/api/characters?campaignId=${campaignId}&withSheet=true`, {
                    cache: "no-store",
                });
                const json = await response.json();
                const characters = (json.data as CampaignCharacter[] | undefined) ?? [];
                if (characters.length === 0) {
                    setPartyStatus(EMPTY_PARTY_STATUS);
                    return;
                }

                const hpRatios = characters.map((character) => {
                    const current = character.sheet?.pvCurrent ?? 0;
                    const max = Math.max(1, character.sheet?.pvMax ?? 1);
                    return current / max;
                });
                const pmRatios = characters.map((character) => {
                    const current = character.sheet?.pmCurrent ?? 0;
                    const max = Math.max(1, character.sheet?.pmMax ?? 1);
                    return current / max;
                });
                const sanRatios = characters.map((character) => {
                    const current = character.sheet?.sanCurrent ?? 0;
                    const max = Math.max(1, character.sheet?.sanMax ?? 1);
                    return current / max;
                });

                const average = (values: number[]) =>
                    values.length > 0
                        ? Math.round((values.reduce((acc, value) => acc + value, 0) / values.length) * 100)
                        : 0;

                setPartyStatus({
                    total: characters.length,
                    downed: characters.filter((character) => (character.sheet?.pvCurrent ?? 0) <= 0).length,
                    lowHp: characters.filter((character) => {
                        const max = Math.max(1, character.sheet?.pvMax ?? 1);
                        return (character.sheet?.pvCurrent ?? 0) / max <= 0.35;
                    }).length,
                    lowPm: characters.filter((character) => {
                        const max = Math.max(1, character.sheet?.pmMax ?? 1);
                        return (character.sheet?.pmCurrent ?? 0) / max <= 0.35;
                    }).length,
                    lowSan: characters.filter((character) => {
                        const max = Math.max(1, character.sheet?.sanMax ?? 1);
                        return (character.sheet?.sanCurrent ?? 0) / max <= 0.35;
                    }).length,
                    avgHpPercent: average(hpRatios),
                    avgPmPercent: average(pmRatios),
                    avgSanPercent: average(sanRatios),
                });
            } catch (error) {
                console.error("Party status poll failed", error);
            }
        };

        void pollPartyStatus();
        const interval = setInterval(() => {
            void pollPartyStatus();
        }, LIVE_PARTY_POLL_MS);

        return () => clearInterval(interval);
    }, [campaignId]);

    useEffect(() => {
        if (!context?.worldId) return;

        const loadCodexEntities = async () => {
            try {
                const res = await fetch(`/api/worlds/${context.worldId}/codex?limit=120`, { cache: "no-store" });
                const json = await res.json();
                setLiveCodexEntities((json.data?.entities as LiveCodexEntity[] | undefined) ?? []);
            } catch (error) {
                console.error("Live codex load failed", error);
            }
        };

        void loadCodexEntities();
    }, [context?.worldId]);

    useEffect(() => {
        if (!inspectId || !context?.worldId) {
            setInspectEntity(null);
            return;
        }

        const loadInspectEntity = async () => {
            setInspectLoading(true);
            try {
                const res = await fetch(`/api/worlds/${context.worldId}/entities/${inspectId}`, {
                    cache: "no-store",
                });
                const json = await res.json();
                setInspectEntity((json.data as LiveEntityDetail | undefined) ?? null);
            } catch (error) {
                console.error("Live inspect load failed", error);
                setInspectEntity(null);
            } finally {
                setInspectLoading(false);
            }
        };

        void loadInspectEntity();
    }, [context?.worldId, inspectId]);

    useEffect(() => {
        if (!spawnStatusMessage) return;
        const timer = setTimeout(() => setSpawnStatusMessage(null), LIVE_SPAWN_STATUS_MS);
        return () => clearTimeout(timer);
    }, [spawnStatusMessage]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const tagName = target?.tagName.toLowerCase();
            const isTypingTarget =
                tagName === "input" ||
                tagName === "textarea" ||
                target?.isContentEditable;
            if (isTypingTarget) return;

            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setSearchOpen(true);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);


    async function handleAction(type: string, payload: Record<string, unknown>) {
        if (!context) return;

        // Optimistic UI could go here

        await fetch('/api/play/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                worldId: context.worldId,
                campaignId,
                type,
                payload: {
                    ...payload,
                    actorId: 'player-1', // Mock
                }
            })
        });

        // We rely on polling to see the result, or we could manual fetch immediately
    }

    async function handleSummarize() {
        if (!context) return;
        await fetch('/api/play/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ worldId: context.worldId, campaignId })
        });
    }

    async function processVoiceCommand(text: string) {
        if (!context) return;
        try {
            await fetch('/api/ai/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    worldId: context.worldId,
                    campaignId
                })
            });
        } catch (e) { console.error(e); }
    }

    async function handleLiveReveal(revealId: string) {
        if (!prepPacket || !context?.campaign?.roomCode) return;
        const reveal = prepPacket.forge.reveals.find((item) => item.id === revealId);
        if (!reveal) return;

        setRevealingId(revealId);
        try {
            const response = await fetch('/api/reveal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomCode: context.campaign.roomCode,
                    type: reveal.imageUrl ? 'image' : 'note',
                    title: reveal.title || 'Revelacao sem titulo',
                    content: reveal.notes || undefined,
                    imageUrl: reveal.imageUrl || undefined,
                    visibility: 'players',
                    expiresAt: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error('Falha ao enviar reveal para a mesa');
            }

            setPrepPacket((current) => {
                if (!current) return current;
                return {
                    ...current,
                    forge: {
                        ...current.forge,
                        reveals: current.forge.reveals.map((item) =>
                            item.id === revealId ? { ...item, status: 'executed' } : item
                        ),
                    },
                };
            });
            setCurrentPublicAsset({
                title: reveal.title || "Reveal da sessao",
                detail: activeScene
                    ? `Reveal publico da cena ${activeScene.title || "em foco"}`
                    : "Reveal publico da sessao",
            });
        } catch (error) {
            console.error(error);
        } finally {
            setRevealingId(null);
        }
    }

    async function handlePresentSceneAsset(entityId: string, imageUrl: string, title: string) {
        if (!context?.campaign?.roomCode || !imageUrl) return;

        setRevealingId(`asset:${entityId}`);
        try {
            const response = await fetch('/api/reveal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomCode: context.campaign.roomCode,
                    type: 'image',
                    title,
                    imageUrl,
                    visibility: 'players',
                    expiresAt: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error('Falha ao enviar asset para a mesa');
            }

            setCurrentPublicAsset({
                title,
                detail: activeScene
                    ? `Asset publico da cena ${activeScene.title || "em foco"}`
                    : "Asset publico enviado para os jogadores",
            });
        } catch (error) {
            console.error(error);
        } finally {
            setRevealingId(null);
        }
    }

    async function refreshLiveCombatNow() {
        await loadLiveCombat();
    }

    function handleSaveSoundtrack(next: SessionSoundtrack) {
        setSoundtrack(next);
        if (!campaignId) return;
        try {
            window.localStorage.setItem(`t20.live.soundtrack.${campaignId}`, JSON.stringify(next));
        } catch (error) {
            console.error("Failed to persist soundtrack presets", error);
        }
    }

    function handleGmScratchpadChange(next: string) {
        setGmScratchpad(next);
        if (!campaignId) return;
        try {
            window.localStorage.setItem(`t20.live.gm-scratchpad.${campaignId}`, next);
        } catch (error) {
            console.error("Failed to persist GM scratchpad", error);
        }
    }

    function handleFlowChecklistToggle(
        key: keyof LiveFlowChecklistState,
        checked: boolean,
    ) {
        setFlowChecklist((current) => {
            const next = { ...current, [key]: checked };
            if (campaignId) {
                try {
                    window.localStorage.setItem(
                        `t20.live.flow-checklist.${campaignId}`,
                        JSON.stringify(next),
                    );
                } catch (error) {
                    console.error("Failed to persist flow checklist", error);
                }
            }
            return next;
        });
    }

    function handleFlowChecklistSetAll(checked: boolean) {
        const next: LiveFlowChecklistState = {
            cockpit: checked,
            combat: checked,
            consult: checked,
            visual: checked,
            notes: checked,
        };
        setFlowChecklist(next);
        if (campaignId) {
            try {
                window.localStorage.setItem(
                    `t20.live.flow-checklist.${campaignId}`,
                    JSON.stringify(next),
                );
            } catch (error) {
                console.error("Failed to persist flow checklist", error);
            }
        }
    }

    async function handleSpawnEncounterEnemy(enemy: SessionForgeEncounterEnemy, enemyIndex: number) {
        if (spawningEncounterEnemyId) return;
        if (!campaignId || !liveCombat?.isActive || !enemy.npcId) return;

        const spawnId = `${activeEncounter?.id ?? "encounter"}:${enemy.npcId}:${enemyIndex}`;
        setSpawningEncounterEnemyId(spawnId);
        setSpawnStatusMessage(null);

        try {
            const npcResponse = await fetch(getCampaignNpcsPath(campaignId), { cache: "no-store" });
            if (!npcResponse.ok) {
                throw new Error("Falha ao carregar NPCs da campanha.");
            }

            const npcJson = await npcResponse.json();
            const npcs = (npcJson.data as CampaignNpc[] | undefined) ?? [];
            const npc = npcs.find((entry) => entry.id === enemy.npcId);
            if (!npc) {
                throw new Error("NPC do encontro nao encontrado na campanha.");
            }

            const quantity = Math.max(1, enemy.quantity || 1);
            const baseName = enemy.label?.trim() || npc.name || "Ameaca";
            const hpMax = Math.max(1, npc.hpMax ?? 1);
            const kind = npc.type?.toLowerCase() === "monster" ? "MONSTER" : "NPC";
            const existingFromSameNpc =
                liveCombat?.combatants.filter((combatant) => combatant.refId === npc.id).length ?? 0;
            const remainingToSpawn = Math.max(0, quantity - existingFromSameNpc);
            if (remainingToSpawn === 0) {
                setSpawnStatusMessage({
                    kind: "info",
                    message: `${baseName} ja esta completo em campo (${existingFromSameNpc}/${quantity}).`,
                });
                return;
            }

            for (let idx = 0; idx < remainingToSpawn; idx += 1) {
                const sequence = existingFromSameNpc + idx + 1;
                const shouldSuffix = quantity > 1 || existingFromSameNpc > 0;
                const combatantName = shouldSuffix ? `${baseName} ${sequence}` : baseName;
                const spawnResponse = await fetch(getCampaignCombatantsPath(campaignId), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: combatantName,
                        refId: npc.id,
                        kind,
                        hpMax,
                        hpCurrent: hpMax,
                        defenseFinal: npc.defenseFinal ?? 10,
                        damageFormula: npc.damageFormula ?? "1d6",
                    }),
                });

                if (!spawnResponse.ok) {
                    const spawnJson = await spawnResponse.json().catch(() => null);
                    const message =
                        (spawnJson?.error as string | undefined) ??
                        "Falha ao convocar inimigo para o combate.";
                    throw new Error(message);
                }
            }

            await refreshLiveCombatNow();
            setSpawnStatusMessage({
                kind: "success",
                message:
                    remainingToSpawn > 1
                        ? `${remainingToSpawn} unidades de ${baseName} convocadas para o combate.`
                        : `${baseName} convocado para o combate.`,
            });
        } catch (error) {
            console.error("Encounter spawn failed", error);
            setSpawnStatusMessage({
                kind: "error",
                message:
                    error instanceof Error
                        ? error.message
                        : "Falha ao convocar inimigo para o combate.",
            });
        } finally {
            setSpawningEncounterEnemyId(null);
        }
    }

    async function handleCombatTurn(direction: "next" | "prev") {
        if (!liveCombat?.isActive) return;
        try {
            await fetch(getCampaignCombatTurnPath(campaignId), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ direction }),
            });
            await refreshLiveCombatNow();
        } catch (error) {
            console.error("Combat turn update failed", error);
        }
    }

    const sendChat = (e: FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        handleAction('CHAT', { text: chatInput, author: 'Player' }); // Mock author
        setChatInput("");
    }

    if (!context) return <div className="flex h-screen items-center justify-center">Carregando Jogo...</div>;

    const activeScene = prepPacket?.forge.scenes.find((scene) => scene.id === focusedSceneId)
        ?? prepPacket?.forge.scenes.find((scene) => scene.status !== "discarded")
        ?? null;
    const activeSubscene = activeScene?.subscenes.find((subscene) => subscene.status !== "discarded") ?? null;

    const activeSceneEntityIds = activeScene?.linkedEntityIds ?? prepPacket?.forge.linkedEntityIds ?? [];

    const focusedLiveEntities = liveCodexEntities.filter((entity) =>
        activeSceneEntityIds.includes(entity.id)
    );
    const sceneVisualEntities: {
        id: string;
        name: string;
        type: string;
        subtype?: string | null;
        imageUrl: string;
        role: "portrait" | "location";
    }[] = focusedLiveEntities
        .filter((entity) => entity.portraitImageUrl || entity.coverImageUrl)
        .map((entity) => ({
            id: entity.id,
            name: entity.name,
            type: entity.type,
            subtype: entity.subtype,
            imageUrl: entity.portraitImageUrl || entity.coverImageUrl || "",
            role: entity.type === "character" || entity.type === "npc" ? "portrait" : "location",
        }));

    const activeSceneReveals = activeScene
        ? prepPacket?.forge.reveals.filter((item) =>
            item.status !== "canceled" && activeScene.linkedRevealIds.includes(item.id)
        ) ?? []
        : prepPacket?.forge.reveals.filter((item) => item.status !== "canceled") ?? [];

    const activeEncounter = prepPacket?.forge.encounters.find((encounter) =>
        activeScene ? encounter.linkedSceneId === activeScene.id : true
    ) ?? prepPacket?.forge.encounters[0] ?? null;
    const narrativeContext = activeScene
        ? {
            sceneTitle: activeScene.title || "Cena sem titulo",
            subsceneTitle: activeSubscene?.title || undefined,
        }
        : null;
    const currentCombatant = liveCombat?.combatants.length
        ? liveCombat.combatants[liveCombat.turnIndex % liveCombat.combatants.length]
        : null;
    const combatTurn = liveCombat?.isActive && currentCombatant
        ? {
            round: liveCombat.round,
            currentName: currentCombatant.name,
            currentKind: currentCombatant.kind,
        }
        : null;
    const inspectCandidates = (inspectQuery.trim()
        ? liveCodexEntities.filter((entity) => {
            const term = inspectQuery.trim().toLowerCase();
            return (
                entity.name.toLowerCase().includes(term) ||
                entity.type.toLowerCase().includes(term) ||
                (entity.subtype || "").toLowerCase().includes(term)
            );
        })
        : focusedLiveEntities.length > 0
            ? focusedLiveEntities
            : liveCodexEntities
    ).slice(0, 10);

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden flex-row relative supports-[height:100dvh]:h-[100dvh]">
            {/* Jarvis visual layer */}
            <CortexOverlay events={events} />

            {/* Fullscreen Physics Layer (Z-50) */}
            <div className="absolute inset-0 z-50 pointer-events-none">
                <DiceCanvas ref={diceRef} onResult={(physicalTotal) => {
                    if (pendingRoll) {
                        // Combine Physics Result with Modifier
                        const finalResult = physicalTotal + pendingRoll.modifier;
                        // Construct message
                        // handleAction('ROLL_DICE', { expression: pendingRoll.expression, result: finalResult }); 
                        // Wait, ROLL_DICE usually takes "expression" and backend rolls.
                        // We need to override the backend roll or send a "MANUAL_RESULT" type?
                        // Or just send a chat message?
                        // Ideally, we send: { type: 'ROLL_RESULT', expression: pendingRoll.expression, total: finalResult, breakdown: `[${physicalTotal}] + ${pendingRoll.modifier}` }

                        // For MVP V2 compatibility with existing handleAction:
                        handleAction('CHAT', {
                            text: `Rolagem fisica: ${pendingRoll.expression} = **${finalResult}** (${physicalTotal} + ${pendingRoll.modifier})`,
                            author: 'Sistema'
                        });

                        setPendingRoll(null);
                    }
                }} />
            </div>

            {context?.campaign?.roomCode && <RevealOverlay roomCode={context.campaign.roomCode} />}



            {/* ARCHIVES: Omni Search */}
            <OmniSearch
                open={searchOpen}
                onOpenChange={setSearchOpen}
                onSelect={(item) => setViewingGrimoireItem(item)}
            />

            {/* ARCHIVES: Detail View */}
            <GrimoireDetailView
                item={viewingGrimoireItem}
                onClose={() => setViewingGrimoireItem(null)}
            />

            {/* LEFT: Quick Sheet Overlay */}
            <QuickSheet
                campaignId={campaignId}
                onAction={handleAction}
                collapsed={sheetCollapsed}
                onToggle={() => setSheetCollapsed(!sheetCollapsed)}
            />
            {/* Toggle Button for QuickSheet (Visible when collapsed) */}
            {sheetCollapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 z-[60]">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-24 w-6 bg-black/50 border-y border-r border-white/10 rounded-r-xl hover:bg-primary/20 hover:text-primary transition-all flex items-center justify-center"
                        onClick={() => setSheetCollapsed(false)}
                    >
                        <div className="rotate-90 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap">AGENTE</div>
                    </Button>
                </div>
            )}

            <LiveWarRoom
                campaignId={campaignId}
                campaignName={context?.campaign?.name}
                isCombatActive={liveCombat?.isActive ?? false}
                monitorMode={monitorMode}
                narrativeContext={narrativeContext}
                combatTurn={combatTurn}
                mapTokens={mapTokens}
                pins={pins}
                onTokenMove={handleTokenMove}
                onPinCreate={handlePinCreate}
                onTurnNext={() => void handleCombatTurn("next")}
                onTurnPrev={() => void handleCombatTurn("prev")}
                onRollDice={({ expression, modifier, count, diceArray }) => {
                    setPendingRoll({ expression, modifier, count });
                    diceRef.current?.roll(diceArray);
                }}
            />

            <LiveOperationsSidebar
                campaignId={campaignId}
                campaignName={context.campaign.name}
                roomCode={context.campaign.roomCode}
                worldId={context.worldId}
                prepPacket={prepPacket}
                activeScene={activeScene}
                activeEncounter={activeEncounter}
                activeSceneReveals={activeSceneReveals}
                currentPublicAsset={currentPublicAsset}
                sceneVisualEntities={sceneVisualEntities}
                liveCombat={liveCombat}
                monitorMode={monitorMode}
                tableFocusMode={tableFocusMode}
                panelVisibility={cockpitPanels}
                showHistoryChat={showHistoryChat}
                soundtrack={soundtrack}
                gmScratchpad={gmScratchpad}
                flowChecklist={flowChecklist}
                partyStatus={partyStatus}
                revealingId={revealingId}
                secondScreenReady={Boolean(context.campaign.roomCode)}
                activeInspectEntityId={inspectId}
                spawningEncounterEnemyId={spawningEncounterEnemyId}
                spawnStatusMessage={spawnStatusMessage}
                inspectQuery={inspectQuery}
                inspectCandidates={inspectCandidates}
                inspectId={inspectId}
                inspectEntity={inspectEntity}
                inspectLoading={inspectLoading}
                events={events}
                pinnedEventIds={pinnedEventIds}
                timelineFilter={timelineFilter}
                chatInput={chatInput}
                scrollRef={scrollRef}
                onOpenAtlas={() => {
                    window.open(`/app/worlds/${context.worldId}/map`, "_blank", "noopener,noreferrer");
                }}
                onOpenSecondScreen={() => {
                    if (!context.campaign.roomCode) return;
                    window.open(`/play/${context.campaign.roomCode}`, "_blank", "noopener,noreferrer");
                }}
                onSummarize={handleSummarize}
                onToggleMonitorMode={() => {
                    setMonitorMode((current) => {
                        const next = !current;
                        if (campaignId) {
                            try {
                                window.localStorage.setItem(`t20.live.monitor-mode.${campaignId}`, String(next));
                            } catch (error) {
                                console.error("Failed to persist monitor mode", error);
                            }
                        }
                        return next;
                    });
                }}
                onTableFocusModeChange={(next) => {
                    setTableFocusMode(next);
                    if (campaignId) {
                        try {
                            window.localStorage.setItem(`t20.live.table-focus.${campaignId}`, next);
                        } catch (error) {
                            console.error("Failed to persist table focus mode", error);
                        }
                    }
                }}
                onPanelVisibilityChange={(next) => {
                    setCockpitPanels(next);
                    if (campaignId) {
                        try {
                            window.localStorage.setItem(
                                `t20.live.cockpit-panels.${campaignId}`,
                                JSON.stringify(next),
                            );
                        } catch (error) {
                            console.error("Failed to persist cockpit panel visibility", error);
                        }
                    }
                }}
                onToggleHistoryChat={() => {
                    setShowHistoryChat((current) => {
                        const next = !current;
                        if (campaignId) {
                            try {
                                window.localStorage.setItem(`t20.live.history-chat.${campaignId}`, String(next));
                            } catch (error) {
                                console.error("Failed to persist history chat visibility", error);
                            }
                        }
                        return next;
                    });
                }}
                onApplyCockpitPreset={(preset) => {
                    const nextFocus = preset === "tactical" ? "tactical" : "narrative";
                    const nextPanels =
                        preset === "tactical"
                            ? { showSupport: true, showCodex: false }
                            : { showSupport: true, showCodex: true };
                    const nextHistory = preset !== "tactical";

                    setTableFocusMode(nextFocus);
                    setCockpitPanels(nextPanels);
                    setShowHistoryChat(nextHistory);

                    if (campaignId) {
                        try {
                            window.localStorage.setItem(`t20.live.table-focus.${campaignId}`, nextFocus);
                            window.localStorage.setItem(
                                `t20.live.cockpit-panels.${campaignId}`,
                                JSON.stringify(nextPanels),
                            );
                            window.localStorage.setItem(
                                `t20.live.history-chat.${campaignId}`,
                                String(nextHistory),
                            );
                        } catch (error) {
                            console.error("Failed to persist cockpit preset", error);
                        }
                    }
                }}
                onFocusScene={setFocusedSceneId}
                onInspectEntity={setInspectId}
                onReveal={(revealId) => void handleLiveReveal(revealId)}
                onPresentAsset={(entityId, imageUrl, title) =>
                    void handlePresentSceneAsset(entityId, imageUrl, title)
                }
                onSpawnEncounterEnemy={(enemy, enemyIndex) =>
                    void handleSpawnEncounterEnemy(enemy, enemyIndex)
                }
                onInspectQueryChange={setInspectQuery}
                onInspectIdChange={(value) => {
                    setInspectId(value);
                    if (value === null) {
                        setInspectEntity(null);
                    }
                }}
                onOpenSearch={() => setSearchOpen(true)}
                onTimelineFilterChange={setTimelineFilter}
                onPinToggle={(id) => {
                    setPinnedEventIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(id)) next.delete(id);
                        else next.add(id);
                        return next;
                    });
                }}
                onChatInputChange={setChatInput}
                onChatSubmit={sendChat}
                onVoiceTranscription={(text) => {
                    handleAction('CHAT', { text, author: 'Mestre (Voz)' });
                    processVoiceCommand(text);
                }}
                onCombatChange={() => void refreshLiveCombatNow()}
                onSaveSoundtrack={handleSaveSoundtrack}
                onGmScratchpadChange={handleGmScratchpadChange}
                onFlowChecklistToggle={handleFlowChecklistToggle}
                onFlowChecklistSetAll={handleFlowChecklistSetAll}
            />
        </div>
    );
}
