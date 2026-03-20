"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw, Send, Shield, Sparkles, BookOpen, Map as MapIcon, Clapperboard, Eye, Target, Users2, Search, ArrowRight } from "lucide-react";
import { QuickSheet } from "./quick-sheet";
import { CombatTracker } from "@/components/play/combat-tracker";
import { SquadMonitor } from "@/components/overseer/squad-monitor";
import { OmniSearch } from "@/components/archives/omni-search";
import { GrimoireDetailView } from "@/components/archives/grimoire-detail-view";
import { DiceCanvas, DiceCanvasRef } from "@/components/dice/dice-canvas";
import { DieType } from "@/components/dice/die";
import { RevealOverlay } from "@/components/reveal-overlay";
import { AudioRecorder } from "@/components/audio-recorder";
import { cn } from "@/lib/utils";
import { Timeline } from "@/components/timeline/timeline";
import { groupEvents } from "@/lib/timeline/grouper";
import { InteractiveMap } from "@/components/map/interactive-map";
import { CortexOverlay } from "@/components/cortex/cortex-overlay";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { normalizeSessionForgeState, type SessionForgeState } from "@/lib/session-forge";
import {
    analyzeLiveCombatPressure,
    formatBalanceConfidence,
    formatEncounterRating,
    formatLivePressureState,
    suggestLiveAdjustment,
} from "@/lib/t20-balance";
import { CockpitDetailSheet } from "@/components/cockpit/cockpit-detail-sheet";

// --- Types ---
type GameEvent = {
    id: string;
    type: string;
    scope: string;
    ts: string;
    payload: any;
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

type LiveCodexEntity = {
    id: string;
    name: string;
    type: string;
    subtype?: string | null;
    status?: string | null;
    summary?: string | null;
    portraitImageUrl?: string | null;
    coverImageUrl?: string | null;
};

type LiveEntityDetail = LiveCodexEntity & {
    description?: string | null;
    visibility?: string | null;
    tags?: string[];
    campaign?: { id: string; name: string } | null;
    outgoingRelations: { id: string; type: string; toEntity?: { id: string; name: string } | null }[];
    incomingRelations: { id: string; type: string; fromEntity?: { id: string; name: string } | null }[];
    recentEvents: { id: string; type: string; text?: string | null; ts: string; visibility?: string | null }[];
};

type LiveCombat = {
    id: string;
    isActive: boolean;
    round: number;
    turnIndex: number;
    combatants: {
        id: string;
        kind: string;
        name: string;
        hpCurrent: number;
        hpMax: number;
    }[];
};

// --- Components ---

function DiceTray({ onRoll }: { onRoll: (expression: string) => void }) {
    const dice = [
        { label: "d4", value: "1d4" },
        { label: "d6", value: "1d6" },
        { label: "d8", value: "1d8" },
        { label: "d10", value: "1d10" },
        { label: "d12", value: "1d12" },
        { label: "d20", value: "1d20" },
    ];

    return (
        <div className="flex gap-2 p-2 bg-white/5 rounded-lg border border-white/10 items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase mr-2">Dados</span>
            {dice.map((d) => (
                <Button
                    key={d.label}
                    size="sm"
                    variant="secondary"
                    className="h-8 min-w-[3rem] font-bold text-primary hover:bg-primary/20"
                    onClick={() => onRoll(d.value)}
                >
                    {d.label}
                </Button>
            ))}
            <div className="w-px h-6 bg-white/10 mx-2" />
            <Input
                placeholder="Ex: 2d8+4"
                className="h-8 w-24 text-xs font-mono bg-black/20 border-white/10"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        onRoll(e.currentTarget.value);
                        e.currentTarget.value = '';
                    }
                }}
            />
        </div>
    );
}

