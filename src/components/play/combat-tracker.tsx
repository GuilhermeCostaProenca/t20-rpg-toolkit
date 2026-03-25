"use client";

import { useEffect, useState } from "react";
import { Loader2, Play, SkipForward, Skull, Swords, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
    ApplyConditionPayload,
    CampaignCharacter,
    LiveCombat,
    RemoveConditionPayload,
} from "@/lib/live-combat";
import {
    CONDITION_APPLY_COOLDOWN_MS,
    getCampaignConditionsPath,
    getCampaignCombatInitiativePath,
    getCampaignCombatPath,
    getCampaignCombatTurnPath,
    getCombatConditionApplyPath,
    getCombatConditionRemovePath,
    isPlayerCombatantKind,
} from "@/lib/live-combat";
import { cn } from "@/lib/utils";

type ConditionOption = {
    id: string;
    key: string;
    name: string;
    description?: string | null;
};

type CombatTrackerProps = {
    campaignId: string;
    liveCombat: LiveCombat | null;
    onCombatChange?: () => void | Promise<void>;
    onSelectCharacter?: (characterId: string) => void;
};

export function CombatTracker({
    campaignId,
    liveCombat,
    onCombatChange,
    onSelectCharacter,
}: CombatTrackerProps) {
    const [loading, setLoading] = useState(false);
    const [removingConditionIds, setRemovingConditionIds] = useState<Set<string>>(new Set());
    const [optimisticRemovedConditionIds, setOptimisticRemovedConditionIds] = useState<Set<string>>(
        new Set(),
    );
    const [applyingConditionTargetIds, setApplyingConditionTargetIds] = useState<Set<string>>(new Set());
    const [conditionKeyByTarget, setConditionKeyByTarget] = useState<Record<string, string>>({});
    const [applyCooldownUntilByTarget, setApplyCooldownUntilByTarget] = useState<Record<string, number>>({});
    const [pendingApplyKeysByTarget, setPendingApplyKeysByTarget] = useState<Record<string, string[]>>(
        {},
    );
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [conditionOptions, setConditionOptions] = useState<ConditionOption[]>([]);
    const conditionDatalistId = `conditions-${campaignId}`;

    async function refreshCombat() {
        await onCombatChange?.();
    }

    async function ensureOk(response: Response, fallbackMessage: string) {
        if (response.ok) return;
        const payload = await response.json().catch(() => null);
        const message = (payload?.error as string | undefined) ?? fallbackMessage;
        throw new Error(message);
    }

    function normalizeConditionKey(value: string) {
        return value.trim().toLowerCase();
    }

    useEffect(() => {
        if (!liveCombat) return;
        const liveConditionIds = new Set((liveCombat.conditions ?? []).map((entry) => entry.id));

        setOptimisticRemovedConditionIds((prev) => {
            const next = new Set<string>();
            for (const id of prev) {
                if (liveConditionIds.has(id)) {
                    next.add(id);
                }
            }
            return next.size === prev.size && [...next].every((item) => prev.has(item)) ? prev : next;
        });

        const liveKeysByTarget = new Map<string, Set<string>>();
        for (const entry of liveCombat.conditions ?? []) {
            const key = normalizeConditionKey(entry.condition?.key ?? entry.condition?.name ?? "");
            if (!key) continue;
            const existing = liveKeysByTarget.get(entry.targetCombatantId) ?? new Set<string>();
            existing.add(key);
            liveKeysByTarget.set(entry.targetCombatantId, existing);
        }

        setPendingApplyKeysByTarget((prev) => {
            let changed = false;
            const next: Record<string, string[]> = {};
            for (const [targetId, pendingKeys] of Object.entries(prev)) {
                const liveKeys = liveKeysByTarget.get(targetId) ?? new Set<string>();
                const remaining = pendingKeys.filter((key) => !liveKeys.has(key));
                if (remaining.length > 0) {
                    next[targetId] = remaining;
                }
                if (remaining.length !== pendingKeys.length) {
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, [liveCombat]);

    useEffect(() => {
        if (liveCombat?.isActive) return;
        setRemovingConditionIds(new Set());
        setOptimisticRemovedConditionIds(new Set());
        setApplyingConditionTargetIds(new Set());
        setConditionKeyByTarget({});
        setApplyCooldownUntilByTarget({});
        setPendingApplyKeysByTarget({});
    }, [liveCombat?.isActive]);

    useEffect(() => {
        let cancelled = false;

        const loadConditionOptions = async () => {
            try {
                const response = await fetch(getCampaignConditionsPath(campaignId), { cache: "no-store" });
                if (!response.ok) return;
                const json = await response.json();
                if (!cancelled) {
                    setConditionOptions((json.data as ConditionOption[] | undefined) ?? []);
                }
            } catch {
                if (!cancelled) {
                    setConditionOptions([]);
                }
            }
        };

        void loadConditionOptions();
        return () => {
            cancelled = true;
        };
    }, [campaignId]);

    async function handleStart() {
        setLoading(true);
        setStatusMessage(null);
        try {
            const response = await fetch(getCampaignCombatPath(campaignId), { method: "POST" });
            await ensureOk(response, "Falha ao iniciar combate.");
            await refreshCombat();
            setStatusMessage("Combate iniciado.");
        } catch (error) {
            setStatusMessage(error instanceof Error ? error.message : "Falha ao iniciar combate.");
        } finally {
            setLoading(false);
        }
    }

    async function handleEnd() {
        setLoading(true);
        setStatusMessage(null);
        try {
            const response = await fetch(getCampaignCombatPath(campaignId), { method: "DELETE" });
            await ensureOk(response, "Falha ao encerrar combate.");
            await refreshCombat();
            setStatusMessage("Combate encerrado. Voltando para modo narrativo.");
        } catch (error) {
            setStatusMessage(error instanceof Error ? error.message : "Falha ao encerrar combate.");
        } finally {
            setLoading(false);
        }
    }

    async function handleNextTurn() {
        if (!liveCombat?.isActive) return;
        setLoading(true);
        setStatusMessage(null);
        try {
            const response = await fetch(getCampaignCombatTurnPath(campaignId), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ direction: "next" }),
            });
            await ensureOk(response, "Falha ao avancar turno.");
            await refreshCombat();
        } catch (error) {
            setStatusMessage(error instanceof Error ? error.message : "Falha ao avancar turno.");
        } finally {
            setLoading(false);
        }
    }

    async function handleRollInitiative() {
        if (!liveCombat?.isActive) return;
        setLoading(true);
        setStatusMessage(null);
        try {
            const response = await fetch(`/api/characters?campaignId=${campaignId}&withSheet=true`, {
                cache: "no-store",
            });
            await ensureOk(response, "Falha ao carregar personagens da campanha.");
            const json = await response.json();
            const characters = (json.data as CampaignCharacter[] | undefined) ?? [];

            const rollResponse = await fetch(getCampaignCombatInitiativePath(campaignId), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    combatants: characters.map((character) => ({
                        id: character.id,
                        refId: character.id,
                        name: character.name,
                        kind: "CHARACTER" as const,
                        des: character.sheet?.des ?? 10,
                        hpCurrent: character.sheet?.pvCurrent ?? character.sheet?.pvMax ?? 1,
                        hpMax: character.sheet?.pvMax ?? 1,
                        mpCurrent: character.sheet?.pmCurrent ?? 0,
                        mpMax: character.sheet?.pmMax ?? 0,
                    })),
                }),
            });
            await ensureOk(rollResponse, "Falha ao rolar iniciativa.");

            await refreshCombat();
        } catch (error) {
            setStatusMessage(error instanceof Error ? error.message : "Falha ao rolar iniciativa.");
        } finally {
            setLoading(false);
        }
    }

    async function handleRemoveCondition(appliedConditionId: string) {
        if (!liveCombat?.id) return;
        setRemovingConditionIds((prev) => new Set(prev).add(appliedConditionId));
        setOptimisticRemovedConditionIds((prev) => new Set(prev).add(appliedConditionId));
        setStatusMessage(null);
        try {
            const payload: RemoveConditionPayload = {
                appliedConditionId,
                visibility: "MASTER",
            };
            const response = await fetch(getCombatConditionRemovePath(liveCombat.id), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            await ensureOk(response, "Falha ao remover condicao.");
            await refreshCombat();
        } catch (error) {
            setOptimisticRemovedConditionIds((prev) => {
                const next = new Set(prev);
                next.delete(appliedConditionId);
                return next;
            });
            setStatusMessage(error instanceof Error ? error.message : "Falha ao remover condicao.");
        } finally {
            setRemovingConditionIds((prev) => {
                const next = new Set(prev);
                next.delete(appliedConditionId);
                return next;
            });
        }
    }

    async function handleApplyCondition(targetCombatantId: string) {
        if (!liveCombat?.id) return;
        const now = Date.now();
        const cooldownUntil = applyCooldownUntilByTarget[targetCombatantId] ?? 0;
        if (now < cooldownUntil) return;
        const rawKey = conditionKeyByTarget[targetCombatantId] ?? "";
        const conditionKey = normalizeConditionKey(rawKey);
        if (!conditionKey) return;

        setApplyCooldownUntilByTarget((prev) => ({
            ...prev,
            [targetCombatantId]: now + CONDITION_APPLY_COOLDOWN_MS,
        }));
        setPendingApplyKeysByTarget((prev) => {
            const current = prev[targetCombatantId] ?? [];
            if (current.includes(conditionKey)) return prev;
            return { ...prev, [targetCombatantId]: [...current, conditionKey] };
        });
        setApplyingConditionTargetIds((prev) => new Set(prev).add(targetCombatantId));
        setStatusMessage(null);
        try {
            const payload: ApplyConditionPayload = {
                targetCombatantId,
                conditionKey,
                visibility: "MASTER",
            };
            const response = await fetch(getCombatConditionApplyPath(liveCombat.id), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            await ensureOk(response, "Falha ao aplicar condicao.");
            setConditionKeyByTarget((prev) => ({ ...prev, [targetCombatantId]: "" }));
            await refreshCombat();
        } catch (error) {
            setPendingApplyKeysByTarget((prev) => {
                const current = prev[targetCombatantId] ?? [];
                const nextCurrent = current.filter((key) => key !== conditionKey);
                if (nextCurrent.length === current.length) return prev;
                if (nextCurrent.length === 0) {
                    const next = { ...prev };
                    delete next[targetCombatantId];
                    return next;
                }
                return { ...prev, [targetCombatantId]: nextCurrent };
            });
            setStatusMessage(error instanceof Error ? error.message : "Falha ao aplicar condicao.");
        } finally {
            setApplyingConditionTargetIds((prev) => {
                const next = new Set(prev);
                next.delete(targetCombatantId);
                return next;
            });
        }
    }

    return (
        <Card className="border-red-500/20 bg-black/40 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-red-500">
                        <Swords className="h-4 w-4" /> Combate
                    </CardTitle>
                    <Badge variant="outline" className="border-red-500/30 text-red-400">
                        Round {liveCombat?.round ?? 1}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex gap-2">
                    {!liveCombat?.isActive ? (
                        <Button
                            size="sm"
                            className="w-full bg-red-600 hover:bg-red-700"
                            disabled={loading}
                            onClick={() => void handleStart()}
                        >
                            <Play className="mr-2 h-3 w-3" /> Iniciar
                        </Button>
                    ) : (
                        <>
                            <Button
                                size="sm"
                                variant="secondary"
                                disabled={loading}
                                onClick={() => void handleRollInitiative()}
                            >
                                Rolar Inic.
                            </Button>
                            <Button
                                size="sm"
                                className="flex-1"
                                disabled={loading}
                                onClick={() => void handleNextTurn()}
                            >
                                <SkipForward className="mr-2 h-3 w-3" /> Proximo
                            </Button>
                            <Button
                                size="icon"
                                variant="destructive"
                                disabled={loading}
                                onClick={() => void handleEnd()}
                            >
                                <Skull className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>

                <div className="space-y-1">
                    {liveCombat?.combatants?.map((combatant, index) => {
                        const appliedConditions =
                            liveCombat.conditions?.filter(
                                (entry) =>
                                    entry.targetCombatantId === combatant.id &&
                                    !optimisticRemovedConditionIds.has(entry.id),
                            ) ?? [];
                        const inCooldown =
                            (applyCooldownUntilByTarget[combatant.id] ?? 0) > Date.now();
                        const isApplyingOnTarget = applyingConditionTargetIds.has(combatant.id);
                        const existingConditionKeys = new Set(
                            appliedConditions
                                .map((entry) =>
                                    normalizeConditionKey(entry.condition?.key ?? entry.condition?.name ?? ""),
                                )
                                .filter(Boolean),
                        );
                        const pendingApplyKeys = (pendingApplyKeysByTarget[combatant.id] ?? []).filter(
                            (key) => !existingConditionKeys.has(key),
                        );

                        return (
                            <div
                                key={combatant.id}
                                className={cn(
                                    "rounded p-2 text-sm transition-all",
                                    index === liveCombat.turnIndex
                                        ? "scale-[1.02] border border-red-500/50 bg-red-900/40"
                                        : "border border-transparent bg-white/5",
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 text-center font-mono text-xs text-white/50">
                                            {combatant.initiative}
                                        </span>
                                        <span
                                            className={cn(
                                                "font-medium",
                                                index === liveCombat.turnIndex ? "text-white" : "text-white/70",
                                            )}
                                        >
                                            {combatant.name}
                                        </span>
                                        {isPlayerCombatantKind(combatant.kind) ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-6 border-white/10 bg-white/5 px-2 text-[10px] uppercase tracking-[0.12em]"
                                                onClick={() => onSelectCharacter?.(combatant.refId)}
                                            >
                                                Ficha
                                            </Button>
                                        ) : null}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {combatant.hpCurrent}/{combatant.hpMax} HP
                                    </span>
                                </div>
                                {appliedConditions.length > 0 ? (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {appliedConditions.map((entry) => {
                                            const label =
                                                entry.condition?.name || entry.condition?.key || "Condicao";
                                            const isRemoving = removingConditionIds.has(entry.id);
                                            return (
                                                <button
                                                    key={entry.id}
                                                    type="button"
                                                    disabled={isRemoving}
                                                    onClick={() => void handleRemoveCondition(entry.id)}
                                                    className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-amber-200 disabled:opacity-60"
                                                    title="Remover condicao"
                                                >
                                                    {label}
                                                    {isRemoving ? (
                                                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                                    ) : (
                                                        <X className="h-2.5 w-2.5" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : null}
                                {pendingApplyKeys.length > 0 ? (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {pendingApplyKeys.map((key, keyIndex) => (
                                            <span
                                                key={`${combatant.id}:pending:${key}:${keyIndex}`}
                                                className="inline-flex items-center gap-1 rounded border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-sky-200"
                                            >
                                                {key}
                                                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                                <div className="mt-2 flex items-center gap-1">
                                    <Input
                                        value={conditionKeyByTarget[combatant.id] ?? ""}
                                        onChange={(event) =>
                                            setConditionKeyByTarget((prev) => ({
                                                ...prev,
                                                [combatant.id]: event.target.value,
                                            }))
                                        }
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                event.preventDefault();
                                                void handleApplyCondition(combatant.id);
                                            }
                                        }}
                                        placeholder="condicao-chave"
                                        list={conditionDatalistId}
                                        className="h-7 border-white/10 bg-black/40 text-[11px]"
                                    />
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 border-white/10 bg-white/5 px-2 text-[11px]"
                                        disabled={isApplyingOnTarget || inCooldown}
                                        onClick={() => void handleApplyCondition(combatant.id)}
                                    >
                                        {isApplyingOnTarget
                                            ? "Aplicando..."
                                            : inCooldown
                                                ? "Aguarde..."
                                                : "Aplicar"}
                                    </Button>
                                </div>
                                {isApplyingOnTarget ? (
                                    <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-sky-300">
                                        Aplicando condicao...
                                    </p>
                                ) : null}
                            </div>
                        );
                    })}
                    {liveCombat?.isActive && !liveCombat.combatants.length ? (
                        <div className="py-4 text-center text-xs text-muted-foreground">
                            Role iniciativa para adicionar combatentes.
                        </div>
                    ) : null}
                </div>
                {statusMessage ? (
                    <p className="text-xs text-amber-300">{statusMessage}</p>
                ) : null}
                <datalist id={conditionDatalistId}>
                    {conditionOptions.map((condition) => (
                        <option key={condition.id} value={condition.key}>
                            {condition.name}
                        </option>
                    ))}
                </datalist>
            </CardContent>
        </Card>
    );
}
