import { prisma } from "@/lib/prisma";
import { EntityRelationshipUpdateSchema } from "@/lib/validators";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

type Context = {
  params:
    | { id: string; relationshipId: string }
    | Promise<{ id: string; relationshipId: string }>;
};

export async function PATCH(req: Request, { params }: Context) {
  const { id, relationshipId } = await Promise.resolve(params);
  try {
    const payload = await req.json();
    const parsed = EntityRelationshipUpdateSchema.parse(payload);

    const existing = await prisma.entityRelationship.findFirst({
      where: { id: relationshipId, worldId: id },
      select: { id: true },
    });
    if (!existing) {
      const message = "Relacao nao encontrada.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    const updated = await prisma.entityRelationship.update({
      where: { id: relationshipId },
      data: {
        fromEntityId: parsed.fromEntityId,
        toEntityId: parsed.toEntityId,
        type: parsed.type,
        directionality: parsed.directionality,
        weight: parsed.weight,
        notes: parsed.notes,
        metadata: parsed.metadata as Prisma.InputJsonValue | undefined,
        visibility: parsed.visibility,
      },
      include: {
        fromEntity: { select: { id: true, name: true, type: true } },
        toEntity: { select: { id: true, name: true, type: true } },
      },
    });

    return Response.json({ data: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((issue) => issue.message).join(", ");
      return Response.json({ error: message, message }, { status: 400 });
    }
    console.error("PATCH /api/worlds/[id]/relationships/[relationshipId]", error);
    const message = "Nao foi possivel atualizar a relacao.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  const { id, relationshipId } = await Promise.resolve(params);
  try {
    const existing = await prisma.entityRelationship.findFirst({
      where: { id: relationshipId, worldId: id },
      select: { id: true },
    });
    if (!existing) {
      const message = "Relacao nao encontrada.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    await prisma.entityRelationship.delete({ where: { id: relationshipId } });
    return Response.json({ data: { id: relationshipId } });
  } catch (error) {
    console.error("DELETE /api/worlds/[id]/relationships/[relationshipId]", error);
    const message = "Nao foi possivel remover a relacao.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}
