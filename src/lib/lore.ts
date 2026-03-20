export type LoreVisibility = "MASTER" | "PLAYERS";
export type LorePrepContext = "politica" | "casas" | "lugares" | "figuras" | "geral";
export type LorePrepFocus = "arco" | "gancho" | "foco_de_mesa" | "segredo" | "referencia";

export type LoreDocMeta = {
  summary: string;
  section: string;
  visibility: LoreVisibility;
  tags: string[];
  linkedEntityIds: string[];
  prepFocuses: LorePrepFocus[];
};

export function getEmptyLoreMeta(): LoreDocMeta {
  return {
    summary: "",
    section: "",
    visibility: "MASTER",
    tags: [],
    linkedEntityIds: [],
    prepFocuses: [],
  };
}

export function buildLoreTextIndex(meta: LoreDocMeta) {
  return JSON.stringify({
    lore: {
      summary: meta.summary || undefined,
      section: meta.section || undefined,
      visibility: meta.visibility || "MASTER",
      tags: meta.tags.length ? meta.tags : undefined,
      linkedEntityIds: meta.linkedEntityIds.length ? meta.linkedEntityIds : undefined,
      prepFocuses: meta.prepFocuses.length ? meta.prepFocuses : undefined,
    },
  });
}

export function parseLoreTextIndex(textIndex?: string | null): LoreDocMeta {
  if (!textIndex) return getEmptyLoreMeta();

  try {
    const parsed = JSON.parse(textIndex) as Record<string, unknown>;
    const lore =
      parsed?.lore && typeof parsed.lore === "object"
        ? (parsed.lore as Record<string, unknown>)
        : undefined;

    return {
      summary: typeof lore?.summary === "string" ? lore.summary : "",
      section: typeof lore?.section === "string" ? lore.section : "",
      visibility: lore?.visibility === "PLAYERS" ? "PLAYERS" : "MASTER",
      tags: Array.isArray(lore?.tags)
        ? lore.tags.filter((item): item is string => typeof item === "string")
        : [],
      linkedEntityIds: Array.isArray(lore?.linkedEntityIds)
        ? lore.linkedEntityIds.filter((item): item is string => typeof item === "string")
        : [],
      prepFocuses: Array.isArray(lore?.prepFocuses)
        ? lore.prepFocuses.filter(
            (item): item is LorePrepFocus =>
              item === "arco" ||
              item === "gancho" ||
              item === "foco_de_mesa" ||
              item === "segredo" ||
              item === "referencia"
          )
        : [],
    };
  } catch {
    return getEmptyLoreMeta();
  }
}

export function inferLorePrepContexts(
  linkedEntities: Array<{ type: string }> | undefined
): LorePrepContext[] {
  if (!linkedEntities || linkedEntities.length === 0) return ["geral"];

  const contexts = new Set<LorePrepContext>();
  for (const entity of linkedEntities) {
    if (["institution", "office", "faction"].includes(entity.type)) contexts.add("politica");
    if (entity.type === "house") contexts.add("casas");
    if (entity.type === "place") contexts.add("lugares");
    if (["npc", "character"].includes(entity.type)) contexts.add("figuras");
  }

  if (contexts.size === 0) contexts.add("geral");
  return Array.from(contexts);
}

export function inferLoreCampaignIds(
  linkedEntities: Array<{ campaign?: { id: string } | null }> | undefined
): string[] {
  if (!linkedEntities || linkedEntities.length === 0) return [];

  const campaignIds = new Set<string>();
  for (const entity of linkedEntities) {
    const id = entity.campaign?.id;
    if (id) campaignIds.add(id);
  }

  return Array.from(campaignIds);
}
