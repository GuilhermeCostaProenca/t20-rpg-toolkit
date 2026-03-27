import { prisma } from "@/lib/prisma";
import {
  getMemoryEventLinkedEntityIds,
  getMemoryEventSearchText,
  isMemoryWorldEvent,
} from "@/lib/world-memory";
import { Prisma } from "@prisma/client";

type Context = { params: { id: string } | Promise<{ id: string }> };
type TimeWindow = "ALL" | "7D" | "30D" | "90D";
type MemoryTone = "ALL" | "summary" | "change" | "death" | "note";

function missingId() {
  const message = "Parametro id obrigatorio.";
  return Response.json({ error: message, message }, { status: 400 });
}

function resolveSinceDate(window: TimeWindow) {
  if (window === "ALL") return null;
  const now = new Date();
  const days = window === "7D" ? 7 : window === "30D" ? 30 : 90;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function resolveToneType(tone: MemoryTone) {
  if (tone === "summary") return "SESSION_END";
  if (tone === "change") return "WORLD_CHANGE";
  if (tone === "death") return "NPC_DEATH";
  if (tone === "note") return "NOTE";
  return null;
}

export async function GET(req: Request, { params }: Context) {
  let id = "";
  try {
    ({ id } = await Promise.resolve(params));
    if (!id) return missingId();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
    const campaignId = searchParams.get("campaignId")?.trim() ?? "";
    const entityId = searchParams.get("entityId")?.trim() ?? "";
    const visibility = searchParams.get("visibility")?.toUpperCase();
    const tone = (searchParams.get("tone")?.toLowerCase() ?? "all") as MemoryTone;
    const timeWindow = (searchParams.get("timeWindow")?.toUpperCase() ?? "ALL") as TimeWindow;
    const limit = Math.min(
      Math.max(Number.parseInt(searchParams.get("limit") ?? "60", 10) || 60, 1),
      200,
    );

    const where: Prisma.WorldEventWhereInput = {
      worldId: id,
      meta: {
        path: ["memorySource"],
        equals: "session-closeout",
      },
    };

    if (campaignId) {
      where.campaignId = campaignId;
    }

    if (visibility === "MASTER" || visibility === "PLAYERS") {
      where.visibility = visibility;
    }

    const toneType = resolveToneType(tone);
    if (toneType) {
      where.type = toneType;
    }

    const since = resolveSinceDate(timeWindow);
    if (since) {
      where.ts = { gte: since };
    }

    const baseEvents = await prisma.worldEvent.findMany({
      where,
      orderBy: { ts: "desc" },
      take: 600,
    });

    const filtered = baseEvents
      .filter((event) => isMemoryWorldEvent(event))
      .filter((event) => {
        if (entityId) {
          const linked = getMemoryEventLinkedEntityIds(event);
          if (!linked.includes(entityId)) return false;
        }
        if (query.length > 0) {
          if (!getMemoryEventSearchText(event).includes(query)) return false;
        }
        return true;
      })
      .slice(0, limit);

    return Response.json({ data: filtered });
  } catch (error) {
    console.error("GET /api/worlds/[id]/memory/search", error);
    const message = "Nao foi possivel buscar memoria do mundo.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}
