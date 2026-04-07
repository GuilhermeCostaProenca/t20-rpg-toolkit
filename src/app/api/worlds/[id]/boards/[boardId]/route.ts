import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { BoardUpdateSchema } from "@/lib/validators";

type Context = {
  params:
    | { id: string; boardId: string }
    | Promise<{ id: string; boardId: string }>;
};

export async function GET(_req: Request, { params }: Context) {
  const { id, boardId } = await Promise.resolve(params);

  try {
    const board = await prisma.boardDocument.findFirst({
      where: { id: boardId, worldId: id },
      include: {
        nodes: { orderBy: [{ z: "asc" }, { id: "asc" }] },
        edges: true,
      },
    });

    if (!board) {
      const message = "Lousa nao encontrada.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    return Response.json({ data: board });
  } catch (error) {
    console.error("GET /api/worlds/[id]/boards/[boardId]", error);
    const message = "Nao foi possivel carregar a lousa.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Context) {
  const { id, boardId } = await Promise.resolve(params);

  try {
    const payload = await req.json();
    const parsed = BoardUpdateSchema.parse(payload);

    const existing = await prisma.boardDocument.findFirst({
      where: { id: boardId, worldId: id },
      select: { id: true },
    });

    if (!existing) {
      const message = "Lousa nao encontrada.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.boardDocument.update({
        where: { id: boardId },
        data: {
          name: parsed.name,
          viewportJson: parsed.viewportJson as Prisma.InputJsonValue | undefined,
        },
      });

      if (parsed.nodes) {
        await tx.boardEdge.deleteMany({ where: { boardId } });
        await tx.boardNode.deleteMany({ where: { boardId } });

        const nodeIdMap = new Map<string, string>();

        for (const node of parsed.nodes) {
          const created = await tx.boardNode.create({
            data: {
              boardId,
              worldId: id,
              nodeType: node.nodeType,
              refId: node.refId,
              x: node.x,
              y: node.y,
              w: node.w,
              h: node.h,
              z: node.z ?? 0,
            },
          });

          if (node.id) {
            nodeIdMap.set(node.id, created.id);
          }
        }

        if (parsed.edges) {
          for (const edge of parsed.edges) {
            const sourceNodeId = nodeIdMap.get(edge.sourceNodeId) ?? edge.sourceNodeId;
            const targetNodeId = nodeIdMap.get(edge.targetNodeId) ?? edge.targetNodeId;

            await tx.boardEdge.create({
              data: {
                boardId,
                worldId: id,
                sourceNodeId,
                targetNodeId,
                label: edge.label,
              },
            });
          }
        }
      }
    });

    const board = await prisma.boardDocument.findUnique({
      where: { id: boardId },
      include: {
        nodes: { orderBy: [{ z: "asc" }, { id: "asc" }] },
        edges: true,
      },
    });

    return Response.json({ data: board });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((issue) => issue.message).join(", ");
      return Response.json({ error: message, message }, { status: 400 });
    }
    console.error("PATCH /api/worlds/[id]/boards/[boardId]", error);
    const message = "Nao foi possivel atualizar a lousa.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  const { id, boardId } = await Promise.resolve(params);

  try {
    const existing = await prisma.boardDocument.findFirst({
      where: { id: boardId, worldId: id },
      select: { id: true },
    });

    if (!existing) {
      const message = "Lousa nao encontrada.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    await prisma.boardDocument.delete({ where: { id: boardId } });

    return Response.json({ data: { id: boardId } });
  } catch (error) {
    console.error("DELETE /api/worlds/[id]/boards/[boardId]", error);
    const message = "Nao foi possivel remover a lousa.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}
