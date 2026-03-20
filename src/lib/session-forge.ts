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
  imageUrl?: string;
};

export type SessionForgeSceneStatus = SessionForgeBeatStatus;

export type SessionForgeSubscene = {
  id: string;
  title: string;
  objective: string;
  status: SessionForgeSceneStatus;
  linkedEntityIds: string[];
  linkedRevealIds: string[];
};

export type SessionForgeScene = {
  id: string;
  title: string;
  objective: string;
  status: SessionForgeSceneStatus;
  linkedEntityIds: string[];
  linkedRevealIds: string[];
  linkedBeatIds: string[];
  subscenes: SessionForgeSubscene[];
};

export type SessionForgeEncounterEnemy = {
  npcId?: string;
  label: string;
  quantity: number;
  unitScore?: number;
};

export type SessionForgeEncounter = {
  id: string;
  title: string;
  notes: string;
  linkedSceneId?: string;
  enemies: SessionForgeEncounterEnemy[];
  rating: "trivial" | "manageable" | "risky" | "deadly";
  confidence: "low" | "medium" | "high";
  pressureRatio: number;
  recommendation: string;
};

export type SessionForgeMemoryVisibility = "MASTER" | "PLAYERS";

export type SessionForgeMemoryAttendanceStatus = "appeared" | "absent";

export type SessionForgeMemoryAttendanceItem = {
  id: string;
  label: string;
  entityId?: string;
  status: SessionForgeMemoryAttendanceStatus;
  notes: string;
  visibility: SessionForgeMemoryVisibility;
};

export type SessionForgeMemoryDeathItem = {
  id: string;
  label: string;
  entityId?: string;
  notes: string;
  visibility: SessionForgeMemoryVisibility;
};

export type SessionForgeMemoryChangeType =
  | "discovery"
  | "alliance"
  | "rupture"
  | "status"
  | "world_change"
  | "secret"
  | "other";

export type SessionForgeMemoryChangeItem = {
  id: string;
  title: string;
  type: SessionForgeMemoryChangeType;
  notes: string;
  linkedEntityIds: string[];
  visibility: SessionForgeMemoryVisibility;
};

export type SessionForgeMemoryState = {
  publicSummary: string;
  masterSummary: string;
  attendance: SessionForgeMemoryAttendanceItem[];
  deaths: SessionForgeMemoryDeathItem[];
  changes: SessionForgeMemoryChangeItem[];
};

export type SessionForgeState = {
  briefing: string;
  tableObjective: string;
  currentArc: string;
  masterNotes: string;
  operationalNotes: string;
  linkedEntityIds: string[];
  beats: SessionForgeBeat[];
  scenes: SessionForgeScene[];
  hooks: SessionForgeDramaticItem[];
  secrets: SessionForgeDramaticItem[];
  reveals: SessionForgeDramaticItem[];
  encounters: SessionForgeEncounter[];
  memory: SessionForgeMemoryState;
};

function buildForgeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getEmptySessionForgeState(): SessionForgeState {
  return {
    briefing: "",
    tableObjective: "",
    currentArc: "",
    masterNotes: "",
    operationalNotes: "",
    linkedEntityIds: [],
    beats: [],
    scenes: [],
    hooks: [],
    secrets: [],
    reveals: [],
    encounters: [],
    memory: {
      publicSummary: "",
      masterSummary: "",
      attendance: [],
      deaths: [],
      changes: [],
    },
  };
}

function parseSceneStatus(value: unknown): SessionForgeSceneStatus {
  return value === "optional" || value === "improvised" || value === "discarded"
    ? value
    : "planned";
}

function parseLinkedIds(value: unknown) {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function parseSubscenes(value: unknown): SessionForgeSubscene[] {
  return Array.isArray(value)
    ? value
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
        .map((item) => ({
          id: typeof item.id === "string" && item.id.trim() ? item.id : buildForgeId("subscene"),
          title: typeof item.title === "string" ? item.title : "",
          objective: typeof item.objective === "string" ? item.objective : "",
          status: parseSceneStatus(item.status),
          linkedEntityIds: parseLinkedIds(item.linkedEntityIds),
          linkedRevealIds: parseLinkedIds(item.linkedRevealIds),
        }))
    : [];
}

function parseScenes(value: unknown): SessionForgeScene[] {
  return Array.isArray(value)
    ? value
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
        .map((item) => ({
          id: typeof item.id === "string" && item.id.trim() ? item.id : buildForgeId("scene"),
          title: typeof item.title === "string" ? item.title : "",
          objective: typeof item.objective === "string" ? item.objective : "",
          status: parseSceneStatus(item.status),
          linkedEntityIds: parseLinkedIds(item.linkedEntityIds),
          linkedRevealIds: parseLinkedIds(item.linkedRevealIds),
          linkedBeatIds: parseLinkedIds(item.linkedBeatIds),
          subscenes: parseSubscenes(item.subscenes),
        }))
    : [];
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
                : buildForgeId("dramatic"),
            title: typeof item.title === "string" ? item.title : "",
            notes: typeof item.notes === "string" ? item.notes : "",
            status,
            imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : undefined,
          };
        })
    : [];
}

