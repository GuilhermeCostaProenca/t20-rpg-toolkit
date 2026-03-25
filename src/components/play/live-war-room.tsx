"use client";

import { ArrowLeft, ArrowRight, Swords } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SquadMonitor } from "@/components/overseer/squad-monitor";
import { InteractiveMap, type Pin, type Token } from "@/components/map/interactive-map";
import { type DieType } from "@/components/dice/die";

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
        <div className="flex gap-2 rounded-lg border border-white/10 bg-white/5 p-2 items-center">
            <span className="mr-2 text-xs font-bold uppercase text-muted-foreground">Dados</span>
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
            <div className="mx-2 h-6 w-px bg-white/10" />
            <Input
                placeholder="Ex: 2d8+4"
                className="h-8 w-24 border-white/10 bg-black/20 text-xs font-mono"
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        onRoll(e.currentTarget.value);
                        e.currentTarget.value = "";
                    }
                }}
            />
        </div>
    );
}

type LiveWarRoomProps = {
    campaignId: string;
    campaignName?: string | null;
    isCombatActive?: boolean;
    narrativeContext?: {
        sceneTitle: string;
        subsceneTitle?: string | null;
    } | null;
    combatTurn?: {
        round: number;
        currentName: string;
        currentKind: string;
    } | null;
    mapTokens: Token[];
    pins: Pin[];
    onTokenMove: (id: string, x: number, y: number) => void | Promise<void>;
    onPinCreate: (pin: Pin) => void | Promise<void>;
    onTurnNext?: () => void | Promise<void>;
    onTurnPrev?: () => void | Promise<void>;
    onRollDice: (payload: {
        expression: string;
        modifier: number;
        count: number;
        diceArray: DieType[];
    }) => void;
};

export function LiveWarRoom({
    campaignId,
    campaignName,
    isCombatActive = false,
    narrativeContext,
    combatTurn,
    mapTokens,
    pins,
    onTokenMove,
    onPinCreate,
    onTurnNext,
    onTurnPrev,
    onRollDice,
}: LiveWarRoomProps) {
    return (
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-neutral-900 text-muted-foreground">
            {isCombatActive ? (
                <div className="pointer-events-none absolute left-1/2 top-4 z-40 w-full max-w-3xl -translate-x-1/2 px-4 pt-2">
                    <SquadMonitor campaignId={campaignId} />
                </div>
            ) : null}

            <InteractiveMap
                className="absolute inset-0 z-0"
                tokens={mapTokens}
                pins={pins}
                onTokenMove={onTokenMove}
                onPinCreate={onPinCreate}
            />

            {!isCombatActive && narrativeContext?.sceneTitle ? (
                <div className="pointer-events-none absolute left-4 top-4 z-30 rounded-xl border border-white/10 bg-black/60 px-3 py-2 backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">
                        Cena ativa
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{narrativeContext.sceneTitle}</p>
                    {narrativeContext.subsceneTitle ? (
                        <p className="mt-1 text-xs text-muted-foreground">{narrativeContext.subsceneTitle}</p>
                    ) : null}
                </div>
            ) : null}

            {isCombatActive && combatTurn ? (
                <div className="absolute right-4 top-4 z-30 rounded-xl border border-red-500/30 bg-black/70 p-3 backdrop-blur">
                    <div className="flex items-center justify-between gap-3">
                        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-red-300">
                            <Swords className="h-3.5 w-3.5" />
                            Round {combatTurn.round}
                        </p>
                        <div className="flex items-center gap-1">
                            <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7 border-white/10 bg-white/5"
                                onClick={() => void onTurnPrev?.()}
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7 border-white/10 bg-white/5"
                                onClick={() => void onTurnNext?.()}
                            >
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-foreground">{combatTurn.currentName}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-red-200/80">
                        {combatTurn.currentKind === "CHARACTER" ? "PC" : "Hostil"}
                    </p>
                </div>
            ) : null}

            <div className="pointer-events-none z-10 mb-20 select-none text-center opacity-30">
                <p className="text-[10px] font-light uppercase tracking-[0.2em] drop-shadow-md shadow-black">
                    {isCombatActive
                        ? `Simulacao Tatica: ${campaignName ?? "Mesa ao vivo"}`
                        : campaignName ?? "Mesa ao vivo"}
                </p>
            </div>

            <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 shadow-2xl">
                <DiceTray
                    onRoll={(expr) => {
                        const parts = expr.split("+");
                        const dicePart = parts[0] ?? "1d20";
                        const modifier = Number.parseInt(parts[1] ?? "0", 10) || 0;

                        const count = Number.parseInt(dicePart.split("d")[0] ?? "1", 10) || 1;
                        const typePart = dicePart.split("d")[1] ?? "20";
                        const type = `d${typePart}` as DieType;

                        onRollDice({
                            expression: expr,
                            modifier,
                            count,
                            diceArray: Array(Math.min(count, 10)).fill(type),
                        });
                    }}
                />
            </div>
        </div>
    );
}
