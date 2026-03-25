"use client";

import { useEffect, useRef, type FormEvent } from "react";

import { Send } from "lucide-react";

import { AudioRecorder } from "@/components/audio-recorder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Timeline } from "@/components/timeline/timeline";
import { groupEvents } from "@/lib/timeline/grouper";
import { cn } from "@/lib/utils";

type GameEvent = {
  id: string;
  type: string;
  scope: string;
  ts: string;
  payload: unknown;
  actorName?: string;
  visibility: string;
};

type LiveHistoryChatStackProps = {
  events: GameEvent[];
  pinnedEventIds: Set<string>;
  timelineFilter: "ALL" | "COMBAT" | "CHAT" | "CASE";
  chatInput: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onTimelineFilterChange: (value: "ALL" | "COMBAT" | "CHAT" | "CASE") => void;
  onPinToggle: (id: string) => void;
  onChatInputChange: (value: string) => void;
  onChatSubmit: (event: FormEvent) => void;
  onVoiceTranscription: (text: string) => void;
};

export function LiveHistoryChatStack({
  events,
  pinnedEventIds,
  timelineFilter,
  chatInput,
  scrollRef,
  onTimelineFilterChange,
  onPinToggle,
  onChatInputChange,
  onChatSubmit,
  onVoiceTranscription,
}: LiveHistoryChatStackProps) {
  const chatInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName.toLowerCase();
      const isTypingTarget =
        tagName === "input" ||
        tagName === "textarea" ||
        target?.isContentEditable;
      if (isTypingTarget || !event.altKey || event.key !== "5") return;
      event.preventDefault();
      chatInputRef.current?.focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-b border-white/5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Historico
        </span>
        <div className="flex gap-1">
          {(["ALL", "COMBAT", "CHAT", "CASE"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => onTimelineFilterChange(filter)}
              className={cn(
                "text-[10px] px-2 py-1 rounded transition-colors",
                timelineFilter === filter
                  ? filter === "CASE"
                    ? "bg-amber-500/20 text-amber-500 border border-amber-500/50"
                    : "bg-white/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {filter === "ALL"
                ? "Tudo"
                : filter === "COMBAT"
                  ? "Combate"
                  : filter === "CHAT"
                    ? "Chat"
                    : "Evidencias"}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 bg-black/40 backdrop-blur-sm">
        <div className="min-h-full">
          <Timeline
            groups={[
              ...groupEvents(
                events
                  .filter((event) => {
                    if (timelineFilter === "ALL") return true;
                    if (timelineFilter === "COMBAT") {
                      return (
                        event.type.includes("COMBAT") ||
                        event.type.includes("ATTACK") ||
                        event.type.includes("INITIATIVE") ||
                        event.type.includes("TURN")
                      );
                    }
                    if (timelineFilter === "CHAT") {
                      return event.type === "CHAT" || event.type === "NOTE" || event.type === "ROLL";
                    }
                    if (timelineFilter === "CASE") return pinnedEventIds.has(event.id);
                    return true;
                  })
                  .map((event) => ({
                    ...event,
                    ts: new Date(event.ts),
                    type: event.type as string,
                  }))
              ),
            ].reverse()}
            pinnedIds={pinnedEventIds}
            onPin={onPinToggle}
          />
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-white/10 bg-black/20">
        <form onSubmit={onChatSubmit} className="flex gap-2">
          <Input
            ref={chatInputRef}
            value={chatInput}
            onChange={(event) => onChatInputChange(event.target.value)}
            placeholder="Diga algo..."
            className="bg-white/5 border-white/10 focus-visible:ring-primary/50"
          />
          <Button size="icon" type="submit" variant="default">
            <Send className="w-4 h-4" />
          </Button>
          <AudioRecorder onTranscriptionComplete={onVoiceTranscription} />
        </form>
      </div>
    </>
  );
}