function parseEncounterEnemies(value: unknown): SessionForgeEncounterEnemy[] {
  return Array.isArray(value)
    ? value
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
        .map((item) => ({
          npcId: typeof item.npcId === "string" ? item.npcId : undefined,
          label: typeof item.label === "string" ? item.label : "",
          quantity: typeof item.quantity === "number" ? Math.max(item.quantity, 1) : 1,
          unitScore: typeof item.unitScore === "number" ? item.unitScore : undefined,
        }))
    : [];
}

function parseEncounters(value: unknown): SessionForgeEncounter[] {
  return Array.isArray(value)
    ? value
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
        .map((item) => ({
          id:
            typeof item.id === "string" && item.id.trim()
              ? item.id
              : buildForgeId("encounter"),
          title: typeof item.title === "string" ? item.title : "",
          notes: typeof item.notes === "string" ? item.notes : "",
          linkedSceneId: typeof item.linkedSceneId === "string" ? item.linkedSceneId : undefined,
          enemies: parseEncounterEnemies(item.enemies),
          rating:
            item.rating === "trivial" ||
            item.rating === "risky" ||
            item.rating === "deadly"
              ? item.rating
              : "manageable",
          confidence:
            item.confidence === "low" || item.confidence === "medium" ? item.confidence : "high",
          pressureRatio: typeof item.pressureRatio === "number" ? item.pressureRatio : 0,
          recommendation: typeof item.recommendation === "string" ? item.recommendation : "",
        }))
    : [];
}

function parseMemoryVisibility(value: unknown): SessionForgeMemoryVisibility {
  return value === "PLAYERS" ? "PLAYERS" : "MASTER";
}

function parseMemoryAttendanceStatus(value: unknown): SessionForgeMemoryAttendanceStatus {
  return value === "absent" ? "absent" : "appeared";
}

function parseMemoryAttendance(value: unknown): SessionForgeMemoryAttendanceItem[] {
  return Array.isArray(value)
    ? value
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
        .map((item) => ({
          id:
            typeof item.id === "string" && item.id.trim()
              ? item.id
              : buildForgeId("attendance"),
          label: typeof item.label === "string" ? item.label : "",
          entityId: typeof item.entityId === "string" ? item.entityId : undefined,
          status: parseMemoryAttendanceStatus(item.status),
          notes: typeof item.notes === "string" ? item.notes : "",
          visibility: parseMemoryVisibility(item.visibility),
        }))
    : [];
}

function parseMemoryDeaths(value: unknown): SessionForgeMemoryDeathItem[] {
  return Array.isArray(value)
    ? value
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
        .map((item) => ({
          id:
            typeof item.id === "string" && item.id.trim()
              ? item.id
              : buildForgeId("death"),
          label: typeof item.label === "string" ? item.label : "",
          entityId: typeof item.entityId === "string" ? item.entityId : undefined,
          notes: typeof item.notes === "string" ? item.notes : "",
          visibility: parseMemoryVisibility(item.visibility),
        }))
    : [];
}

function parseMemoryChangeType(value: unknown): SessionForgeMemoryChangeType {
  return value === "discovery" ||
    value === "alliance" ||
    value === "rupture" ||
    value === "status" ||
    value === "world_change" ||
    value === "secret"
    ? value
    : "other";
}

function parseMemoryChanges(value: unknown): SessionForgeMemoryChangeItem[] {
  return Array.isArray(value)
    ? value
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
        .map((item) => ({
          id:
            typeof item.id === "string" && item.id.trim()
              ? item.id
              : buildForgeId("change"),
          title: typeof item.title === "string" ? item.title : "",
          type: parseMemoryChangeType(item.type),
          notes: typeof item.notes === "string" ? item.notes : "",
          linkedEntityIds: parseLinkedIds(item.linkedEntityIds),
          visibility: parseMemoryVisibility(item.visibility),
        }))
    : [];
}

