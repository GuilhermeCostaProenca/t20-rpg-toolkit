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

    const [world, entities, semanticLinks] = await Promise.all([
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
      prisma.noteLink.findMany({
        where: {
          worldId: id,
          status: "resolved",
          OR: [{ toEntityId: { not: null } }, { toNoteId: { not: null } }],
        },
        include: {
          fromNote: {
            select: { id: true, title: true, slug: true },
          },
          toNote: {
            select: { id: true, title: true, slug: true },
          },
          toEntity: {
            select: { id: true, name: true, type: true },
          },
        },
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

    const relationCounts: Record<string, number> = {};

    const nodes = filteredEntities.map((entity) => ({
      id: entity.id,
      name: entity.name,
      type: entity.type,
      status: entity.status,
      orderHint:
        entity.metadata &&
        typeof entity.metadata === "object" &&
        typeof (entity.metadata as Record<string, unknown>).genealogy === "object" &&
        (entity.metadata as Record<string, unknown>).genealogy !== null &&
        typeof ((entity.metadata as Record<string, unknown>).genealogy as Record<string, unknown>).order ===
          "number"
          ? (((entity.metadata as Record<string, unknown>).genealogy as Record<string, unknown>).order as number)
          : null,
      metadata:
        entity.metadata && typeof entity.metadata === "object"
          ? (entity.metadata as Record<string, unknown>)
          : null,
      summary: entity.summary,
      campaignId: entity.campaignId,
      campaignName: entity.campaign?.name ?? null,
      portraitImageUrl: entity.portraitImageUrl ?? entity.coverImageUrl ?? null,
      tags: Array.isArray(entity.tags) ? entity.tags : [],
      relationCount: relationCounts[entity.id] ?? 0,
    }));

    for (const link of semanticLinks) {
      const fromId = `note:${link.fromNote.id}`;
      const toId = link.toEntityId ? link.toEntityId : link.toNoteId ? `note:${link.toNoteId}` : "";
      if (!toId) continue;
      const semanticType = `semantic:${link.syntaxType}`;
      if (relationType && semanticType.toLowerCase() !== relationType) continue;

      const key = `semantic:${fromId}:${toId}:${link.syntaxType}`;
      edgeMap.set(key, {
        id: key,
        fromEntityId: fromId,
        toEntityId: toId,
        type: semanticType,
        weight: 1,
        notes: link.rawRef,
        visibility: "MASTER",
        metadata: { source: "semantic", noteLinkId: link.id },
      });
    }

    const noteNodes = new Map(
      semanticLinks.flatMap((link) => {
        const nodes = [
          {
            id: `note:${link.fromNote.id}`,
            name: link.fromNote.title,
            type: "note",
            status: "active",
            orderHint: null,
            metadata: { slug: link.fromNote.slug, source: "note" },
            summary: null,
            campaignId: null,
            campaignName: null,
            portraitImageUrl: null,
            tags: [],
            relationCount: 0,
          },
        ];
        if (link.toNote) {
          nodes.push({
            id: `note:${link.toNote.id}`,
            name: link.toNote.title,
            type: "note",
            status: "active",
            orderHint: null,
            metadata: { slug: link.toNote.slug, source: "note" },
            summary: null,
            campaignId: null,
            campaignName: null,
            portraitImageUrl: null,
            tags: [],
            relationCount: 0,
          });
        }
        return nodes.map((node) => [node.id, node] as const);
      })
    );

    const allEdges = Array.from(edgeMap.values());
    for (const edge of allEdges) {
      relationCounts[edge.fromEntityId] = (relationCounts[edge.fromEntityId] ?? 0) + 1;
      relationCounts[edge.toEntityId] = (relationCounts[edge.toEntityId] ?? 0) + 1;
    }

    const allNodes = [
      ...nodes.map((node) => ({ ...node, relationCount: relationCounts[node.id] ?? 0 })),
      ...Array.from(noteNodes.values()).map((node) => ({
        ...node,
        relationCount: relationCounts[node.id] ?? 0,
      })),
    ];

    const relationTypes = Array.from(new Set(allEdges.map((edge) => edge.type))).sort((a, b) =>
      a.localeCompare(b)
    );

    return Response.json({
      data: {
        world,
        stats: {
          nodes: allNodes.length,
          edges: allEdges.length,
        },
        nodes: allNodes,
        edges: allEdges,
        relationTypes,
      },
    });
  } catch (error) {
    console.error("GET /api/worlds/[id]/graph", error);
    const message = "Nao foi possivel carregar o grafo narrativo do mundo.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}
