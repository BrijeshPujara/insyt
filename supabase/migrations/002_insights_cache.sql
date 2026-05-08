-- ─────────────────────────────────────────────
--  Migration 002: Add data_hash to ai_insights
--  Enables cache invalidation when financial data changes
-- ─────────────────────────────────────────────

ALTER TABLE ai_insights ADD COLUMN IF NOT EXISTS data_hash TEXT;

-- Index for fast cache lookup: find recent insights for a user with a given hash
CREATE INDEX IF NOT EXISTS idx_insights_cache
  ON ai_insights (user_id, data_hash, generated_at DESC);

-- rollback:
-- DROP INDEX IF EXISTS idx_insights_cache;
-- ALTER TABLE ai_insights DROP COLUMN IF EXISTS data_hash;
