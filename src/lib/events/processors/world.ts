import { Prisma } from "@prisma/client";
import { WorldCreatedPayload } from "../types";

type Tx = Prisma.TransactionClient;
type WorldCreatedEvent = {
    worldId: string;
    payload: WorldCreatedPayload;
};

export async function applyWorldCreated(tx: Tx, event: WorldCreatedEvent) {
    const payload = event.payload as WorldCreatedPayload;

    // Create the World Projection
    // We use the event.worldId as the ID if possible, but the event is created AFTER worldId is generated usually?
    // Wait, dispatchEvent takes worldId. 
    // If we are creating a New World from scratch, we might generate the ID client side or in the route.
    // Ideally, the route generates a CUID, passes it to dispatchEvent as worldId.
    // Then we create the World with that ID.

    await tx.world.upsert({
        where: { id: event.worldId },
        update: {
            title: payload.title,
            description: payload.description,
            coverImage: payload.coverImage,
            metadata: payload.metadata as Prisma.InputJsonValue | undefined,
        },
        create: {
            id: event.worldId,
            title: payload.title,
            description: payload.description,
            coverImage: payload.coverImage,
            metadata: payload.metadata as Prisma.InputJsonValue | undefined,
        },
    });
}
