import { prisma } from "@/lib/prisma";
import { EntityRelationshipCreateSchema } from "@/lib/validators";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

type Context = { params: { id: string } | Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Context) {
  const { id } = await Promise.resolve(params);

  try {
    const relationships = await prisma.entityRelationship.findMany({
      where: { worldId: id },
      include: {
        fromEntity: { select: { id: true, name: true, type: true } },
        toEntity: { select: { id: true, name: true, type: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ data: relationships });
  } catch (error) {
    console.error("GET /api/worlds/[id]/relationships", error);
    const message = "Nao foi possivel listar relacoes.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Context) {
  const { id } = await Promise.resolve(params);
  try {
    const payload = await req.json();
    const parsed = EntityRelationshipCreateSchema.parse(payload);

    const entityCount = await prisma.entity.count({
      where: {
        worldId: id,
        id: { in: [parsed.fromEntityId, parsed.toEntityId] },
      },
    });
    if (entityCount !== 2) {
      const message = "As duas entidades precisam existir no mesmo mundo.";
      return Response.json({ error: message, message }, { status: 400 });
    }

    const created = await prisma.entityRelationship.create({
      data: {
        worldId: id,
        fromEntityId: parsed.fromEntityId,
        toEntityId: parsed.toEntityId,
        type: parsed.type,
        directionality: parsed.directionality ?? "DIRECTED",
        weight: parsed.weight,
        notes: parsed.notes,
        metadata: parsed.metadata as Prisma.InputJsonValue | undefined,
        visibility: parsed.visibility ?? "MASTER",
      },
      include: {
        fromEntity: { select: { id: true, name: true, type: true } },
        toEntity: { select: { id: true, name: true, type: true } },
      },
    });

    return Response.json({ data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((issue) => issue.message).join(", ");
      return Response.json({ error: message, message }, { status: 400 });
    }
    console.error("POST /api/worlds/[id]/relationships", error);
    const message = "Nao foi possivel criar a relacao.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}
