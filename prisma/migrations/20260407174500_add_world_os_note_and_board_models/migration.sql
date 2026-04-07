-- CreateEnum
CREATE TYPE "NoteLinkSyntaxType" AS ENUM ('wikilink', 'mention_entity', 'mention_note');

-- CreateEnum
CREATE TYPE "NoteLinkStatus" AS ENUM ('resolved', 'unresolved');

-- CreateEnum
CREATE TYPE "BoardNodeType" AS ENUM ('entity', 'note');

-- CreateTable
CREATE TABLE "NoteDocument" (
  "id" TEXT NOT NULL,
  "worldId" TEXT NOT NULL,
  "title" VARCHAR(180) NOT NULL,
  "slug" VARCHAR(180) NOT NULL,
  "contentMd" TEXT NOT NULL,
  "filePath" VARCHAR(500) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "NoteDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteLink" (
  "id" TEXT NOT NULL,
  "worldId" TEXT NOT NULL,
  "fromNoteId" TEXT NOT NULL,
  "syntaxType" "NoteLinkSyntaxType" NOT NULL,
  "rawRef" VARCHAR(220) NOT NULL,
  "toEntityId" TEXT,
  "toNoteId" TEXT,
  "status" "NoteLinkStatus" NOT NULL DEFAULT 'unresolved',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "NoteLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardDocument" (
  "id" TEXT NOT NULL,
  "worldId" TEXT NOT NULL,
  "name" VARCHAR(180) NOT NULL,
  "viewportJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BoardDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardNode" (
  "id" TEXT NOT NULL,
  "boardId" TEXT NOT NULL,
  "worldId" TEXT NOT NULL,
  "nodeType" "BoardNodeType" NOT NULL,
  "refId" TEXT NOT NULL,
  "x" DOUBLE PRECISION NOT NULL,
  "y" DOUBLE PRECISION NOT NULL,
  "w" DOUBLE PRECISION NOT NULL,
  "h" DOUBLE PRECISION NOT NULL,
  "z" INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "BoardNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardEdge" (
  "id" TEXT NOT NULL,
  "boardId" TEXT NOT NULL,
  "worldId" TEXT NOT NULL,
  "sourceNodeId" TEXT NOT NULL,
  "targetNodeId" TEXT NOT NULL,
  "label" VARCHAR(180),

  CONSTRAINT "BoardEdge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NoteDocument_worldId_slug_key" ON "NoteDocument"("worldId", "slug");
CREATE INDEX "NoteDocument_worldId_updatedAt_idx" ON "NoteDocument"("worldId", "updatedAt");

CREATE INDEX "NoteLink_worldId_fromNoteId_idx" ON "NoteLink"("worldId", "fromNoteId");
CREATE INDEX "NoteLink_worldId_toEntityId_idx" ON "NoteLink"("worldId", "toEntityId");
CREATE INDEX "NoteLink_worldId_toNoteId_idx" ON "NoteLink"("worldId", "toNoteId");
CREATE INDEX "NoteLink_worldId_status_idx" ON "NoteLink"("worldId", "status");
CREATE UNIQUE INDEX "NoteLink_worldId_fromNoteId_syntaxType_rawRef_key" ON "NoteLink"("worldId", "fromNoteId", "syntaxType", "rawRef");

CREATE INDEX "BoardDocument_worldId_updatedAt_idx" ON "BoardDocument"("worldId", "updatedAt");
CREATE INDEX "BoardNode_boardId_z_idx" ON "BoardNode"("boardId", "z");
CREATE INDEX "BoardNode_worldId_refId_idx" ON "BoardNode"("worldId", "refId");
CREATE INDEX "BoardEdge_boardId_idx" ON "BoardEdge"("boardId");
CREATE INDEX "BoardEdge_worldId_idx" ON "BoardEdge"("worldId");

-- AddForeignKey
ALTER TABLE "NoteDocument"
  ADD CONSTRAINT "NoteDocument_worldId_fkey"
  FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NoteLink"
  ADD CONSTRAINT "NoteLink_worldId_fkey"
  FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NoteLink"
  ADD CONSTRAINT "NoteLink_fromNoteId_fkey"
  FOREIGN KEY ("fromNoteId") REFERENCES "NoteDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NoteLink"
  ADD CONSTRAINT "NoteLink_toEntityId_fkey"
  FOREIGN KEY ("toEntityId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "NoteLink"
  ADD CONSTRAINT "NoteLink_toNoteId_fkey"
  FOREIGN KEY ("toNoteId") REFERENCES "NoteDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BoardDocument"
  ADD CONSTRAINT "BoardDocument_worldId_fkey"
  FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BoardNode"
  ADD CONSTRAINT "BoardNode_boardId_fkey"
  FOREIGN KEY ("boardId") REFERENCES "BoardDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BoardNode"
  ADD CONSTRAINT "BoardNode_worldId_fkey"
  FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BoardEdge"
  ADD CONSTRAINT "BoardEdge_boardId_fkey"
  FOREIGN KEY ("boardId") REFERENCES "BoardDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BoardEdge"
  ADD CONSTRAINT "BoardEdge_worldId_fkey"
  FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BoardEdge"
  ADD CONSTRAINT "BoardEdge_sourceNodeId_fkey"
  FOREIGN KEY ("sourceNodeId") REFERENCES "BoardNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BoardEdge"
  ADD CONSTRAINT "BoardEdge_targetNodeId_fkey"
  FOREIGN KEY ("targetNodeId") REFERENCES "BoardNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;