import fs from "node:fs";
import path from "node:path";

import { prisma } from "@/lib/prisma";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

type Context = {
  params: { id: string } | Promise<{ id: string }>;
};

function resolveStoredPath(storageKey: string) {
  return path.join(UPLOAD_DIR, storageKey);
}

export async function PATCH(req: Request, { params }: Context) {
  const { id } = await Promise.resolve(params);

  try {
    const payload = (await req.json()) as {
      title?: string;
      content?: string;
      textIndex?: string | null;
    };

    const existing = await prisma.rulesetDocument.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        filePath: true,
        storageKey: true,
        textIndex: true,
      },
    });

    if (!existing) {
      const message = "Documento nao encontrado.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    const nextTitle = payload.title?.trim();
    if (nextTitle !== undefined && !nextTitle) {
      const message = "Titulo nao pode ficar vazio.";
      return Response.json({ error: message, message }, { status: 400 });
    }

    if (typeof payload.content === "string") {
      const targetPath = resolveStoredPath(existing.storageKey);
      if (!fs.existsSync(targetPath)) {
        const message = "Arquivo do documento nao foi encontrado no storage local.";
        return Response.json({ error: message, message }, { status: 404 });
      }
      fs.writeFileSync(targetPath, payload.content);
    }

    const updated = await prisma.rulesetDocument.update({
      where: { id },
      data: {
        title: nextTitle ?? undefined,
        textIndex: payload.textIndex ?? existing.textIndex,
      },
    });

    return Response.json({ data: updated });
  } catch (error) {
    console.error("PATCH /api/ruleset-docs/[id]", error);
    const message = "Nao foi possivel atualizar o documento.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  const { id } = await Promise.resolve(params);

  try {
    const existing = await prisma.rulesetDocument.findUnique({
      where: { id },
      select: {
        id: true,
        storageKey: true,
      },
    });

    if (!existing) {
      const message = "Documento nao encontrado.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    await prisma.rulesetDocument.delete({ where: { id } });

    const targetPath = resolveStoredPath(existing.storageKey);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }

    return Response.json({ data: { id } });
  } catch (error) {
    console.error("DELETE /api/ruleset-docs/[id]", error);
    const message = "Nao foi possivel remover o documento.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}
