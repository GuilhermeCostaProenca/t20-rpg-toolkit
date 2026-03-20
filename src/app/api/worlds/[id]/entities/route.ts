import { prisma } from "@/lib/prisma";
import { buildEntityWhere, ENTITY_INCLUDE } from "@/lib/codex";
import { EntityCreateSchema } from "@/lib/validators";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

type Context = { params: { id: string } | Promise<{ id: string }> };

function missingId() {
  const message = "Parametro worldId obrigatorio.";
  return Response.json({ error: message, message }, { status: 400 });
}

export async function GET(req: Request, { params }: Context) {
  let id = "";
  try {
    ({ id } = await Promise.resolve(params));
    if (!id) return missingId();

    const { searchParams } = new URL(req.url);
    const where = buildEntityWhere(id, searchParams);
    const limit = Math.min(Number(searchParams.get("limit") || "48"), 200);
    const tag = (searchParams.get("tag") || "").trim().toLowerCase();

    const entities = await prisma.entity.findMany({
      where,
      include: ENTITY_INCLUDE,
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      take: limit,
    });

    const filtered = tag
      ? entities.filter((entity) =>
          Array.isArray(entity.tags)
            ? entity.tags.some((item) => String(item).toLowerCase() === tag)
            : false
        )
      : entities;

    return Response.json({ data: filtered });
  } catch (error) {
    console.error("GET /api/worlds/[id]/entities", error);
    const message = "Nao foi possivel listar entidades do mundo.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Context) {
  let id = "";
  try {
    ({ id } = await Promise.resolve(params));
    if (!id) return missingId();

    const payload = await req.json();
    const parsed = EntityCreateSchema.parse(payload);

    const created = await prisma.entity.create({
      data: {
        worldId: id,
        campaignId: parsed.campaignId,
        name: parsed.name,
        slug: parsed.slug,
        type: parsed.type,
        subtype: parsed.subtype,
        summary: parsed.summary,
        description: parsed.description,
        status: parsed.status ?? "active",
        visibility: parsed.visibility ?? "MASTER",
        tags: parsed.tags as Prisma.InputJsonValue | undefined,
        metadata: parsed.metadata as Prisma.InputJsonValue | undefined,
        coverImageUrl: parsed.coverImageUrl,
        portraitImageUrl: parsed.portraitImageUrl,
      },
      include: ENTITY_INCLUDE,
    });

    return Response.json({ data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((issue) => issue.message).join(", ");
      return Response.json({ error: message, message }, { status: 400 });
    }
    console.error("POST /api/worlds/[id]/entities", error);
    const message = "Nao foi possivel criar a entidade.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}
