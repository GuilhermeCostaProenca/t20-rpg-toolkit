type WorldEventLike = {
  id: string;
  type: string;
  text?: string | null;
  ts: string;
  visibility: string;
  scope?: string;
  meta?: Record<string, unknown> | null;
};

export function isMemoryWorldEvent(event: WorldEventLike) {
  const meta = event.meta && typeof event.meta === "object" ? event.meta : undefined;
  return meta?.memorySource === "session-closeout";
}

export function formatMemoryEventType(type: string) {
  switch (type) {
    case "SESSION_END":
      return "Fechamento de sessao";
    case "NPC_DEATH":
      return "Morte";
    case "WORLD_CHANGE":
      return "Mudanca";
    case "NOTE":
      return "Nota";
    default:
      return type.replaceAll("_", " ");
  }
}

export function formatMemoryEventText(event: WorldEventLike) {
  if (event.text?.trim()) return event.text.trim();
  return formatMemoryEventType(event.type);
}

export function getMemoryEventTone(event: WorldEventLike) {
  switch (event.type) {
    case "NPC_DEATH":
      return "death";
    case "WORLD_CHANGE":
      return "change";
    case "SESSION_END":
      return "summary";
    default:
      return "note";
  }
}
