import { Prisma } from "@prisma/client";

export const ENTITY_INCLUDE = {
  campaign: { select: { id: true, name: true } },
  images: {
    orderBy: { sortOrder: "asc" as const },
  },
  outgoingRelations: {
    include: {
      toEntity: {
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          portraitImageUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" as const },
  },
  incomingRelations: {
    include: {
      fromEntity: {
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          portraitImageUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" as const },
  },
} satisfies Prisma.EntityInclude;

export function buildEntityWhere(
  worldId: string,
  searchParams: URLSearchParams
): Prisma.EntityWhereInput {
  const campaignId = searchParams.get("campaignId") || undefined;
  const type = searchParams.get("type") || undefined;
  const status = searchParams.get("status") || undefined;
  const visibility = searchParams.get("visibility") || undefined;
  const term = (searchParams.get("term") || "").trim();

  const where: Prisma.EntityWhereInput = {
    worldId,
  };

  if (campaignId) where.campaignId = campaignId;
  if (type) where.type = type;
  if (status) where.status = status;
  if (visibility) where.visibility = visibility;

  if (term) {
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { summary: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { subtype: { contains: term, mode: "insensitive" } },
    ];
  }

  return where;
}
