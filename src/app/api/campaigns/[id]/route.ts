import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { world: { select: { id: true, title: true } } },
    });

    if (!campaign) {
      const message = "Campanha nao encontrada.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    const recentMemoryEvents = await prisma.worldEvent.findMany({
      where: {
        campaignId: id,
        meta: {
          path: ["memorySource"],
          equals: "session-closeout",
        },
      },
      orderBy: { ts: "desc" },
      take: 8,
    });

    return Response.json({ data: { ...campaign, recentMemoryEvents } });
  } catch (error) {
    console.error("GET /api/campaigns/[id]", error);
    const message = "Nao foi possivel carregar a campanha.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  try {
    // Soft Delete (Archive)
    await prisma.campaign.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/campaigns/[id]", error);
    const message = "Nao foi possivel arquivar a campanha.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}
