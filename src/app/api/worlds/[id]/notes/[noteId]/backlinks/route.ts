import { prisma } from "@/lib/prisma";

type Context = {
  params:
    | { id: string; noteId: string }
    | Promise<{ id: string; noteId: string }>;
};

export async function GET(_req: Request, { params }: Context) {
  const { id, noteId } = await Promise.resolve(params);

  try {
    const note = await prisma.noteDocument.findFirst({
      where: { id: noteId, worldId: id },
      select: { id: true },
    });

    if (!note) {
      const message = "Nota nao encontrada.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    const backlinks = await prisma.noteLink.findMany({
      where: {
        worldId: id,
        toNoteId: noteId,
      },
      include: {
        fromNote: {
          select: { id: true, title: true, slug: true, updatedAt: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return Response.json({ data: backlinks });
  } catch (error) {
    console.error("GET /api/worlds/[id]/notes/[noteId]/backlinks", error);
    const message = "Nao foi possivel carregar backlinks da nota.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}