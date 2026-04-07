import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { BoardCreateSchema } from "@/lib/validators";

type Context = { params: { id: string } | Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Context) {
  const { id } = await Promise.resolve(params);

  try {
    const boards = await prisma.boardDocument.findMany({
      where: { worldId: id },
      include: {
        nodes: true,
        edges: true,
      },
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    });

    return Response.json({ data: boards });
  } catch (error) {
    console.error("GET /api/worlds/[id]/boards", error);
    const message = "Nao foi possivel listar as lousas do mundo.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Context) {
  const { id } = await Promise.resolve(params);

  try {
    const payload = await req.json();
    const parsed = BoardCreateSchema.parse(payload);

    const board = await prisma.boardDocument.create({
      data: {
        worldId: id,
        name: parsed.name,
        viewportJson: parsed.viewportJson as Prisma.InputJsonValue | undefined,
      },
      include: {
        nodes: true,
        edges: true,
      },
    });

    return Response.json({ data: board }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((issue) => issue.message).join(", ");
      return Response.json({ error: message, message }, { status: 400 });
    }

    console.error("POST /api/worlds/[id]/boards", error);
    const message = "Nao foi possivel criar a lousa.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}
