import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();
        const tokenId = typeof body.id === "string" && body.id.trim().length > 0 ? body.id : null;

        if (typeof body.x !== "number" || typeof body.y !== "number") {
            return Response.json({ error: "Missing x/y coordinates" }, { status: 400 });
        }

        const payload = {
            x: body.x,
            y: body.y,
            scale: typeof body.scale === "number" ? body.scale : 1,
            rotation: typeof body.rotation === "number" ? body.rotation : 0,
            type: body.type || "character",
            label: body.label,
            imageUrl: body.imageUrl,
            referenceId: body.referenceId,
            status: body.status || "active",
        };

        if (!tokenId) {
            const token = await prisma.mapToken.create({
                data: {
                    campaignId: id,
                    ...payload,
                },
            });
            return Response.json({ data: token });
        }

        const existing = await prisma.mapToken.findFirst({
            where: { id: tokenId, campaignId: id },
            select: { id: true },
        });
        if (!existing) {
            return Response.json({ error: "Token not found" }, { status: 404 });
        }

        const token = await prisma.mapToken.update({
            where: { id: tokenId },
            data: {
                ...payload,
                campaignId: id,
            },
        });

        return Response.json({ data: token });
    } catch (error) {
        console.error("POST /api/campaigns/[id]/map/token", error);
        return Response.json({ error: "Failed to save token" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: campaignId } = await params;
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return Response.json({ error: "ID required" }, { status: 400 });

        const result = await prisma.mapToken.deleteMany({
            where: { id, campaignId }
        });
        if (result.count === 0) {
            return Response.json({ error: "Token not found" }, { status: 404 });
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/campaigns/[id]/map/token", error);
        return Response.json({ error: "Failed to delete" }, { status: 500 });
    }
}
