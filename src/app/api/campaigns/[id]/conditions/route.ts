import { prisma } from "@/lib/prisma";

type Context = { params: { id: string } | Promise<{ id: string }> };

function missingId() {
  const message = "Parametro id obrigatorio.";
  return Response.json({ error: message, message }, { status: 400 });
}

export async function GET(req: Request, { params }: Context) {
  let id = "";
  try {
    ({ id } = await Promise.resolve(params));
    if (!id) return missingId();

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { id: true, rulesetId: true },
    });
    if (!campaign) {
      const message = "Campanha nao encontrada.";
      return Response.json({ error: message, message }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const term = (searchParams.get("q") || "").trim();

    const conditions = await prisma.condition.findMany({
      where: {
        rulesetId: campaign.rulesetId || "tormenta20",
        ...(term
          ? {
              OR: [
                { key: { contains: term, mode: "insensitive" } },
                { name: { contains: term, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ name: "asc" }],
      take: 80,
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
      },
    });

    return Response.json({ data: conditions });
  } catch (error) {
    console.error("GET /api/campaigns/[id]/conditions", error);
    const message = "Nao foi possivel listar condicoes.";
    return Response.json({ error: message, message }, { status: 500 });
  }
}
