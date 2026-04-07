import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();
        if (typeof body.x !== "number" || typeof body.y !== "number") {
            return Response.json({ error: "Missing x/y coordinates" }, { status: 400 });
        }

        // Create new Pin
        const pin = await prisma.mapPin.create({
            data: {
                campaignId: id,
                x: body.x,
                y: body.y,
                type: body.type || "poi",
                title: body.title || "Novo Marcador",
                description: body.description,
                color: body.color || "#ffffff",
            }
        });

        return Response.json({ data: pin });
    } catch (error) {
        console.error("POST /api/campaigns/[id]/map/pin", error);
        return Response.json({ error: "Failed to create pin" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: campaignId } = await params;
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return Response.json({ error: "ID required" }, { status: 400 });

        const result = await prisma.mapPin.deleteMany({
            where: { id, campaignId }
        });
        if (result.count === 0) {
            return Response.json({ error: "Pin not found" }, { status: 404 });
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/campaigns/[id]/map/pin", error);
        return Response.json({ error: "Failed to delete pin" }, { status: 500 });
    }
}
