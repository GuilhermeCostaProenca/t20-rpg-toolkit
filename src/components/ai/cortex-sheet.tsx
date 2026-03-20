"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Brain,
    ChevronRight,
    Dices,
    MessageSquare,
    Plus,
    Scroll,
    Sparkles,
    Sword,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { CortexInput } from "./cortex-input";
import type { ChatHistoryItem } from "./cortex-provider";
import { useCortex } from "./cortex-provider";

interface CortexSessionSummary {
    id: string;
    title: string;
    updatedAt: string;
}

export function CortexSheet() {
    const { isOpen, setIsOpen, activeSessionId, startNewSession, history, loadSession } = useCortex();
    const [sessions, setSessions] = useState<CortexSessionSummary[]>([]);

    useEffect(() => {
        if (!isOpen) return;

        fetch("/api/ai/chat?campaignId=demo")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setSessions(data as CortexSessionSummary[]);
            })
            .catch((error) => console.error(error));
    }, [isOpen]);

    const historyItems = history as ChatHistoryItem[];

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent
                side="right"
                className="flex w-full max-w-none flex-col gap-0 border-l border-white/10 bg-[#0a0a0a] p-0 sm:w-[450px]"
            >
                <div className="flex items-center justify-between border-b border-white/10 bg-black/40 p-4 backdrop-blur">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/50 bg-primary/20 text-primary shadow-[0_0_10px_-3px_rgba(255,100,255,0.5)]">
                            <Brain className="h-4 w-4" />
                        </div>
                        <div>
                            <SheetTitle className="text-base font-bold tracking-tight">Jarvis</SheetTitle>
                            <SheetDescription className="text-xs text-muted-foreground">
                                Neural Interface v2.3
                            </SheetDescription>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={startNewSession} title="Nova conversa">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <div className="relative flex-1 overflow-hidden">
                    {!activeSessionId && sessions.length > 0 && historyItems.length === 0 ? (
                        <ScrollArea className="h-full px-4 py-4">
                            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Historico recente
                            </h3>
                            <div className="space-y-2">
                                {sessions.map((session) => (
                                    <button
                                        key={session.id}
                                        onClick={() => loadSession(session.id)}
                                        className="group flex w-full flex-col gap-1 rounded-lg border border-white/5 bg-white/5 p-3 text-left transition-all hover:border-primary/30 hover:bg-white/10"
                                        type="button"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="truncate pr-2 text-sm font-medium text-foreground/90">
                                                {session.title}
                                            </span>
                                            <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">
                                            {format(new Date(session.updatedAt), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <ScrollArea className="h-full px-4 py-4">
                            <div className="space-y-6 pb-4">
                                {historyItems.map((msg, idx) => (
                                    <div
                                        key={`${msg.role}-${idx}`}
                                        className={cn(
                                            "flex flex-col gap-1",
                                            msg.role === "user" ? "items-end" : "items-start",
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                                                msg.role === "user"
                                                    ? "rounded-br-none bg-primary text-primary-foreground"
                                                    : "rounded-bl-none border border-white/10 bg-[#1a1a1a] text-foreground",
                                            )}
                                        >
                                            {msg.role === "assistant" ? (
                                                <div className="mb-2 flex items-center gap-2 border-b border-white/5 pb-2 text-primary/80">
                                                    {getIntentIcon(msg.intent)}
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                                        {msg.intent || "RESPOSTA"}
                                                    </span>
                                                </div>
                                            ) : null}

                                            <div className="whitespace-pre-wrap">
                                                {typeof msg.content === "string" ? msg.content : ""}
                                            </div>

                                            {msg.meta ? (
                                                <div className="mt-2 rounded border border-white/5 bg-black/30 p-2 font-mono text-xs text-muted-foreground">
                                                    {msg.intent === "ROLL" ? (
                                                        <div className="flex items-center justify-between">
                                                            <span>Resultado:</span>
                                                            <span className="text-base font-bold text-emerald-400">
                                                                {readRollTotal(msg.meta)}
                                                            </span>
                                                        </div>
                                                    ) : null}
                                                    {msg.intent === "SUMMON" ? (
                                                        <div className="text-emerald-400">Invocado com sucesso.</div>
                                                    ) : null}
                                                </div>
                                            ) : null}
                                        </div>
                                        <span className="px-1 text-[10px] text-muted-foreground">
                                            {msg.createdAt
                                                ? format(new Date(msg.createdAt), "HH:mm", { locale: ptBR })
                                                : ""}
                                        </span>
                                    </div>
                                ))}

                                {historyItems.length === 0 ? (
                                    <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-muted-foreground opacity-50">
                                        <Brain className="h-8 w-8 text-primary" />
                                        <p className="text-sm">Inicie uma nova linha de pensamento...</p>
                                    </div>
                                ) : null}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <div className="border-t border-white/10 bg-black/40 p-4 backdrop-blur">
                    <CortexInput mode="chat" className="border-white/10 bg-white/5 shadow-none" />
                </div>
            </SheetContent>
        </Sheet>
    );
}

function getIntentIcon(intent?: string) {
    if (!intent) return <MessageSquare className="h-3 w-3" />;
    switch (intent) {
        case "ROLL":
            return <Dices className="h-3 w-3" />;
        case "ATTACK":
            return <Sword className="h-3 w-3" />;
        case "SUMMON":
            return <Plus className="h-3 w-3" />;
        case "INFO":
            return <Scroll className="h-3 w-3" />;
        default:
            return <Sparkles className="h-3 w-3" />;
    }
}

function readRollTotal(meta: unknown) {
    if (meta && typeof meta === "object" && "total" in meta) {
        const value = (meta as { total?: unknown }).total;
        if (typeof value === "number" || typeof value === "string") return value;
    }
    return "—";
}
