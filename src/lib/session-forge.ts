export type SessionForgeBeatStatus = "planned" | "optional" | "improvised" | "discarded";

export type SessionForgeBeat = {
  id: string;
  title: string;
  summary: string;
  status: SessionForgeBeatStatus;
  linkedEntityIds: string[];
};

export type SessionForgeDramaticStatus = "planned" | "executed" | "delayed" | "canceled";

export type SessionForgeDramaticItem = {
  id: string;
  title: string;
  notes: string;
  status: SessionForgeDramaticStatus;
};

export type SessionForgeState = {
  briefing: string;
  tableObjective: string;
  currentArc: string;
  masterNotes: string;
  operationalNotes: string;
  linkedEntityIds: string[];
  beats: SessionForgeBeat[];
  hooks: SessionForgeDramaticItem[];
  secrets: SessionForgeDramaticItem[];
  reveals: SessionForgeDramaticItem[];
};

export function getEmptySessionForgeState(): SessionForgeState {
  return {
    briefing: "",
    tableObjective: "",
    currentArc: "",
    masterNotes: "",
    operationalNotes: "",
    linkedEntityIds: [],
    beats: [],
    hooks: [],
    secrets: [],
    reveals: [],
  };
}

function parseDramaticCollection(value: unknown): SessionForgeDramaticItem[] {
  return Array.isArray(value)
    ? value
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
        .map((item) => {
          const status: SessionForgeDramaticStatus =
            item.status === "executed" ||
            item.status === "delayed" ||
            item.status === "canceled"
              ? item.status
              : "planned";

          return {
            id:
              typeof item.id === "string" && item.id.trim()
                ? item.id
                : `dramatic-${Math.random().toString(36).slice(2, 10)}`,
            title: typeof item.title === "string" ? item.title : "",
            notes: typeof item.notes === "string" ? item.notes : "",
            status,
          };
        })
    : [];
}

export function normalizeSessionForgeState(metadata: unknown): SessionForgeState {
  const meta = metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>) : undefined;
  const forge =
    meta?.forge && typeof meta.forge === "object"
      ? (meta.forge as Record<string, unknown>)
      : undefined;

  const beats = Array.isArray(forge?.beats)
    ? forge.beats
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
        .map((item): SessionForgeBeat => {
          const status: SessionForgeBeatStatus =
            item.status === "optional" ||
            item.status === "improvised" ||
            item.status === "discarded"
              ? item.status
              : "planned";

          return {
            id:
              typeof item.id === "string" && item.id.trim()
                ? item.id
                : `beat-${Math.random().toString(36).slice(2, 10)}`,
            title: typeof item.title === "string" ? item.title : "",
            summary: typeof item.summary === "string" ? item.summary : "",
            status,
            linkedEntityIds: Array.isArray(item.linkedEntityIds)
              ? item.linkedEntityIds.filter((entityId): entityId is string => typeof entityId === "string")
              : [],
          };
        })
    : [];

  return {
    briefing: typeof forge?.briefing === "string" ? forge.briefing : "",
    tableObjective: typeof forge?.tableObjective === "string" ? forge.tableObjective : "",
    currentArc: typeof forge?.currentArc === "string" ? forge.currentArc : "",
    masterNotes: typeof forge?.masterNotes === "string" ? forge.masterNotes : "",
    operationalNotes: typeof forge?.operationalNotes === "string" ? forge.operationalNotes : "",
    linkedEntityIds: Array.isArray(forge?.linkedEntityIds)
      ? forge.linkedEntityIds.filter((entityId): entityId is string => typeof entityId === "string")
      : [],
    beats,
    hooks: parseDramaticCollection(forge?.hooks),
    secrets: parseDramaticCollection(forge?.secrets),
    reveals: parseDramaticCollection(forge?.reveals),
  };
}

export function buildSessionMetadata(forge: SessionForgeState, currentMetadata?: unknown) {
  const base =
    currentMetadata && typeof currentMetadata === "object"
      ? { ...(currentMetadata as Record<string, unknown>) }
      : {};

  return {
    ...base,
    forge: {
      briefing: forge.briefing || undefined,
      tableObjective: forge.tableObjective || undefined,
      currentArc: forge.currentArc || undefined,
      masterNotes: forge.masterNotes || undefined,
      operationalNotes: forge.operationalNotes || undefined,
      linkedEntityIds: forge.linkedEntityIds.length ? forge.linkedEntityIds : undefined,
      beats: forge.beats.length
        ? forge.beats.map((beat) => ({
            id: beat.id,
            title: beat.title || undefined,
            summary: beat.summary || undefined,
            status: beat.status,
            linkedEntityIds: beat.linkedEntityIds.length ? beat.linkedEntityIds : undefined,
          }))
        : undefined,
      hooks: forge.hooks.length
        ? forge.hooks.map((item) => ({
            id: item.id,
            title: item.title || undefined,
            notes: item.notes || undefined,
            status: item.status,
          }))
        : undefined,
      secrets: forge.secrets.length
        ? forge.secrets.map((item) => ({
            id: item.id,
            title: item.title || undefined,
            notes: item.notes || undefined,
            status: item.status,
          }))
        : undefined,
      reveals: forge.reveals.length
        ? forge.reveals.map((item) => ({
            id: item.id,
            title: item.title || undefined,
            notes: item.notes || undefined,
            status: item.status,
          }))
        : undefined,
    },
  };
}
