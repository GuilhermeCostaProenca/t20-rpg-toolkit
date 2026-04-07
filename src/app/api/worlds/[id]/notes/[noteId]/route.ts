import { ZodError } from "zod";

import { prisma } from "@/lib/prisma";
import { NoteUpdateSchema } from "@/lib/validators";
import { buildNoteSlug, syncNoteLinks } from "@/lib/world-os/note-service";
import { deleteNoteFile, readNoteFile, writeNoteFile } from "@/lib/world-os/note-storage";

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
      include: {
        outgoingLinks: {
          select: {
            id: true,
            syntaxType: true,
            rawRef: true,
            status: true,
            toEntityId: true,
            toNoteId: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!note) {
      const message = "Nota nao encontrada.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    const contentMd = await readNoteFile(id, noteId).catch(() => note.contentMd);

    return Response.json({ data: { ...note, contentMd } });
  } catch (error) {
    console.error("GET /api/worlds/[id]/notes/[noteId]", error);
    const message = "Nao foi possivel carregar a nota.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Context) {
  const { id, noteId } = await Promise.resolve(params);
  try {
    const payload = await req.json();
    const parsed = NoteUpdateSchema.parse(payload);

    const existing = await prisma.noteDocument.findFirst({
      where: { id: noteId, worldId: id },
      select: { id: true, title: true, contentMd: true },
    });

    if (!existing) {
      const message = "Nota nao encontrada.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    const contentMd = parsed.contentMd ?? existing.contentMd;
    const title = parsed.title ?? existing.title;

    const updated = await prisma.noteDocument.update({
      where: { id: noteId },
      data: {
        title,
        slug: (parsed.slug || buildNoteSlug(title)).toLowerCase(),
        contentMd,
      },
      include: {
        outgoingLinks: {
          select: {
            id: true,
            syntaxType: true,
            rawRef: true,
            status: true,
            toEntityId: true,
            toNoteId: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const filePath = await writeNoteFile(id, noteId, contentMd);
    await prisma.noteDocument.update({ where: { id: noteId }, data: { filePath } });

    await syncNoteLinks(id, noteId, contentMd);

    return Response.json({ data: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((issue) => issue.message).join(", ");
      return Response.json({ error: message, message }, { status: 400 });
    }
    console.error("PATCH /api/worlds/[id]/notes/[noteId]", error);
    const message = "Nao foi possivel atualizar a nota.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  const { id, noteId } = await Promise.resolve(params);
  try {
    const existing = await prisma.noteDocument.findFirst({
      where: { id: noteId, worldId: id },
      select: { id: true },
    });

    if (!existing) {
      const message = "Nota nao encontrada.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    await prisma.noteDocument.delete({ where: { id: noteId } });
    await deleteNoteFile(id, noteId);

    return Response.json({ data: { id: noteId } });
  } catch (error) {
    console.error("DELETE /api/worlds/[id]/notes/[noteId]", error);
    const message = "Nao foi possivel remover a nota.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}