function EventBubble({ event }: { event: GameEvent }) {
    const isRoll = event.type === 'ROLL';
    const isAttack = event.type === 'ATTACK';
    const isNote = event.type === 'NOTE';
    const isScribe = event.payload?.isSummary;

    if (isScribe) {
        return (
            <div className="flex flex-col gap-2 p-4 rounded-lg bg-amber-900/20 border border-amber-500/30 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-amber-500 mb-1">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-bold text-sm uppercase tracking-wider">O Escriba</span>
                    <span className="ml-auto text-[10px] opacity-70">{new Date(event.ts).toLocaleTimeString()}</span>
                </div>
                <div className="text-sm text-foreground/90 whitespace-pre-wrap font-serif leading-relaxed">
                    {event.payload.text}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-1 p-3 rounded-lg bg-black/20 border border-white/5 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span className="font-bold text-primary/80">{event.actorName || event.payload?.author || "Sistema"}</span>
                <span>{new Date(event.ts).toLocaleTimeString()}</span>
            </div>

            {(isRoll || isAttack) && (
                <div className="flex flex-col gap-2 mt-1">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex flex-col items-center justify-center w-10 h-10 rounded text-primary font-bold text-lg border",
                            event.payload.isHit !== undefined
                                ? (event.payload.isHit ? "bg-green-500/20 border-green-500/50 text-green-400" : "bg-red-500/20 border-red-500/50 text-red-400")
                                : "bg-primary/20 border-primary/30"
                        )}>
                            {event.payload.roll?.result ?? event.payload.result}
                        </div>
                        <div>
                            <div className="text-xs font-mono text-muted-foreground">{event.payload.roll?.expression ?? event.payload.expression}</div>
                            <div className="text-sm font-medium">{event.payload.weaponName ?? event.payload.label}</div>
                        </div>
                    </div>
                    {event.payload.message && (
                        <div className="text-xs font-bold text-center bg-black/40 py-1 rounded text-foreground/80">
                            {event.payload.message}
                        </div>
                    )}
                </div>
            )}

            {isNote && (
                <p className="text-sm text-foreground/90">{event.payload.text || "..."}</p>
            )}

            {!isRoll && !isNote && !isAttack && (
                <div className="text-xs font-mono text-muted-foreground">
                    [{event.type}] {JSON.stringify(event.payload)}
                </div>
            )}
        </div>
    )
}


