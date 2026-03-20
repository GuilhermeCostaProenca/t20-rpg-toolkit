type WorldEventLike = {
  id: string;
  type: string;
  text?: string | null;
  ts: string;
  visibility: string;
  scope?: string;
  campaignId?: string | null;
  sessionId?: string | null;
  actorId?: string | null;
  targetId?: string | null;
  meta?: Record<string, unknown> | null;
};

function getMemoryMeta(event: WorldEventLike) {
  return event.meta && typeof event.meta === "object" ? event.meta : undefined;
}

export function isMemoryWorldEvent(event: WorldEventLike) {
  const meta = getMemoryMeta(event);
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

export function formatMemoryEventVisibility(visibility: string) {
  return visibility === "PLAYERS" ? "Publico" : "Mestre";
}

export function formatMemoryEventKind(event: WorldEventLike) {
  const meta = getMemoryMeta(event);
  switch (meta?.memoryKind) {
    case "session-summary":
      return "Resumo de sessao";
    case "master-summary":
      return "Resumo do mestre";
    case "attendance":
      return "Presenca";
    case "death":
      return "Morte";
    case "change":
      return "Consequencia";
    default:
      return "Memoria";
  }
}

export function getMemoryEventSearchText(event: WorldEventLike) {
  const meta = getMemoryMeta(event);
  const fragments = [
    event.type,
    event.text,
    event.visibility,
    event.scope,
    formatMemoryEventType(event.type),
    formatMemoryEventKind(event),
    typeof meta?.changeType === "string" ? meta.changeType : undefined,
    typeof meta?.attendanceStatus === "string" ? meta.attendanceStatus : undefined,
    typeof meta?.publicSummary === "string" ? meta.publicSummary : undefined,
    typeof meta?.masterSummary === "string" ? meta.masterSummary : undefined,
  ];

  if (Array.isArray(meta?.linkedEntityIds)) {
    fragments.push(
      ...meta.linkedEntityIds.filter((item): item is string => typeof item === "string")
    );
  }

  return fragments
    .filter((fragment): fragment is string => typeof fragment === "string" && fragment.trim().length > 0)
    .join(" ")
    .toLowerCase();
}

export function getMemoryEventLinkedEntityCount(event: WorldEventLike) {
  const meta = getMemoryMeta(event);
  if (Array.isArray(meta?.linkedEntityIds)) {
    return meta.linkedEntityIds.filter((item): item is string => typeof item === "string").length;
  }
  return [event.actorId, event.targetId].filter(Boolean).length;
}
