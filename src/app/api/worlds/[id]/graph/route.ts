import { prisma } from "@/lib/prisma";
import { buildEntityWhere, ENTITY_INCLUDE } from "@/lib/codex";

type Context = { params: { id: string } | Promise<{ id: string }> };

export async function GET(req: Request, { params }: Context) {
  const { id } = await Promise.resolve(params);

  try {
    const { searchParams } = new URL(req.url);
    const where = buildEntityWhere(id, searchParams);
    const tag = (searchParams.get("tag") || "").trim().toLowerCase();
    const relationType = (searchParams.get("relationType") || "").trim().toLowerCase();
    const limit = Math.min(Number(searchParams.get("limit") || "120"), 240);

    const [world, entities] = await Promise.all([
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
        take: limit,
      }),
    ]);

    if (!world) {
      const message = "Mundo nao encontrado.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    const filteredEntities = tag
      ? entities.filter((entity) =>
          Array.isArray(entity.tags)
            ? entity.tags.some((item) => String(item).toLowerCase() === tag)
            : false
        )
      : entities;

    const nodeSet = new Set(filteredEntities.map((entity) => entity.id));
    const edgeMap = new Map<
      string,
      {
        id: string;
        fromEntityId: string;
        toEntityId: string;
        type: string;
        weight?: number | null;
        notes?: string | null;
        visibility: string;
        metadata?: Record<string, unknown> | null;
      }
    >();

    for (const entity of filteredEntities) {
      for (const relation of entity.outgoingRelations) {
        if (!nodeSet.has(relation.toEntityId)) continue;
        if (relationType && relation.type.toLowerCase() !== relationType) continue;
        edgeMap.set(relation.id, {
          id: relation.id,
          fromEntityId: relation.fromEntityId,
          toEntityId: relation.toEntityId,
          type: relation.type,
          weight: relation.weight,
          notes: relation.notes,
          visibility: relation.visibility,
          metadata:
            relation.metadata && typeof relation.metadata === "object"
              ? (relation.metadata as Record<string, unknown>)
              : null,
        });
      }
    }

    const edges = Array.from(edgeMap.values());
    const relationCounts = edges.reduce<Record<string, number>>((acc, edge) => {
      acc[edge.fromEntityId] = (acc[edge.fromEntityId] ?? 0) + 1;
      acc[edge.toEntityId] = (acc[edge.toEntityId] ?? 0) + 1;
      return acc;
    }, {});

    const nodes = filteredEntities.map((entity) => ({
      id: entity.id,
      name: entity.name,
      type: entity.type,
      status: entity.status,
      summary: entity.summary,
      campaignId: entity.campaignId,
      campaignName: entity.campaign?.name ?? null,
      portraitImageUrl: entity.portraitImageUrl ?? entity.coverImageUrl ?? null,
      tags: Array.isArray(entity.tags) ? entity.tags : [],
      relationCount: relationCounts[entity.id] ?? 0,
    }));

    const relationTypes = Array.from(new Set(edges.map((edge) => edge.type))).sort((a, b) =>
      a.localeCompare(b)
    );

    return Response.json({
      data: {
        world,
        stats: {
          nodes: nodes.length,
          edges: edges.length,
        },
        nodes,
        edges,
        relationTypes,
      },
    });
  } catch (error) {
    console.error("GET /api/worlds/[id]/graph", error);
    const message = "Nao foi possivel carregar o grafo narrativo do mundo.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}
