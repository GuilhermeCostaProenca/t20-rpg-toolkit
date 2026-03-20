import { Prisma, WorldEventScope, WorldEventType, WorldEventVisibility } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { normalizeSessionForgeState } from "@/lib/session-forge";

type SessionMemorySyncInput = {
  id: string;
  worldId: string;
  campaignId: string;
  title: string;
  metadata?: Prisma.JsonValue | null;
};

function asMetaRecord(value: Prisma.JsonValue | null | undefined) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function buildEventText(prefix: string, title: string, details?: string) {
  if (details?.trim()) {
    return `${prefix}: ${title}. ${details.trim()}`;
  }
  return `${prefix}: ${title}`;
}

export async function syncSessionMemoryEvents(session: SessionMemorySyncInput) {
  const memory = normalizeSessionForgeState(session.metadata).memory;

  const existing = await prisma.worldEvent.findMany({
    where: {
      worldId: session.worldId,
      sessionId: session.id,
      type: {
        in: [
          WorldEventType.SESSION_END,
          WorldEventType.NPC_DEATH,
          WorldEventType.WORLD_CHANGE,
          WorldEventType.NOTE,
        ],
      },
    },
    select: { id: true, meta: true },
  });

  const memoryEventIds = existing
    .filter((event) => asMetaRecord(event.meta as Prisma.JsonValue | null)?.memorySource === "session-closeout")
    .map((event) => event.id);

  if (memoryEventIds.length > 0) {
    await prisma.worldEvent.deleteMany({
      where: { id: { in: memoryEventIds } },
    });
  }

  const creates: Prisma.WorldEventCreateManyInput[] = [];

  const publicSummary = memory.publicSummary.trim();
  const masterSummary = memory.masterSummary.trim();
  if (publicSummary || masterSummary) {
    creates.push({
      worldId: session.worldId,
      campaignId: session.campaignId,
      sessionId: session.id,
      type: WorldEventType.SESSION_END,
      scope: WorldEventScope.MACRO,
      impactLevel: 4,
      visibility: publicSummary ? WorldEventVisibility.PLAYERS : WorldEventVisibility.MASTER,
      text: publicSummary || masterSummary || `Sessao ${session.title} consolidada`,
      meta: {
        memorySource: "session-closeout",
        memoryKind: "session-summary",
        publicSummary: publicSummary || undefined,
        masterSummary: masterSummary || undefined,
      } as Prisma.InputJsonValue,
    });

    if (masterSummary && masterSummary !== publicSummary) {
      creates.push({
        worldId: session.worldId,
        campaignId: session.campaignId,
        sessionId: session.id,
        type: WorldEventType.NOTE,
        scope: WorldEventScope.MACRO,
        impactLevel: 3,
        visibility: WorldEventVisibility.MASTER,
        text: masterSummary,
        meta: {
          memorySource: "session-closeout",
          memoryKind: "master-summary",
        } as Prisma.InputJsonValue,
      });
    }
  }

  for (const item of memory.attendance) {
    if (!item.label.trim()) continue;
    creates.push({
      worldId: session.worldId,
      campaignId: session.campaignId,
      sessionId: session.id,
      type: WorldEventType.NOTE,
      scope: WorldEventScope.MICRO,
      impactLevel: item.status === "appeared" ? 2 : 1,
      targetId: item.entityId,
      visibility:
        item.visibility === "PLAYERS" ? WorldEventVisibility.PLAYERS : WorldEventVisibility.MASTER,
      text: buildEventText(
        item.status === "appeared" ? "Aparicao registrada" : "Ausencia registrada",
        item.label,
        item.notes
      ),
      meta: {
        memorySource: "session-closeout",
        memoryKind: "attendance",
        attendanceStatus: item.status,
      } as Prisma.InputJsonValue,
    });
  }

  for (const item of memory.deaths) {
    if (!item.label.trim()) continue;
    creates.push({
      worldId: session.worldId,
      campaignId: session.campaignId,
      sessionId: session.id,
      type: WorldEventType.NPC_DEATH,
      scope: WorldEventScope.MACRO,
      impactLevel: 6,
      targetId: item.entityId,
      visibility:
        item.visibility === "PLAYERS" ? WorldEventVisibility.PLAYERS : WorldEventVisibility.MASTER,
      text: buildEventText("Morte registrada", item.label, item.notes),
      meta: {
        memorySource: "session-closeout",
        memoryKind: "death",
      } as Prisma.InputJsonValue,
    });
  }

  for (const item of memory.changes) {
    if (!item.title.trim()) continue;
    creates.push({
      worldId: session.worldId,
      campaignId: session.campaignId,
      sessionId: session.id,
      type: WorldEventType.WORLD_CHANGE,
      scope: WorldEventScope.MACRO,
      impactLevel: 4,
      actorId: item.linkedEntityIds[0],
      targetId: item.linkedEntityIds[1],
      visibility:
        item.visibility === "PLAYERS" ? WorldEventVisibility.PLAYERS : WorldEventVisibility.MASTER,
      text: buildEventText("Mudanca consolidada", item.title, item.notes),
      meta: {
        memorySource: "session-closeout",
        memoryKind: "change",
        changeType: item.type,
        linkedEntityIds: item.linkedEntityIds,
      } as Prisma.InputJsonValue,
    });
  }

  if (creates.length > 0) {
    await prisma.worldEvent.createMany({ data: creates });
  }
}
