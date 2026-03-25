"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Skull } from "lucide-react";
import { getCampaignCombatPath, SQUAD_MONITOR_POLL_MS } from "@/lib/live-combat";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SquadMonitorProps {
    campaignId: string;
    onSelect?: (charId: string) => void;
}

type CharacterStatus = {
    id: string;
    name: string;
    avatarUrl?: string;
    hp: { current: number; max: number };
    pm: { current: number; max: number };
    san: { current: number; max: number };
    def: number;
    conditions: string[];
};

type FetchedCharacter = {
    id: string;
    name: string;
    avatarUrl?: string;
    sheet?: {
        pvCurrent?: number;
        pvMax?: number;
        pmCurrent?: number;
        pmMax?: number;
        sanCurrent?: number;
        sanMax?: number;
        defenseFinal?: number;
    };
};

type LiveCombatSnapshot = {
    isActive: boolean;
    conditions?: {
        target?: { refId?: string };
        condition?: { name?: string; key?: string };
    }[];
};

type PendingSheetOverride = {
    hp?: number;
    pm?: number;
    san?: number;
};

export function SquadMonitor({ campaignId, onSelect }: SquadMonitorProps) {
    const [agents, setAgents] = useState<CharacterStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const pendingSheetOverridesRef = useRef<Record<string, PendingSheetOverride>>({});

    // Poll for status updates
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const [characterRes, combatRes] = await Promise.all([
                    fetch(`/api/characters?campaignId=${campaignId}&withSheet=true`),
                    fetch(getCampaignCombatPath(campaignId), { cache: "no-store" }).catch(() => null),
                ]);

                const characterJson = await characterRes.json();
                const characters = (characterJson.data as FetchedCharacter[] | undefined) ?? [];

                const conditionByRefId = new Map<string, string[]>();
                if (combatRes?.ok) {
                    const combatJson = await combatRes.json();
                    const combat = (combatJson.data as LiveCombatSnapshot | null | undefined) ?? null;
                    if (combat?.isActive && Array.isArray(combat.conditions)) {
                        for (const applied of combat.conditions) {
                            const refId = applied.target?.refId;
                            if (!refId) continue;
                            const label = applied.condition?.name || applied.condition?.key || "Condicao";
                            const existing = conditionByRefId.get(refId) ?? [];
                            conditionByRefId.set(refId, [...existing, label]);
                        }
                    }
                }

                const statusData = characters.map((character) => ({
                    id: character.id,
                    name: character.name,
                    avatarUrl: character.avatarUrl,
                    hp: { current: character.sheet?.pvCurrent || 0, max: character.sheet?.pvMax || 1 },
                    pm: { current: character.sheet?.pmCurrent || 0, max: character.sheet?.pmMax || 1 },
                    san: { current: character.sheet?.sanCurrent || 0, max: character.sheet?.sanMax || 1 },
                    def: character.sheet?.defenseFinal || 10,
                    conditions: conditionByRefId.get(character.id) ?? [],
                }));
                const pendingSheetOverrides = pendingSheetOverridesRef.current;
                const mergedStatusData = statusData.map((agent) => {
                    const pending = pendingSheetOverrides[agent.id];
                    if (!pending) return agent;
                    return {
                        ...agent,
                        hp: {
                            ...agent.hp,
                            current: typeof pending.hp === "number" ? pending.hp : agent.hp.current,
                        },
                        pm: {
                            ...agent.pm,
                            current: typeof pending.pm === "number" ? pending.pm : agent.pm.current,
                        },
                        san: {
                            ...agent.san,
                            current: typeof pending.san === "number" ? pending.san : agent.san.current,
                        },
                    };
                });

                const nextPendingSheetOverrides: Record<string, PendingSheetOverride> = {};
                for (const [agentId, pending] of Object.entries(pendingSheetOverrides)) {
                    const serverAgent = statusData.find((entry) => entry.id === agentId);
                    if (!serverAgent) continue;
                    const remaining: PendingSheetOverride = {};
                    if (typeof pending.hp === "number" && serverAgent.hp.current !== pending.hp) {
                        remaining.hp = pending.hp;
                    }
                    if (typeof pending.pm === "number" && serverAgent.pm.current !== pending.pm) {
                        remaining.pm = pending.pm;
                    }
                    if (typeof pending.san === "number" && serverAgent.san.current !== pending.san) {
                        remaining.san = pending.san;
                    }
                    if (
                        typeof remaining.hp === "number" ||
                        typeof remaining.pm === "number" ||
                        typeof remaining.san === "number"
                    ) {
                        nextPendingSheetOverrides[agentId] = remaining;
                    }
                }
                pendingSheetOverridesRef.current = nextPendingSheetOverrides;

                setAgents(mergedStatusData);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, SQUAD_MONITOR_POLL_MS);
        return () => clearInterval(interval);
    }, [campaignId]);

    if (loading && agents.length === 0) {
        return (
            <div className="flex gap-2 p-2 justify-center w-full">
                {[1, 2, 3].map(i => <Skeleton key={i} className="w-32 h-14 bg-black/40 rounded" />)}
            </div>
        );
    }

    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

    const removePendingOverride = (id: string, type: "hp" | "pm" | "san") => {
        const current = pendingSheetOverridesRef.current[id];
        if (!current) return;

        const next: PendingSheetOverride = { ...current };
        delete next[type];

        if (
            typeof next.hp !== "number" &&
            typeof next.pm !== "number" &&
            typeof next.san !== "number"
        ) {
            const cloned = { ...pendingSheetOverridesRef.current };
            delete cloned[id];
            pendingSheetOverridesRef.current = cloned;
            return;
        }

        pendingSheetOverridesRef.current = {
            ...pendingSheetOverridesRef.current,
            [id]: next,
        };
    };

    const handleGrant = async (id: string, type: "hp" | "pm" | "san", amount: number) => {
        const target = agents.find((agent) => agent.id === id);
        if (!target) return;

        const current =
            type === "hp"
                ? target.hp.current
                : type === "pm"
                    ? target.pm.current
                    : target.san.current;
        const max =
            type === "hp"
                ? target.hp.max
                : type === "pm"
                    ? target.pm.max
                    : target.san.max;
        const previousValue = current;
        const nextValue = clamp(current + amount, 0, max);

        setAgents((prev) =>
            prev.map((agent) => {
                if (agent.id !== id) return agent;
                if (type === "hp") {
                    return { ...agent, hp: { ...agent.hp, current: nextValue } };
                }
                if (type === "pm") {
                    return { ...agent, pm: { ...agent.pm, current: nextValue } };
                }
                return { ...agent, san: { ...agent.san, current: nextValue } };
            }),
        );
        const currentPending = pendingSheetOverridesRef.current[id] ?? {};
        pendingSheetOverridesRef.current = {
            ...pendingSheetOverridesRef.current,
            [id]: {
                ...currentPending,
                [type]: nextValue,
            },
        };

        try {
            const response = await fetch(`/api/characters/${id}/sheet`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    type === "hp"
                        ? { pvCurrent: nextValue }
                        : type === "pm"
                            ? { pmCurrent: nextValue }
                            : { sanCurrent: nextValue },
                ),
            });
            if (!response.ok) {
                const payload = await response.json().catch(() => null);
                const message = (payload?.error as string | undefined) ?? "Failed to update character sheet";
                throw new Error(message);
            }
        } catch (error) {
            setAgents((prev) =>
                prev.map((agent) => {
                    if (agent.id !== id) return agent;
                    if (type === "hp") {
                        return { ...agent, hp: { ...agent.hp, current: previousValue } };
                    }
                    if (type === "pm") {
                        return { ...agent, pm: { ...agent.pm, current: previousValue } };
                    }
                    return { ...agent, san: { ...agent.san, current: previousValue } };
                }),
            );
            removePendingOverride(id, type);
            console.error("Failed to update character sheet", error);
        }
    };

    return (
        <div className="flex items-start justify-center gap-2 p-2 w-full overflow-x-auto pointer-events-none">
            {agents.map(agent => {
                const hpPct = (agent.hp.current / agent.hp.max) * 100;
                const pmPct = (agent.pm.current / agent.pm.max) * 100;
                const sanPct = (agent.san.current / agent.san.max) * 100;

                const isDying = agent.hp.current <= 0;

                return (
                    <div
                        key={agent.id}
                        className={cn(
                            "pointer-events-auto group relative w-48 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden transition-all hover:scale-105 hover:border-primary/50 hover:bg-zinc-900 shadow-lg",
                            isDying && "border-red-500/50 animate-pulse bg-red-950/20"
                        )}
                        onClick={() => onSelect?.(agent.id)}
                    >
                        {/* Compact Layout */}
                        <div className="p-2 flex gap-3 items-center">
                            {/* Avatar */}
                            <div className={cn(
                                "relative w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0",
                                isDying && "border-red-500"
                            )}>
                                {agent.avatarUrl ? (
                                    <Image
                                        src={agent.avatarUrl}
                                        alt={agent.name}
                                        fill
                                        sizes="40px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <span className="font-bold text-xs">{agent.name.charAt(0)}</span>
                                )}
                            </div>

                            {/* Vitals */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex justify-between items-center h-4">
                                    <span className="text-xs font-bold truncate text-white/90">{agent.name}</span>
                                    {isDying && <Skull className="w-3 h-3 text-red-500" />}
                                </div>

                                {/* Bars Container */}
                                <div className="space-y-1 relative">
                                    {/* HP Bar */}
                                    <div className="group/bar relative h-2 w-full bg-black/50 rounded-full overflow-hidden">
                                        <div className={cn("h-full transition-all", isDying ? "bg-red-600" : "bg-green-500")} style={{ width: `${hpPct}%` }} />
                                        {/* Hover Controls */}
                                        <div className="absolute inset-0 flex opacity-0 group-hover/bar:opacity-100 bg-black/60 items-center justify-center gap-4 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); handleGrant(agent.id, 'hp', -5) }} className="text-red-500 font-bold text-[10px] hover:scale-125">-</button>
                                            <button onClick={(e) => { e.stopPropagation(); handleGrant(agent.id, 'hp', 5) }} className="text-green-500 font-bold text-[10px] hover:scale-125">+</button>
                                        </div>
                                    </div>

                                    {/* PM Bar */}
                                    <div className="group/bar relative h-2 w-full bg-black/50 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 transition-all" style={{ width: `${pmPct}%` }} />
                                        <div className="absolute inset-0 flex opacity-0 group-hover/bar:opacity-100 bg-black/60 items-center justify-center gap-4 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); handleGrant(agent.id, 'pm', -2) }} className="text-red-500 font-bold text-[10px] hover:scale-125">-</button>
                                            <button onClick={(e) => { e.stopPropagation(); handleGrant(agent.id, 'pm', 2) }} className="text-blue-500 font-bold text-[10px] hover:scale-125">+</button>
                                        </div>
                                    </div>

                                    {/* SAN Bar */}
                                    <div className="group/bar relative h-1.5 w-full bg-black/50 rounded-full overflow-hidden mt-1">
                                        <div className="h-full bg-purple-500 transition-all" style={{ width: `${sanPct}%` }} />
                                        <div className="absolute inset-0 flex opacity-0 group-hover/bar:opacity-100 bg-black/60 items-center justify-center gap-4 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); handleGrant(agent.id, 'san', -2) }} className="text-red-500 font-bold text-[10px] hover:scale-125">-</button>
                                            <button onClick={(e) => { e.stopPropagation(); handleGrant(agent.id, 'san', 2) }} className="text-purple-500 font-bold text-[10px] hover:scale-125">+</button>
                                        </div>
                                    </div>
                                </div>
                                {agent.conditions.length > 0 ? (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {agent.conditions.slice(0, 2).map((condition, index) => (
                                            <span
                                                key={`${agent.id}:${condition}:${index}`}
                                                className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] text-amber-200"
                                            >
                                                {condition}
                                            </span>
                                        ))}
                                        {agent.conditions.length > 2 ? (
                                            <span className="rounded border border-white/20 px-1.5 py-0.5 text-[9px] text-white/70">
                                                +{agent.conditions.length - 2}
                                            </span>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
