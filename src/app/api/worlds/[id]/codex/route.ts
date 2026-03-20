import { prisma } from "@/lib/prisma";
import { buildEntityWhere, ENTITY_INCLUDE } from "@/lib/codex";

type Context = { params: { id: string } | Promise<{ id: string }> };

export async function GET(req: Request, { params }: Context) {
  const { id } = await Promise.resolve(params);
  try {
    const { searchParams } = new URL(req.url);
    const where = buildEntityWhere(id, searchParams);
    const tag = (searchParams.get("tag") || "").trim().toLowerCase();

    const [world, entities, relationshipCount] = await Promise.all([
      prisma.world.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          campaigns: {
            select: { id: true, name: true },
            orderBy: { updatedAt: "desc" },
          },
        },
      }),
      prisma.entity.findMany({
        where,
        include: ENTITY_INCLUDE,
        orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
        take: 80,
      }),
      prisma.entityRelationship.count({
        where: { worldId: id },
      }),
    ]);

    if (!world) {
      const message = "Mundo nao encontrado.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    const filtered = tag
      ? entities.filter((entity) =>
          Array.isArray(entity.tags)
            ? entity.tags.some((item) => String(item).toLowerCase() === tag)
            : false
        )
      : entities;

    const stats = filtered.reduce<Record<string, number>>((acc, entity) => {
      acc.total = (acc.total ?? 0) + 1;
      acc[entity.type] = (acc[entity.type] ?? 0) + 1;
      return acc;
    }, {});

    return Response.json({
      data: {
        world,
        stats: {
          ...stats,
          relationships: relationshipCount,
        },
        entities: filtered,
      },
    });
  } catch (error) {
    console.error("GET /api/worlds/[id]/codex", error);
    const message = "Nao foi possivel carregar o Codex do mundo.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}
