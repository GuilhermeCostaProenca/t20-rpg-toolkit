import { prisma } from "@/lib/prisma";
import { Prisma, WorldEventScope, WorldEventType } from "@prisma/client";
import { z } from "zod";

const worldEventTypes = new Set(Object.values(WorldEventType));
const worldEventScopes = new Set(Object.values(WorldEventScope));

const CreateWorldEventSchema = z.object({
  type: z.nativeEnum(WorldEventType),
  scope: z.nativeEnum(WorldEventScope),
  text: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
  visibility: z.enum(["MASTER", "PLAYERS"]).optional().default("MASTER"),
  impactLevel: z.coerce.number().int().min(1).max(10).optional(),
  actorId: z.string().trim().max(120).optional().or(z.literal("").transform(() => undefined)),
  targetId: z.string().trim().max(120).optional().or(z.literal("").transform(() => undefined)),
  payload: z.record(z.string(), z.unknown()).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

type Context = { params: { id: string } | Promise<{ id: string }> };

function missingId() {
  const message = "Parametro id obrigatorio.";
  return Response.json({ error: message, message }, { status: 400 });
}

export async function GET(req: Request, { params }: Context) {
  let id = "";
  try {
    ({ id } = await Promise.resolve(params));
    if (!id) return missingId();
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope")?.toUpperCase();
    const type = searchParams.get("type")?.toUpperCase();
    const q = searchParams.get("q")?.trim();

    const where: Prisma.WorldEventWhereInput = { worldId: id };

    if (scope && worldEventScopes.has(scope as WorldEventScope)) {
      where.scope = scope as WorldEventScope;
    }

    if (type && worldEventTypes.has(type as WorldEventType)) {
      where.type = type as WorldEventType;
    }

    if (q) {
      where.text = { contains: q, mode: "insensitive" };
    }

    const events = await prisma.worldEvent.findMany({
      where,
      orderBy: { ts: "desc" },
      take: 200,
    });

    return Response.json({ data: events });
  } catch (error) {
    console.error("GET /api/worlds/[id]/events", error);
    const message = "Nao foi possivel carregar eventos do mundo.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Context) {
  let id = "";
  try {
    ({ id } = await Promise.resolve(params));
    if (!id) return missingId();
    const payload = await req.json();
    const parsed = CreateWorldEventSchema.parse(payload);

    const world = await prisma.world.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!world) {
      const message = "Mundo nao encontrado.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    const event = await prisma.worldEvent.create({
      data: {
        worldId: id,
        type: parsed.type,
        scope: parsed.scope,
        text: parsed.text,
        visibility: parsed.visibility,
        impactLevel: parsed.impactLevel ?? (parsed.scope === "MACRO" ? 5 : 1),
        actorId: parsed.actorId,
        targetId: parsed.targetId,
        payload: parsed.payload as Prisma.InputJsonValue | undefined,
        meta: parsed.meta as Prisma.InputJsonValue | undefined,
      },
    });

    return Response.json({ data: event }, { status: 201 });
  } catch (error) {
    console.error("POST /api/worlds/[id]/events", error);
    const message = error instanceof Error ? error.message : "Nao foi possivel criar evento do mundo.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}
