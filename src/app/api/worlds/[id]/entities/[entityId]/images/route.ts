import { prisma } from "@/lib/prisma";
import { EntityImageCreateSchema } from "@/lib/validators";
import { ZodError } from "zod";

type Context = {
  params:
    | { id: string; entityId: string }
    | Promise<{ id: string; entityId: string }>;
};

export async function POST(req: Request, { params }: Context) {
  const { id, entityId } = await Promise.resolve(params);

  try {
    const payload = await req.json();
    const parsed = EntityImageCreateSchema.parse(payload);

    const entity = await prisma.entity.findFirst({
      where: { id: entityId, worldId: id },
      select: { id: true },
    });
    if (!entity) {
      const message = "Entidade nao encontrada.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    const created = await prisma.entityImage.create({
      data: {
        entityId,
        worldId: id,
        url: parsed.url,
        kind: parsed.kind ?? "reference",
        caption: parsed.caption,
        sortOrder: parsed.sortOrder ?? 0,
      },
    });

    return Response.json({ data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((issue) => issue.message).join(", ");
      return Response.json({ error: message, message }, { status: 400 });
    }
    console.error("POST /api/worlds/[id]/entities/[entityId]/images", error);
    const message = "Nao foi possivel adicionar a imagem.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}
