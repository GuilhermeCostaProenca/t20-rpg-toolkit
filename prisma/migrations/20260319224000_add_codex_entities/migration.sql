-- CreateTable
CREATE TABLE "Entity" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "campaignId" TEXT,
    "name" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(180),
    "type" VARCHAR(40) NOT NULL,
    "subtype" VARCHAR(60),
    "summary" VARCHAR(220),
    "description" VARCHAR(4000),
    "status" VARCHAR(30) NOT NULL DEFAULT 'active',
    "visibility" VARCHAR(20) NOT NULL DEFAULT 'MASTER',
    "tags" JSONB,
    "metadata" JSONB,
    "coverImageUrl" VARCHAR(500),
    "portraitImageUrl" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityRelationship" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "fromEntityId" TEXT NOT NULL,
    "toEntityId" TEXT NOT NULL,
    "type" VARCHAR(60) NOT NULL,
    "directionality" VARCHAR(20) NOT NULL DEFAULT 'DIRECTED',
    "weight" INTEGER,
    "notes" VARCHAR(1000),
    "visibility" VARCHAR(20) NOT NULL DEFAULT 'MASTER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntityRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityImage" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "kind" VARCHAR(30) NOT NULL DEFAULT 'reference',
    "caption" VARCHAR(240),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntityImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Entity_worldId_updatedAt_idx" ON "Entity"("worldId", "updatedAt");
CREATE INDEX "Entity_worldId_type_idx" ON "Entity"("worldId", "type");
CREATE INDEX "Entity_worldId_status_idx" ON "Entity"("worldId", "status");
CREATE INDEX "Entity_campaignId_idx" ON "Entity"("campaignId");
CREATE UNIQUE INDEX "Entity_worldId_slug_key" ON "Entity"("worldId", "slug");

CREATE INDEX "EntityRelationship_worldId_idx" ON "EntityRelationship"("worldId");
CREATE INDEX "EntityRelationship_fromEntityId_idx" ON "EntityRelationship"("fromEntityId");
CREATE INDEX "EntityRelationship_toEntityId_idx" ON "EntityRelationship"("toEntityId");

CREATE INDEX "EntityImage_entityId_sortOrder_idx" ON "EntityImage"("entityId", "sortOrder");
CREATE INDEX "EntityImage_worldId_idx" ON "EntityImage"("worldId");

-- AddForeignKey
ALTER TABLE "Entity"
ADD CONSTRAINT "Entity_worldId_fkey"
FOREIGN KEY ("worldId") REFERENCES "World"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Entity"
ADD CONSTRAINT "Entity_campaignId_fkey"
FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EntityRelationship"
ADD CONSTRAINT "EntityRelationship_worldId_fkey"
FOREIGN KEY ("worldId") REFERENCES "World"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EntityRelationship"
ADD CONSTRAINT "EntityRelationship_fromEntityId_fkey"
FOREIGN KEY ("fromEntityId") REFERENCES "Entity"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EntityRelationship"
ADD CONSTRAINT "EntityRelationship_toEntityId_fkey"
FOREIGN KEY ("toEntityId") REFERENCES "Entity"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EntityImage"
ADD CONSTRAINT "EntityImage_entityId_fkey"
FOREIGN KEY ("entityId") REFERENCES "Entity"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EntityImage"
ADD CONSTRAINT "EntityImage_worldId_fkey"
FOREIGN KEY ("worldId") REFERENCES "World"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
