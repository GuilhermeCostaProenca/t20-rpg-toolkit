import type { NoteDocument, NoteLinkStatus, NoteLinkSyntaxType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { parseNoteLinks, type ParsedLink } from "@/lib/world-os/note-links";
import { slugify } from "@/lib/world-os/slug";

type ResolvedRef = {
  status: NoteLinkStatus;
  toEntityId?: string;
  toNoteId?: string;
};

async function resolveLink(worldId: string, link: ParsedLink, currentNoteId?: string): Promise<ResolvedRef> {
  const raw = link.rawRef.trim();
  const slug = slugify(raw);

  if (link.syntaxType === "mention_entity") {
    const entity = await prisma.entity.findFirst({
      where: { worldId, slug: raw.toLowerCase() },
      select: { id: true },
    });

    if (!entity) {
      return { status: "unresolved" };
    }

    return { status: "resolved", toEntityId: entity.id };
  }

  const note = await prisma.noteDocument.findFirst({
    where: {
      worldId,
      id: currentNoteId ? { not: currentNoteId } : undefined,
      OR: [{ slug }, { slug: raw.toLowerCase() }],
    },
    select: { id: true },
  });

  if (!note) {
    return { status: "unresolved" };
  }

  return { status: "resolved", toNoteId: note.id };
}

export async function syncNoteLinks(worldId: string, noteId: string, contentMd: string): Promise<void> {
  const parsed = parseNoteLinks(contentMd);
  const keys = new Set(parsed.map((link) => `${link.syntaxType}:${link.rawRef.toLowerCase()}`));

  await prisma.$transaction(async (tx) => {
    const existing = await tx.noteLink.findMany({
      where: { worldId, fromNoteId: noteId },
      select: { id: true, syntaxType: true, rawRef: true },
    });

    for (const link of parsed) {
      const resolved = await resolveLink(worldId, link, noteId);
      await tx.noteLink.upsert({
        where: {
          worldId_fromNoteId_syntaxType_rawRef: {
            worldId,
            fromNoteId: noteId,
            syntaxType: link.syntaxType,
            rawRef: link.rawRef,
          },
        },
        update: {
          status: resolved.status,
          toEntityId: resolved.toEntityId,
          toNoteId: resolved.toNoteId,
        },
        create: {
          worldId,
          fromNoteId: noteId,
          syntaxType: link.syntaxType,
          rawRef: link.rawRef,
          status: resolved.status,
          toEntityId: resolved.toEntityId,
          toNoteId: resolved.toNoteId,
        },
      });
    }

    const staleIds = existing
      .filter((item) => !keys.has(`${item.syntaxType}:${item.rawRef.toLowerCase()}`))
      .map((item) => item.id);

    if (staleIds.length > 0) {
      await tx.noteLink.deleteMany({ where: { id: { in: staleIds } } });
    }

    await rehydrateUnresolvedLinks(worldId, tx);
  });
}

export async function rehydrateUnresolvedLinks(
  worldId: string,
  tx: Prisma.TransactionClient = prisma
): Promise<void> {
  const unresolved = await tx.noteLink.findMany({
    where: { worldId, status: "unresolved" },
    select: { id: true, rawRef: true, syntaxType: true, fromNoteId: true },
  });

  for (const link of unresolved) {
    const resolved = await resolveLink(worldId, {
      rawRef: link.rawRef,
      syntaxType: link.syntaxType as NoteLinkSyntaxType,
    }, link.fromNoteId);

    if (resolved.status === "resolved") {
      await tx.noteLink.update({
        where: { id: link.id },
        data: {
          status: "resolved",
          toEntityId: resolved.toEntityId,
          toNoteId: resolved.toNoteId,
        },
      });
    }
  }
}

export function buildNoteSlug(title: string): string {
  const base = slugify(title);
  return base || `nota-${Date.now().toString(36)}`;
}

export type NoteDocumentWithLinks = NoteDocument & {
  outgoingLinks: {
    id: string;
    syntaxType: NoteLinkSyntaxType;
    rawRef: string;
    status: NoteLinkStatus;
    toEntityId: string | null;
    toNoteId: string | null;
  }[];
};