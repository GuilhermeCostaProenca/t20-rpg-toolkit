import { normalizeEvent } from "@/lib/events/normalize";
import { EventPayload } from "@/lib/events/types";

export type SessionSummaryPayload = {
  summary: string;
  highlights: string[];
  npcs: string[];
  items: string[];
  hooks: string[];
};

function asOptionalString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function getBreakdownTotal(
  breakdown: unknown,
  key: "toHit" | "damage"
): string | number | undefined {
  if (!breakdown || typeof breakdown !== "object" || !(key in breakdown)) {
    return undefined;
  }

  const record = breakdown as Record<string, unknown>;
  const bucket = record[key];
  if (!bucket || typeof bucket !== "object" || !("total" in bucket)) {
    return undefined;
  }

  const total = bucket.total;
  return typeof total === "number" || typeof total === "string" ? total : undefined;
}

export function summarizeSession(rawEvents: unknown[]): SessionSummaryPayload {
  const events: EventPayload[] = rawEvents.map((ev) => normalizeEvent(ev));

  if (!events.length) {
    return {
      summary: "Sessão sem eventos registrados.",
      highlights: [],
      npcs: [],
      items: [],
      hooks: [],
    };
  }

  const actors = new Set<string>();
  const targets = new Set<string>();
  const npcsMentioned = new Set<string>();
  const itemsFound = new Set<string>();
  const highlights: string[] = [];

  events.slice(0, 200).forEach((ev) => {
    const actorName = asOptionalString(ev.actorName);
    const targetName = asOptionalString((ev as EventPayload & { targetName?: unknown }).targetName);
    const targetId = asOptionalString((ev as EventPayload & { targetId?: unknown }).targetId);
    const note = asOptionalString((ev as EventPayload & { note?: unknown }).note) ?? asOptionalString(ev.message);
    const damageTotal = getBreakdownTotal(ev.breakdown, "damage");
    const toHitTotal = getBreakdownTotal(ev.breakdown, "toHit");

    if (actorName) actors.add(actorName);
    if (targetName) targets.add(targetName);

    if (ev.type === "NPC_MENTION" && note) npcsMentioned.add(note);
    if (ev.type === "ITEM_MENTION" && note) itemsFound.add(note);
    if (ev.type === "NOTE" && note) highlights.push(`Nota: ${note}`);

    if (damageTotal) {
      highlights.push(
        `${actorName ?? "Ator"} causou ${damageTotal} em ${targetName ?? targetId ?? "alvo"}`
      );
    }

    if (toHitTotal) {
      highlights.push(
        `${actorName ?? "Jogador"} rolou ${toHitTotal}${damageTotal ? ` e dano ${damageTotal}` : ""
        }`
      );
    }
  });

  const actorsList = Array.from(actors);
  const targetsList = Array.from(targets);
  const npcs = Array.from(new Set([...npcsMentioned, ...targetsList])).slice(0, 10);
  const items = Array.from(itemsFound).slice(0, 10);

  const summary = `Sessão com ${events.length} eventos. Participantes: ${actorsList.length ? actorsList.slice(0, 5).join(", ") : "N/D"
    }. Principais alvos: ${targetsList.length ? targetsList.slice(0, 5).join(", ") : "N/D"}.`;

  const hooks = [
    npcs[0] ? `Revisar envolvimento de ${npcs[0]}.` : "Mapear ganchos para a proxima sessao.",
    items[0] ? `Investigar item ${items[0]}.` : undefined,
  ].filter(Boolean) as string[];

  return {
    summary,
    highlights: highlights.slice(0, 8),
    npcs,
    items,
    hooks,
  };
}
