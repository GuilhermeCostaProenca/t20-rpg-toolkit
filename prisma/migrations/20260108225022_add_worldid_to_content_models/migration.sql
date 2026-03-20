-- This migration originally attempted to backfill world-scoped foreign keys
-- before the `World` table and `Campaign.worldId` existed on a clean database.
-- The real implementation now lives in the later migration
-- `20260109123000_backfill_worldid_to_content_models`.
DO $$
BEGIN
  RAISE NOTICE 'Deferring worldId backfill until World exists.';
END $$;
