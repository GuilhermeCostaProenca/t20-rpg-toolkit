DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'World'
      AND column_name = 'ownerId'
  ) THEN
    ALTER TABLE "World" ADD COLUMN "ownerId" VARCHAR(120);
  END IF;
END $$;

ALTER TYPE "WorldStatus" ADD VALUE IF NOT EXISTS 'DELETED';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'WorldMemberRole'
  ) THEN
    CREATE TYPE "WorldMemberRole" AS ENUM ('GM', 'PLAYER', 'SPECTATOR');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "WorldMember" (
  "id" TEXT NOT NULL,
  "worldId" TEXT NOT NULL,
  "userId" VARCHAR(120) NOT NULL,
  "role" "WorldMemberRole" NOT NULL DEFAULT 'PLAYER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WorldMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WorldMember_worldId_userId_key" ON "WorldMember"("worldId", "userId");
CREATE INDEX IF NOT EXISTS "WorldMember_userId_idx" ON "WorldMember"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'WorldMember_worldId_fkey'
  ) THEN
    ALTER TABLE "WorldMember"
      ADD CONSTRAINT "WorldMember_worldId_fkey"
      FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
