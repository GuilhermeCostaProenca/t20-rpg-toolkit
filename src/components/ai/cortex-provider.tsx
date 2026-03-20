"use client";

import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";

export type CortexIntent = "ROLL" | "ATTACK" | "SUMMON" | "INFO" | string;

export interface ChatHistoryItem {
    role: "user" | "assistant" | "system";
    content: string;
    createdAt?: Date | string;
    intent?: CortexIntent;
    meta?: unknown;
    isError?: boolean;
}

interface CortexContextType {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    toggle: () => void;
    activeSessionId: string | null;
    startNewSession: () => void;
    loadSession: (sessionId: string) => void;
    sendMessage: (text: string, campaignId: string) => Promise<void>;
    history: ChatHistoryItem[];
}

const CortexContext = createContext<CortexContextType | undefined>(undefined);

export function CortexProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [history, setHistory] = useState<ChatHistoryItem[]>([]);

    function toggle() {
        setIsOpen(!isOpen);
    }

    function startNewSession() {
        setActiveSessionId(null);
        setHistory([]);
    }

    function loadSession(sessionId: string) {
        setActiveSessionId(sessionId);
        setIsOpen(true);
        fetch(`/api/ai/chat?sessionId=${sessionId}`)
            .then((res) => res.json())
            .then((data) => setHistory(Array.isArray(data) ? (data as ChatHistoryItem[]) : []))
            .catch((err) => console.error(err));
    }

    async function sendMessage(text: string, campaignId: string) {
        const tempUserMsg: ChatHistoryItem = { role: "user", content: text, createdAt: new Date() };
        setHistory((prev) => [...prev, tempUserMsg]);
        setIsOpen(true);

        try {
            const cmdRes = await fetch("/api/ai/command", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    command: text,
                    context: { route: window.location.pathname },
                }),
            });
            const cmdData = await cmdRes.json();

            if (!cmdRes.ok) throw new Error(cmdData.error || "Erro no processamento");

            const chatRes = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: activeSessionId,
                    campaignId,
                    userId: "user",
                    message: { content: text },
                    aiResponse: {
                        content: cmdData.message,
                        intent: cmdData.action?.intent,
                        meta: cmdData.result,
                    },
                }),
            });
            const chatData = await chatRes.json();

            if (!activeSessionId && chatData.sessionId) {
                setActiveSessionId(chatData.sessionId);
            }

            const aiMsg: ChatHistoryItem = {
                role: "assistant",
                content: cmdData.message,
                intent: cmdData.action?.intent,
                meta: cmdData.result,
                createdAt: new Date(),
            };
            setHistory((prev) => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            toast.error("Erro no chat Jarvis.");
            const errorMsg: ChatHistoryItem = {
                role: "system",
                content: "Erro de conexao.",
                isError: true,
            };
            setHistory((prev) => [...prev, errorMsg]);
        }
    }

    return (
        <CortexContext.Provider
            value={{
                isOpen,
                setIsOpen,
                toggle,
                activeSessionId,
                startNewSession,
                loadSession,
                sendMessage,
                history,
            }}
        >
            {children}
        </CortexContext.Provider>
    );
}

export function useCortex() {
    const context = useContext(CortexContext);
    if (context === undefined) {
        throw new Error("useCortex must be used within a CortexProvider");
    }
    return context;
}
