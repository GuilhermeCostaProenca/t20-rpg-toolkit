ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "worldId" TEXT;
ALTER TABLE "Npc" ADD COLUMN IF NOT EXISTS "worldId" TEXT;
ALTER TABLE "RulesetDocument" ADD COLUMN IF NOT EXISTS "worldId" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "worldId" TEXT;
ALTER TABLE "SessionSummary" ADD COLUMN IF NOT EXISTS "worldId" TEXT;

DO $$
DECLARE
    default_world_id TEXT;
    world_count INTEGER;
BEGIN
    IF to_regclass('"World"') IS NULL THEN
        RAISE EXCEPTION 'World table must exist before backfilling worldId columns.';
    END IF;

    SELECT COUNT(*) INTO world_count FROM "World";

    IF world_count = 0 THEN
        default_world_id := 'cl' || substr(md5(random()::text || clock_timestamp()::text), 1, 24);
        INSERT INTO "World" ("id", "title", "description", "status", "createdAt", "updatedAt")
        VALUES (
            default_world_id,
            'Mundo Padrao',
            'Mundo criado automaticamente para migracao de worldId',
            'ACTIVE',
            NOW(),
            NOW()
        );
    ELSE
        SELECT "id" INTO default_world_id FROM "World" ORDER BY "createdAt" ASC LIMIT 1;
    END IF;

    UPDATE "Character" AS ch
    SET "worldId" = c."worldId"
    FROM "Campaign" AS c
    WHERE ch."campaignId" = c."id"
      AND ch."worldId" IS NULL;

    UPDATE "Character"
    SET "worldId" = default_world_id
    WHERE "worldId" IS NULL;

    UPDATE "Npc" AS npc
    SET "worldId" = c."worldId"
    FROM "Campaign" AS c
    WHERE npc."campaignId" = c."id"
      AND npc."worldId" IS NULL;

    UPDATE "Npc"
    SET "worldId" = default_world_id
    WHERE "worldId" IS NULL;

    UPDATE "Session" AS s
    SET "worldId" = c."worldId"
    FROM "Campaign" AS c
    WHERE s."campaignId" = c."id"
      AND s."worldId" IS NULL;

    UPDATE "Session"
    SET "worldId" = default_world_id
    WHERE "worldId" IS NULL;

    UPDATE "SessionSummary" AS ss
    SET "worldId" = c."worldId"
    FROM "Campaign" AS c
    WHERE ss."campaignId" = c."id"
      AND ss."worldId" IS NULL;

    UPDATE "SessionSummary" AS ss
    SET "worldId" = s."worldId"
    FROM "Session" AS s
    WHERE ss."sessionId" = s."id"
      AND ss."worldId" IS NULL;

    UPDATE "SessionSummary"
    SET "worldId" = default_world_id
    WHERE "worldId" IS NULL;

    UPDATE "RulesetDocument"
    SET "worldId" = default_world_id
    WHERE "worldId" IS NULL;
END $$;

ALTER TABLE "Character" ALTER COLUMN "worldId" SET NOT NULL;
ALTER TABLE "Npc" ALTER COLUMN "worldId" SET NOT NULL;
ALTER TABLE "RulesetDocument" ALTER COLUMN "worldId" SET NOT NULL;
ALTER TABLE "Session" ALTER COLUMN "worldId" SET NOT NULL;
ALTER TABLE "SessionSummary" ALTER COLUMN "worldId" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "Character_worldId_idx" ON "Character"("worldId");
CREATE INDEX IF NOT EXISTS "Npc_worldId_idx" ON "Npc"("worldId");
CREATE INDEX IF NOT EXISTS "RulesetDocument_worldId_idx" ON "RulesetDocument"("worldId");
CREATE INDEX IF NOT EXISTS "Session_worldId_idx" ON "Session"("worldId");
CREATE INDEX IF NOT EXISTS "SessionSummary_worldId_idx" ON "SessionSummary"("worldId");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Character_worldId_fkey'
    ) THEN
        ALTER TABLE "Character"
        ADD CONSTRAINT "Character_worldId_fkey"
        FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Npc_worldId_fkey'
    ) THEN
        ALTER TABLE "Npc"
        ADD CONSTRAINT "Npc_worldId_fkey"
        FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'RulesetDocument_worldId_fkey'
    ) THEN
        ALTER TABLE "RulesetDocument"
        ADD CONSTRAINT "RulesetDocument_worldId_fkey"
        FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Session_worldId_fkey'
    ) THEN
        ALTER TABLE "Session"
        ADD CONSTRAINT "Session_worldId_fkey"
        FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'SessionSummary_worldId_fkey'
    ) THEN
        ALTER TABLE "SessionSummary"
        ADD CONSTRAINT "SessionSummary_worldId_fkey"
        FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
