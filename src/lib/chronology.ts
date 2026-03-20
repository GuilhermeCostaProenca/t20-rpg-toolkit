export type WorldChronologySettings = {
  calendarName: string;
  currentYearLabel: string;
  currentEraLabel: string;
  datingRule: string;
  toneOfHistory: string;
};

export type ChronologyEventKind = "era" | "founding_event" | "milestone";

export function getEmptyChronologySettings(): WorldChronologySettings {
  return {
    calendarName: "",
    currentYearLabel: "",
    currentEraLabel: "",
    datingRule: "",
    toneOfHistory: "",
  };
}

export function normalizeChronologySettings(metadata: unknown): WorldChronologySettings {
  const chronology =
    metadata &&
    typeof metadata === "object" &&
    "chronology" in metadata &&
    metadata.chronology &&
    typeof metadata.chronology === "object"
      ? (metadata.chronology as Record<string, unknown>)
      : {};

  return {
    calendarName: typeof chronology.calendarName === "string" ? chronology.calendarName : "",
    currentYearLabel: typeof chronology.currentYearLabel === "string" ? chronology.currentYearLabel : "",
    currentEraLabel: typeof chronology.currentEraLabel === "string" ? chronology.currentEraLabel : "",
    datingRule: typeof chronology.datingRule === "string" ? chronology.datingRule : "",
    toneOfHistory: typeof chronology.toneOfHistory === "string" ? chronology.toneOfHistory : "",
  };
}

export function buildChronologyMetadata(
  settings: WorldChronologySettings,
  existingMetadata?: unknown
) {
  const existing =
    existingMetadata && typeof existingMetadata === "object"
      ? { ...(existingMetadata as Record<string, unknown>) }
      : {};

  return {
    ...existing,
    chronology: {
      calendarName: settings.calendarName || undefined,
      currentYearLabel: settings.currentYearLabel || undefined,
      currentEraLabel: settings.currentEraLabel || undefined,
      datingRule: settings.datingRule || undefined,
      toneOfHistory: settings.toneOfHistory || undefined,
    },
  };
}

export function parseChronologyMeta(meta: unknown) {
  const parsed =
    meta && typeof meta === "object" ? (meta as Record<string, unknown>) : undefined;
  const chronology =
    parsed?.chronology && typeof parsed.chronology === "object"
      ? (parsed.chronology as Record<string, unknown>)
      : undefined;

  return {
    kind: typeof chronology?.kind === "string" ? chronology.kind : "",
    eraLabel: typeof chronology?.eraLabel === "string" ? chronology.eraLabel : "",
    yearLabel: typeof chronology?.yearLabel === "string" ? chronology.yearLabel : "",
    sortKey:
      typeof chronology?.sortKey === "number"
        ? chronology.sortKey
        : typeof chronology?.sortKey === "string" && chronology.sortKey.trim().length > 0
          ? Number(chronology.sortKey)
          : undefined,
    linkedEntityIds: Array.isArray(chronology?.linkedEntityIds)
      ? chronology.linkedEntityIds.filter((item): item is string => typeof item === "string")
      : [],
  };
}

export function resolveChronologySortKey(meta: unknown) {
  const chronology = parseChronologyMeta(meta);
  if (typeof chronology.sortKey === "number" && !Number.isNaN(chronology.sortKey)) {
    return chronology.sortKey;
  }

  const numericYear = chronology.yearLabel.match(/-?\d+/);
  if (numericYear) {
    return Number(numericYear[0]);
  }

  return 0;
}
