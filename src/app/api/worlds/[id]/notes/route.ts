import { ZodError } from "zod";

import { prisma } from "@/lib/prisma";
import { NoteCreateSchema } from "@/lib/validators";
import { syncNoteLinks, buildNoteSlug } from "@/lib/world-os/note-service";
import { writeNoteFile } from "@/lib/world-os/note-storage";

type Context = { params: { id: string } | Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Context) {
  const { id } = await Promise.resolve(params);
  try {
    const notes = await prisma.noteDocument.findMany({
      where: { worldId: id },
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
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    });

    return Response.json({ data: notes });
  } catch (error) {
    console.error("GET /api/worlds/[id]/notes", error);
    const message = "Nao foi possivel listar as notas do mundo.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Context) {
  const { id } = await Promise.resolve(params);
  try {
    const payload = await req.json();
    const parsed = NoteCreateSchema.parse(payload);

    const created = await prisma.noteDocument.create({
      data: {
        worldId: id,
        title: parsed.title,
        slug: (parsed.slug || buildNoteSlug(parsed.title)).toLowerCase(),
        contentMd: parsed.contentMd ?? "",
        filePath: "",
      },
    });

    const filePath = await writeNoteFile(id, created.id, parsed.contentMd ?? "");

    const note = await prisma.noteDocument.update({
      where: { id: created.id },
      data: { filePath },
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
        },
      },
    });

    await syncNoteLinks(id, note.id, note.contentMd);

    const hydrated = await prisma.noteDocument.findUnique({
      where: { id: note.id },
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
        },
      },
    });

    return Response.json({ data: hydrated }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((issue) => issue.message).join(", ");
      return Response.json({ error: message, message }, { status: 400 });
    }
    console.error("POST /api/worlds/[id]/notes", error);
    const message = "Nao foi possivel criar a nota.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}