export function normalizeSessionForgeState(metadata: unknown): SessionForgeState {
  const meta = metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>) : undefined;
  const forge =
    meta?.forge && typeof meta.forge === "object"
      ? (meta.forge as Record<string, unknown>)
      : undefined;
  const memory =
    meta?.memory && typeof meta.memory === "object"
      ? (meta.memory as Record<string, unknown>)
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
                : buildForgeId("beat"),
            title: typeof item.title === "string" ? item.title : "",
            summary: typeof item.summary === "string" ? item.summary : "",
            status,
            linkedEntityIds: parseLinkedIds(item.linkedEntityIds),
          };
        })
    : [];

  return {
    briefing: typeof forge?.briefing === "string" ? forge.briefing : "",
    tableObjective: typeof forge?.tableObjective === "string" ? forge.tableObjective : "",
    currentArc: typeof forge?.currentArc === "string" ? forge.currentArc : "",
    masterNotes: typeof forge?.masterNotes === "string" ? forge.masterNotes : "",
    operationalNotes: typeof forge?.operationalNotes === "string" ? forge.operationalNotes : "",
    linkedEntityIds: parseLinkedIds(forge?.linkedEntityIds),
    beats,
    scenes: parseScenes(forge?.scenes),
    hooks: parseDramaticCollection(forge?.hooks),
    secrets: parseDramaticCollection(forge?.secrets),
    reveals: parseDramaticCollection(forge?.reveals),
    encounters: parseEncounters(forge?.encounters),
    memory: {
      publicSummary: typeof memory?.publicSummary === "string" ? memory.publicSummary : "",
      masterSummary: typeof memory?.masterSummary === "string" ? memory.masterSummary : "",
      attendance: parseMemoryAttendance(memory?.attendance),
      deaths: parseMemoryDeaths(memory?.deaths),
      changes: parseMemoryChanges(memory?.changes),
    },
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
      scenes: forge.scenes.length
        ? forge.scenes.map((scene) => ({
            id: scene.id,
            title: scene.title || undefined,
            objective: scene.objective || undefined,
            status: scene.status,
            linkedEntityIds: scene.linkedEntityIds.length ? scene.linkedEntityIds : undefined,
            linkedRevealIds: scene.linkedRevealIds.length ? scene.linkedRevealIds : undefined,
            linkedBeatIds: scene.linkedBeatIds.length ? scene.linkedBeatIds : undefined,
            subscenes: scene.subscenes.length
              ? scene.subscenes.map((subscene) => ({
                  id: subscene.id,
                  title: subscene.title || undefined,
                  objective: subscene.objective || undefined,
                  status: subscene.status,
                  linkedEntityIds: subscene.linkedEntityIds.length ? subscene.linkedEntityIds : undefined,
                  linkedRevealIds: subscene.linkedRevealIds.length ? subscene.linkedRevealIds : undefined,
                }))
              : undefined,
          }))
        : undefined,
      hooks: forge.hooks.length
        ? forge.hooks.map((item) => ({
            id: item.id,
            title: item.title || undefined,
            notes: item.notes || undefined,
            status: item.status,
            imageUrl: item.imageUrl || undefined,
          }))
        : undefined,
      secrets: forge.secrets.length
        ? forge.secrets.map((item) => ({
            id: item.id,
            title: item.title || undefined,
            notes: item.notes || undefined,
            status: item.status,
            imageUrl: item.imageUrl || undefined,
          }))
        : undefined,
      reveals: forge.reveals.length
        ? forge.reveals.map((item) => ({
            id: item.id,
            title: item.title || undefined,
            notes: item.notes || undefined,
            status: item.status,
            imageUrl: item.imageUrl || undefined,
          }))
        : undefined,
      encounters: forge.encounters.length
        ? forge.encounters.map((encounter) => ({
            id: encounter.id,
            title: encounter.title || undefined,
            notes: encounter.notes || undefined,
            linkedSceneId: encounter.linkedSceneId || undefined,
            enemies: encounter.enemies.length
              ? encounter.enemies.map((enemy) => ({
                  npcId: enemy.npcId || undefined,
                  label: enemy.label || undefined,
                  quantity: enemy.quantity,
                  unitScore: enemy.unitScore,
                }))
              : undefined,
            rating: encounter.rating,
            confidence: encounter.confidence,
            pressureRatio: encounter.pressureRatio,
            recommendation: encounter.recommendation || undefined,
          }))
        : undefined,
    },
    memory: {
      publicSummary: forge.memory.publicSummary || undefined,
      masterSummary: forge.memory.masterSummary || undefined,
      attendance: forge.memory.attendance.length
        ? forge.memory.attendance.map((item) => ({
            id: item.id,
            label: item.label || undefined,
            entityId: item.entityId || undefined,
            status: item.status,
            notes: item.notes || undefined,
            visibility: item.visibility,
          }))
        : undefined,
      deaths: forge.memory.deaths.length
        ? forge.memory.deaths.map((item) => ({
            id: item.id,
            label: item.label || undefined,
            entityId: item.entityId || undefined,
            notes: item.notes || undefined,
            visibility: item.visibility,
          }))
        : undefined,
      changes: forge.memory.changes.length
        ? forge.memory.changes.map((item) => ({
            id: item.id,
            title: item.title || undefined,
            type: item.type,
            notes: item.notes || undefined,
            linkedEntityIds: item.linkedEntityIds.length ? item.linkedEntityIds : undefined,
            visibility: item.visibility,
          }))
        : undefined,
    },
  };
}