export default function PlayPage() {
    const params = useParams();
    const router = useRouter();
    const campaignId = params?.campaignId as string;
    const [events, setEvents] = useState<GameEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [sheetCollapsed, setSheetCollapsed] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const diceRef = useRef<DiceCanvasRef>(null);
    // Physics State Sync
    const [pendingRoll, setPendingRoll] = useState<{ expression: string, modifier: number, count: number } | null>(null);
    const processedEventsRef = useRef<Set<string>>(new Set());
    const [searchOpen, setSearchOpen] = useState(false);
    const [viewingGrimoireItem, setViewingGrimoireItem] = useState<any>(null);
    const [characters, setCharacters] = useState<any[]>([]);
    const [pins, setPins] = useState<any[]>([]);
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

    // Auto-remove Pings after 3s
    useEffect(() => {
        const interval = setInterval(() => {
            setPins(current => {
                const now = Date.now();
                // Filter out PINGS older than 3s? 
                // Since I didn't store timestamp, I'll just filter out PINGS if I assume they are added recently?
                // Better: When adding ping, set a timeout to remove it.
                return current;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);



    const [mapTokens, setMapTokens] = useState<any[]>([]);

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
    const handlePinCreate = async (pin: any) => {
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

    // Fetch Characters (and auto-create MapTokens if missing)
    useEffect(() => {
        if (campaignId) {
            fetch(`/api/characters?campaignId=${campaignId}&withSheet=true`)
                .then(res => res.json())
                .then(json => {
                    if (json.data) {
                        setCharacters(json.data);
                        // Optional: Check if we need to sync characters to map tokens
                        // For now, we assume tokens are independent or created explicitly. 
                        // But for "Living World", dragging a character to map should create token.
                        // We'll leave that for a "Roster" drag-drop later.
                        // Current logic: If mapTokens is empty, maybe auto-populate? 
                        // Let's keep it clean for now.
                    }
                });
        }
    }, [campaignId]);

    // Polling Effect for Events
    useEffect(() => {
        fetchEvents();
        const interval = setInterval(fetchEvents, 2000);
        return () => clearInterval(interval);
    }, [campaignId]);

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

            console.log("Auto-Rolling for Initiative:", limitedDice.length);
            diceRef.current?.roll(limitedDice);

            // Mark as processed
            newInitiatives.forEach(e => processedEventsRef.current.add(e.id));
        }

        // Mark all current events as processed to avoid re-rolling on refresh
        // (Actually, we only want to mark the ones we ACTED on, or all? 
        // If we refresh, we don't want to re-roll old initiatives.
        // So on initial load, we might want to mark ALL as processed without rolling.
        // But how to distinguish initial load vs new poll?
        // We can just add all IDs to processedRef on first mount?
        // For MVP, just adding the ones we check effectively handles "New" since setEvents overwrites or appends.
        // But if I refresh page, `processedEventsRef` resets, and I fetch 50 events.
        // I will see 5 initiatives and roll them.
        // That is acceptable for "Replay" effect, but slight annoying.
        // I will allow it for now. The user likes "Physics".
    }, [events]);

    async function fetchEvents() {
        // In a real implementation we would use 'after=ts' to get delta
        // For MVP we just fetch recent 50
        try {
            // Need to find worldId from campaignId... 
            // Hack: The API route /api/campaigns/[id] should return worldId.
            // For polling efficiently, we might need a direct route /api/play/[campaignId]/events

            // Simulating polling by fetching from the campaign events endpoint (we need to create or use existing)
            // Since we don't have a direct "get events by campaign" easily exposed without auth, 
            // let's assume we use the world events filtered by campaignId if possible, 
            // OR we just use the universal action dispatcher response for local echo + polling later.

            // Actually, we need to know the WorldID to fetch events.
            // Let's rely on the user passing context or fetching campaign first.
            // SKIPPING polling implementation detail for this exact file save, will address in `loadContext`.
        } catch (e) {
            console.error(e);
        }
    }

    // NOTE: We need to fetch the Campaign first to get the WorldID.
    const [context, setContext] = useState<{ worldId: string, campaign: any } | null>(null);

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
                    const campaignEvents = json.data.filter((e: any) => e.campaignId === campaignId || e.scope === 'MACRO');
                    // Simple dedup needed? React state set handles replace.
                    setEvents(prev => {
                        // Only update if length changed to avoid jitter, or deep compare
                        if (prev.length !== campaignEvents.length) return campaignEvents;
                        return prev;
                    });
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

        let cancelled = false;

        const loadLiveCombat = async () => {
            try {
                const res = await fetch(`/api/campaigns/${campaignId}/combat`, { cache: "no-store" });
                const json = await res.json();
                if (!cancelled) {
                    setLiveCombat((json.data as LiveCombat | null | undefined) ?? null);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Live combat load failed", error);
                    setLiveCombat(null);
                }
            }
        };

        void loadLiveCombat();
        const interval = setInterval(() => {
            void loadLiveCombat();
        }, 4000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
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


    async function handleAction(type: string, payload: any) {
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
        } catch (error) {
            console.error(error);
        } finally {
            setRevealingId(null);
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

    const activeSceneEntityIds = activeScene?.linkedEntityIds ?? prepPacket?.forge.linkedEntityIds ?? [];

    const focusedLiveEntities = liveCodexEntities.filter((entity) =>
        activeSceneEntityIds.includes(entity.id)
    );

    const activeSceneReveals = activeScene
        ? prepPacket?.forge.reveals.filter((item) =>
            item.status !== "canceled" && activeScene.linkedRevealIds.includes(item.id)
        ) ?? []
        : prepPacket?.forge.reveals.filter((item) => item.status !== "canceled") ?? [];

    const activeEncounter = prepPacket?.forge.encounters.find((encounter) =>
        activeScene ? encounter.linkedSceneId === activeScene.id : true
    ) ?? prepPacket?.forge.encounters[0] ?? null;
    const livePressure = liveCombat?.isActive && liveCombat.combatants.length > 0
        ? analyzeLiveCombatPressure(liveCombat.combatants)
        : null;
    const liveAdjustment = livePressure
        ? suggestLiveAdjustment(livePressure, activeEncounter?.rating ?? null)
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
                            text: `🎲 Rolagem Física: ${pendingRoll.expression} = **${finalResult}** (${physicalTotal} + ${pendingRoll.modifier})`,
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

            {/* CENTER: Game Board */}
            {/* CENTER: Game Board (War Room) */}
            <div className="flex-1 bg-neutral-900 relative flex flex-col justify-center items-center text-muted-foreground overflow-hidden">
                {/* Squad Monitor (Overseer) - Centered in Game Board */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl pt-2 pointer-events-none px-4">
                    <SquadMonitor campaignId={campaignId} />
                </div>

                <InteractiveMap
                    className="absolute inset-0 z-0"
                    tokens={mapTokens}
                    pins={pins}
                    onTokenMove={handleTokenMove}
                    onPinCreate={handlePinCreate}
                />

                <div className="z-10 text-center pointer-events-none mb-20 opacity-30 select-none">
                    <p className="text-[10px] tracking-[0.2em] font-light uppercase shadow-black drop-shadow-md">Simulação Tática: {context?.campaign?.name}</p>
                </div>

                {/* Absolute Bottom Dice Tray */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 shadow-2xl z-20">
                    <DiceTray onRoll={(expr) => {
                        // Parse: "2d20+5"
                        const parts = expr.split('+');
                        const dicePart = parts[0]; // "2d20"
                        const modifier = parseInt(parts[1]) || 0;

                        const count = parseInt(dicePart.split('d')[0]) || 1;
                        const typePart = dicePart.split('d')[1] || '20';
                        const type = `d${typePart}` as DieType;

                        const diceArray = Array(Math.min(count, 10)).fill(type); // Limit 10

                        // 1. Storage Context
                        setPendingRoll({ expression: expr, modifier, count });

                        // 2. Trigger Physics
                        diceRef.current?.roll(diceArray);

                        // 3. DO NOT trigger handleAction('ROLL_DICE') immediately.
                        // We wait for onResult.
                    }} />
                </div>
            </div>

            {/* RIGHT: Sidebar (Chat & Logs) */}
            <div className="w-full md:w-[350px] border-l border-white/10 bg-sidebar flex flex-col z-[60]">
                <div className="p-3 border-b border-white/10 flex justify-between items-center bg-black/20">
                    <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-wider uppercase text-primary/80 truncate max-w-[150px]">{context.campaign.name}</span>
                        <Badge variant="outline" className="text-[10px] h-4 w-fit border-green-500/30 text-green-500">Online</Badge>
                    </div>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" title="Abrir Atlas" onClick={() => router.push(`/app/worlds/${context.worldId}/map`)}>
                            <MapIcon className="h-4 w-4 text-blue-400" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Invocar O Escriba" onClick={handleSummarize}>
                            <BookOpen className="h-4 w-4 text-amber-500" />
                        </Button>
                    </div>
                </div>

                {/* Combat Tracker */}
                <div className="px-3 pt-3">
                    <CombatTracker campaignId={campaignId} />
                </div>

                <div className="px-3 pt-3">
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
                                        <span className="inline-flex items-center gap-2"><Clapperboard className="h-3 w-3" /> Cenas prontas</span>
                                        <span className="font-semibold text-foreground">{prepPacket.forge.scenes.filter((scene) => scene.status !== "discarded").length}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-3 py-2">
                                        <span className="inline-flex items-center gap-2"><Eye className="h-3 w-3" /> Reveals ativos</span>
                                        <span className="font-semibold text-foreground">{prepPacket.forge.reveals.filter((item) => item.status !== "canceled").length}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-3 py-2">
                                        <span className="inline-flex items-center gap-2"><Users2 className="h-3 w-3" /> Entidades em foco</span>
                                        <span className="font-semibold text-foreground">{prepPacket.forge.linkedEntityIds.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-3 py-2">
                                        <span className="inline-flex items-center gap-2"><Shield className="h-3 w-3" /> Encontros prontos</span>
                                        <span className="font-semibold text-foreground">{prepPacket.forge.encounters.length}</span>
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
                                                    onClick={() => setFocusedSceneId(scene.id)}
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
                                        <p className="mt-3 text-sm text-muted-foreground">
                                            {activeEncounter.recommendation}
                                        </p>
                                    </div>
                                ) : null}

                                {livePressure ? (
                                    <div className="rounded-xl border border-white/8 bg-white/5 p-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge className={`${
                                                livePressure.state === "critical"
                                                    ? "border-red-500/30 bg-red-500/15 text-red-300"
                                                    : livePressure.state === "rising"
                                                        ? "border-amber-500/30 bg-amber-500/15 text-amber-300"
                                                        : "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                                            }`}>
                                                {formatLivePressureState(livePressure.state)}
                                            </Badge>
                                            <Badge variant="outline" className="border-white/10 text-white/70">
                                                Round {liveCombat?.round ?? 1}
                                            </Badge>
                                        </div>
                                        <p className="mt-3 text-sm font-semibold text-foreground">
                                            Sinais ao vivo
                                        </p>
                                        <p className="mt-2 text-sm text-foreground/90">
                                            {livePressure.summary}
                                        </p>
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
                                                <span className="font-semibold text-foreground">
                                                    {livePressure.downedPlayers}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-sm text-muted-foreground">
                                            {livePressure.recommendation}
                                        </p>
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
                                            <Badge className={`${
                                                liveAdjustment.posture === "ease"
                                                    ? "border-red-500/30 bg-red-500/15 text-red-300"
                                                    : liveAdjustment.posture === "escalate"
                                                        ? "border-sky-500/30 bg-sky-500/15 text-sky-300"
                                                        : "border-amber-500/30 bg-amber-500/15 text-amber-300"
                                            }`}>
                                                Ajuste rapido
                                            </Badge>
                                        </div>
                                        <p className="mt-3 text-sm font-semibold text-foreground">
                                            {liveAdjustment.title}
                                        </p>
                                        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                                            {liveAdjustment.actions.map((action) => (
                                                <p key={action}>{action}</p>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}

                                {activeSceneReveals.length > 0 ? (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            {activeScene ? "Reveals da cena" : "Reveals prontos"}
                                        </p>
                                        {activeSceneReveals
                                            .slice(0, 3)
                                            .map((item) => (
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
                                                            onClick={() => void handleLiveReveal(item.id)}
                                                            disabled={revealingId === item.id}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            {revealingId === item.id ? "Enviando..." : "Revelar"}
                                                        </Button>
                                                        {item.imageUrl ? (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-white/10 bg-white/5"
                                                                onClick={() => window.open(item.imageUrl, "_blank", "noopener,noreferrer")}
                                                            >
                                                                Ver asset
                                                            </Button>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <p className="mt-3 text-sm text-muted-foreground">
                                Crie uma sessao na campanha e use a Forja de Sessao para trazer briefing, cenas e reveals para a mesa.
                            </p>
                        )}
                    </div>
                </div>

                <div className="px-3 pt-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Quick inspect
                                </p>
                                <p className="mt-1 text-sm font-semibold text-foreground">
                                    Consulta world-scoped
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-primary"
                                onClick={() => setSearchOpen(true)}
                                title="Abrir busca completa"
                            >
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="mt-4 space-y-3">
                            <Input
                                value={inspectQuery}
                                onChange={(event) => setInspectQuery(event.target.value)}
                                placeholder="Buscar entidade, casa, faccao, lugar..."
                                className="bg-white/5 border-white/10"
                            />
                            <div className="flex flex-wrap gap-2">
                                {inspectCandidates.length > 0 ? (
                                    inspectCandidates.map((entity) => (
                                        <Button
                                            key={entity.id}
                                            type="button"
                                            variant="outline"
                                            className="border-white/10 bg-white/5"
                                            onClick={() => setInspectId(entity.id)}
                                        >
                                            {entity.name}
                                        </Button>
                                    ))
                                ) : (
                                    <div className="rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-sm text-muted-foreground">
                                        Nenhuma entidade encontrada para este filtro.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-b border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Histórico</span>
                    <div className="flex gap-1">
                        {['ALL', 'COMBAT', 'CHAT', 'CASE'].map(f => (
                            <button
                                key={f}
                                onClick={() => setTimelineFilter(f as any)}
                                className={cn(
                                    "text-[10px] px-2 py-1 rounded transition-colors",
                                    timelineFilter === f
                                        ? (f === 'CASE' ? "bg-amber-500/20 text-amber-500 border border-amber-500/50" : "bg-white/10 text-primary")
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {f === 'ALL' ? 'Tudo' : f === 'COMBAT' ? 'Combate' : f === 'CHAT' ? 'Chat' : 'Evidências'}
                            </button>
                        ))}
                    </div>
                </div>

                <ScrollArea ref={scrollRef} className="flex-1 bg-black/40 backdrop-blur-sm">
                    <div className="min-h-full">
                        <Timeline
                            groups={[...groupEvents(events.filter(e => {
                                if (timelineFilter === 'ALL') return true;
                                if (timelineFilter === 'COMBAT') return e.type.includes('COMBAT') || e.type.includes('ATTACK') || e.type.includes('INITIATIVE') || e.type.includes('TURN');
                                if (timelineFilter === 'CHAT') return e.type === 'CHAT' || e.type === 'NOTE' || e.type === 'ROLL';
                                if (timelineFilter === 'CASE') return pinnedEventIds.has(e.id);
                                return true;
                            }).map(e => ({
                                ...e,
                                ts: new Date(e.ts),
                                type: e.type as string
                            })))].reverse()}
                            pinnedIds={pinnedEventIds}
                            onPin={(id) => {
                                setPinnedEventIds(prev => {
                                    const next = new Set(prev);
                                    if (next.has(id)) next.delete(id);
                                    else next.add(id);
                                    return next;
                                });
                            }}
                        />
                    </div>
                </ScrollArea>

                <div className="p-3 border-t border-white/10 bg-black/20">
                    <form onSubmit={sendChat} className="flex gap-2">
                        <Input
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            placeholder="Diga algo..."
                            className="bg-white/5 border-white/10 focus-visible:ring-primary/50"
                        />
                        <Button size="icon" type="submit" variant="default">
                            <Send className="w-4 h-4" />
                        </Button>
                        <AudioRecorder
                            onTranscriptionComplete={(text) => {
                                handleAction('CHAT', { text, author: 'Mestre (Voz)' });
                                processVoiceCommand(text);
                            }}
                        />
                    </form>
                </div>
            </div>

            <CockpitDetailSheet
                open={inspectId !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setInspectId(null);
                        setInspectEntity(null);
                    }
                }}
                badge="Quick inspect"
                title={inspectEntity?.name || "Carregando entidade"}
                description={
                    inspectEntity
                        ? `${inspectEntity.type}${inspectEntity.subtype ? ` • ${inspectEntity.subtype}` : ""} • ${inspectEntity.status || "sem status"}`
                        : "Lendo detalhes do mundo"
                }
                footer={
                    inspectEntity ? (
                        <Button variant="outline" className="w-full justify-between border-white/10 bg-white/5" asChild>
                            <Link href={`/app/worlds/${context.worldId}/codex/${inspectEntity.id}`}>
                                Abrir no Codex
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    ) : undefined
                }
            >
                {inspectLoading || !inspectEntity ? (
                    <div className="space-y-3">
                        <div className="h-24 animate-pulse rounded-[24px] border border-white/8 bg-white/4" />
                        <div className="h-24 animate-pulse rounded-[24px] border border-white/8 bg-white/4" />
                        <div className="h-24 animate-pulse rounded-[24px] border border-white/8 bg-white/4" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {inspectEntity.portraitImageUrl || inspectEntity.coverImageUrl ? (
                            <div
                                className="min-h-[180px] rounded-[24px] border border-white/8 bg-cover bg-center"
                                style={{
                                    backgroundImage: `linear-gradient(180deg, rgba(8,8,13,0.16), rgba(8,8,13,0.82)), url(${inspectEntity.portraitImageUrl || inspectEntity.coverImageUrl})`,
                                }}
                            />
                        ) : null}

                        <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Resumo</p>
                            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                                {inspectEntity.summary || inspectEntity.description || "Sem resumo registrado."}
                            </p>
                        </div>

                        {Array.isArray(inspectEntity.tags) && inspectEntity.tags.length ? (
                            <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tags</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {inspectEntity.tags.map((tag) => (
                                        <Badge key={tag} className="border-white/10 bg-black/24 text-foreground">{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Relacoes</p>
                            <div className="mt-3 space-y-2">
                                {inspectEntity.outgoingRelations.slice(0, 4).map((relation) => (
                                    <div key={relation.id} className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-foreground">
                                        {relation.type} → {relation.toEntity?.name || "Destino"}
                                    </div>
                                ))}
                                {inspectEntity.incomingRelations.slice(0, 4).map((relation) => (
                                    <div key={relation.id} className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-foreground">
                                        {relation.fromEntity?.name || "Origem"} → {relation.type}
                                    </div>
                                ))}
                                {!inspectEntity.outgoingRelations.length && !inspectEntity.incomingRelations.length ? (
                                    <p className="text-sm text-muted-foreground">Nenhuma relacao registrada ainda.</p>
                                ) : null}
                            </div>
                        </div>

                        <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Memoria recente</p>
                            <div className="mt-3 space-y-2">
                                {inspectEntity.recentEvents.length ? (
                                    inspectEntity.recentEvents.map((event) => (
                                        <div key={event.id} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                                            <p className="text-sm font-semibold text-foreground">{event.text || event.type}</p>
                                            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                                {new Date(event.ts).toLocaleDateString("pt-BR")} • {event.visibility || "MASTER"}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">Nenhum evento recente ligado a esta entidade.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CockpitDetailSheet>
        </div>
    );
}
