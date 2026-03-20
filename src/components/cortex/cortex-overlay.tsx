"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Radio, ShieldAlert, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

type OverlayStatus = "IDLE" | "COMBAT" | "ANALYZING" | "CRITICAL";

interface OverlayEventPayload {
    roll?: { result?: number };
    result?: number;
    target?: number;
    dc?: number;
}

interface LiveOverlayEvent {
    type: string;
    payload?: OverlayEventPayload;
}

interface CortexOverlayProps {
    events: LiveOverlayEvent[];
}

export function CortexOverlay({ events }: CortexOverlayProps) {
    const [status, setStatus] = useState<OverlayStatus>("IDLE");
    const [message, setMessage] = useState<string | null>(null);

    const triggerAlert = useEffectEvent((msg: string, type: Exclude<OverlayStatus, "IDLE">) => {
        setMessage(msg);
        const previousStatus = status;
        setStatus(type);
        setTimeout(() => {
            setMessage(null);
            setStatus(previousStatus === "COMBAT" ? "COMBAT" : "IDLE");
        }, 3000);
    });

    const handleEvent = useEffectEvent((lastEvent: LiveOverlayEvent) => {
        if (lastEvent.type === "COMBAT_STARTED") {
            setStatus("COMBAT");
            return;
        }

        if (lastEvent.type === "COMBAT_ENDED") {
            setStatus("IDLE");
            return;
        }

        if (lastEvent.type === "ROLL" || lastEvent.type === "ATTACK") {
            const result = lastEvent.payload?.roll?.result ?? lastEvent.payload?.result;
            const target = lastEvent.payload?.target ?? lastEvent.payload?.dc;

            if (result === undefined) return;

            if (result >= 20) {
                triggerAlert("CRITICAL THREAT DETECTED", "CRITICAL");
                return;
            }

            if (result === 1) {
                triggerAlert("SYSTEM FAILURE (FUMBLE)", "CRITICAL");
                return;
            }

            if (target !== undefined) {
                if (result >= target) {
                    setMessage(`SUCCESS CHECK: ${result} >= ${target}`);
                    setStatus("ANALYZING");
                    setTimeout(() => setMessage(null), 3000);
                } else {
                    setMessage(`FAILURE CHECK: ${result} < ${target}`);
                    setStatus("CRITICAL");
                    setTimeout(() => {
                        setMessage(null);
                        setStatus("IDLE");
                    }, 3000);
                }
            }

            return;
        }

        if (lastEvent.type === "INFO" || lastEvent.type === "LOOK") {
            triggerAlert("ANALYZING TARGET...", "ANALYZING");
        }
    });

    useEffect(() => {
        if (events.length === 0) return;
        handleEvent(events[events.length - 1]);
    }, [events]);

    return (
        <div className="absolute inset-0 z-[100] select-none overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20 pointer-events-none z-10" />

            <div className="absolute top-0 left-0 p-8">
                <div className="w-16 h-16 border-t-2 border-l-2 border-primary/50" />
            </div>
            <div className="absolute top-0 right-0 p-8">
                <div className="w-16 h-16 border-t-2 border-r-2 border-primary/50" />
            </div>
            <div className="absolute bottom-0 left-0 p-8">
                <div className="w-16 h-16 border-b-2 border-l-2 border-primary/50" />
                <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-primary/40">
                    <Activity className="w-3 h-3 animate-pulse" />
                    SYSTEM ONLINE
                </div>
            </div>
            <div className="absolute bottom-0 right-0 flex flex-col items-end p-8">
                <div className="w-16 h-16 border-b-2 border-r-2 border-primary/50" />
                <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-primary/40">
                    Jarvis v1.0
                    <Cpu className="w-3 h-3" />
                </div>
            </div>

            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                        className={cn(
                            "absolute top-1/4 left-1/2 -translate-x-1/2 px-6 py-2 border-2 backdrop-blur-md flex items-center gap-4",
                            status === "CRITICAL"
                                ? "border-red-500 bg-red-900/40 text-red-500"
                                : status === "ANALYZING"
                                  ? "border-cyan-500 bg-cyan-900/40 text-cyan-400"
                                  : "border-primary bg-black/50 text-primary",
                        )}
                    >
                        {status === "CRITICAL" && <ShieldAlert className="w-6 h-6 animate-pulse" />}
                        {status === "ANALYZING" && <Radio className="w-6 h-6 animate-spin-slow" />}

                        <div className="flex flex-col">
                            <span className="text-xs font-bold tracking-[0.3em] uppercase opacity-70">System Alert</span>
                            <span className="text-lg font-black tracking-wider uppercase glitch-text">{message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="absolute inset-0 box-border border-[10px] border-transparent pointer-events-none"
                animate={{
                    boxShadow: status === "COMBAT" ? "inset 0 0 100px rgba(220, 38, 38, 0.3)" : "inset 0 0 0px transparent",
                }}
                transition={{ duration: 1 }}
            />
        </div>
    );
}
