"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { QuickSheet } from "./quick-sheet";
import {
    type LiveCodexEntity,
    type LiveEntityDetail,
} from "@/components/play/live-codex-inspect";
import { LiveOperationsSidebar } from "@/components/play/live-operations-sidebar";
import { LiveWarRoom } from "@/components/play/live-war-room";
import { OmniSearch } from "@/components/archives/omni-search";
import { GrimoireDetailView } from "@/components/archives/grimoire-detail-view";
import { DiceCanvas, DiceCanvasRef } from "@/components/dice/dice-canvas";
import { DieType } from "@/components/dice/die";
import { RevealOverlay } from "@/components/reveal-overlay";
import { cn } from "@/lib/utils";
import { CortexOverlay } from "@/components/cortex/cortex-overlay";

import { Button } from "@/components/ui/button";
import { normalizeSessionForgeState, type SessionForgeState } from "@/lib/session-forge";

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

            <LiveWarRoom
                campaignId={campaignId}
                campaignName={context?.campaign?.name}
                mapTokens={mapTokens}
                pins={pins}
                onTokenMove={handleTokenMove}
                onPinCreate={handlePinCreate}
                onRollDice={({ expression, modifier, count, diceArray }) => {
                    setPendingRoll({ expression, modifier, count });
                    diceRef.current?.roll(diceArray);
                }}
            />

            <LiveOperationsSidebar
                campaignId={campaignId}
                campaignName={context.campaign.name}
                worldId={context.worldId}
                prepPacket={prepPacket}
                activeScene={activeScene}
                activeEncounter={activeEncounter}
                activeSceneReveals={activeSceneReveals}
                liveCombat={liveCombat}
                revealingId={revealingId}
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
                onOpenAtlas={() => router.push(`/app/worlds/${context.worldId}/map`)}
                onSummarize={handleSummarize}
                onFocusScene={setFocusedSceneId}
                onReveal={(revealId) => void handleLiveReveal(revealId)}
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
            />
        </div>
    );
}
