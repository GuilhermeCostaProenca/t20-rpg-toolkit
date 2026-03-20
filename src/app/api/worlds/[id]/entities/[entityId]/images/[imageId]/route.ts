import { prisma } from "@/lib/prisma";
import { EntityImageUpdateSchema } from "@/lib/validators";
import { ZodError } from "zod";

type Context = {
  params:
    | { id: string; entityId: string; imageId: string }
    | Promise<{ id: string; entityId: string; imageId: string }>;
};

export async function PATCH(req: Request, { params }: Context) {
  const { id, entityId, imageId } = await Promise.resolve(params);
  try {
    const payload = await req.json();
    const parsed = EntityImageUpdateSchema.parse(payload);

    const image = await prisma.entityImage.findFirst({
      where: { id: imageId, entityId, worldId: id },
      select: { id: true },
    });
    if (!image) {
      const message = "Imagem nao encontrada.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    const updated = await prisma.entityImage.update({
      where: { id: imageId },
      data: {
        url: parsed.url,
        kind: parsed.kind,
        caption: parsed.caption,
        sortOrder: parsed.sortOrder,
      },
    });

    return Response.json({ data: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((issue) => issue.message).join(", ");
      return Response.json({ error: message, message }, { status: 400 });
    }
    console.error("PATCH /api/worlds/[id]/entities/[entityId]/images/[imageId]", error);
    const message = "Nao foi possivel atualizar a imagem.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  const { id, entityId, imageId } = await Promise.resolve(params);
  try {
    const image = await prisma.entityImage.findFirst({
      where: { id: imageId, entityId, worldId: id },
      select: { id: true },
    });
    if (!image) {
      const message = "Imagem nao encontrada.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    await prisma.entityImage.delete({ where: { id: imageId } });
    return Response.json({ data: { id: imageId } });
  } catch (error) {
    console.error("DELETE /api/worlds/[id]/entities/[entityId]/images/[imageId]", error);
    const message = "Nao foi possivel remover a imagem.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}
