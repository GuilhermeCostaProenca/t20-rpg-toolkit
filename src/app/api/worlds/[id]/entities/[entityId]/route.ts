import { prisma } from "@/lib/prisma";
import { ENTITY_INCLUDE } from "@/lib/codex";
import { EntityUpdateSchema } from "@/lib/validators";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

type Context = {
  params:
    | { id: string; entityId: string }
    | Promise<{ id: string; entityId: string }>;
};

export async function GET(_req: Request, { params }: Context) {
  const { id, entityId } = await Promise.resolve(params);

  try {
    const entity = await prisma.entity.findFirst({
      where: { id: entityId, worldId: id },
      include: ENTITY_INCLUDE,
    });
    if (!entity) {
      const message = "Entidade nao encontrada.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    const recentEvents = await prisma.worldEvent.findMany({
      where: {
        worldId: id,
        OR: [{ actorId: entityId }, { targetId: entityId }],
      },
      orderBy: { ts: "desc" },
      take: 8,
    });

    return Response.json({ data: { ...entity, recentEvents } });
  } catch (error) {
    console.error("GET /api/worlds/[id]/entities/[entityId]", error);
    const message = "Nao foi possivel carregar a entidade.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Context) {
  const { id, entityId } = await Promise.resolve(params);
  try {
    const payload = await req.json();
    const parsed = EntityUpdateSchema.parse(payload);

    const existing = await prisma.entity.findFirst({
      where: { id: entityId, worldId: id },
      select: { id: true },
    });
    if (!existing) {
      const message = "Entidade nao encontrada.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    const updated = await prisma.entity.update({
      where: { id: entityId },
      data: {
        campaignId: parsed.campaignId,
        name: parsed.name,
        slug: parsed.slug,
        type: parsed.type,
        subtype: parsed.subtype,
        summary: parsed.summary,
        description: parsed.description,
        status: parsed.status,
        visibility: parsed.visibility,
        tags: parsed.tags as Prisma.InputJsonValue | undefined,
        metadata: parsed.metadata as Prisma.InputJsonValue | undefined,
        coverImageUrl: parsed.coverImageUrl,
        portraitImageUrl: parsed.portraitImageUrl,
      },
      include: ENTITY_INCLUDE,
    });

    return Response.json({ data: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((issue) => issue.message).join(", ");
      return Response.json({ error: message, message }, { status: 400 });
    }
    console.error("PATCH /api/worlds/[id]/entities/[entityId]", error);
    const message = "Nao foi possivel atualizar a entidade.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  const { id, entityId } = await Promise.resolve(params);
  try {
    const existing = await prisma.entity.findFirst({
      where: { id: entityId, worldId: id },
      select: { id: true },
    });
    if (!existing) {
      const message = "Entidade nao encontrada.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    await prisma.entity.delete({ where: { id: entityId } });
    return Response.json({ data: { id: entityId } });
  } catch (error) {
    console.error("DELETE /api/worlds/[id]/entities/[entityId]", error);
    const message = "Nao foi possivel remover a entidade.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}
