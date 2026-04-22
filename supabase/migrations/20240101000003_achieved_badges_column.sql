-- ============================================================
-- Add achieved_badges column to profiles
-- Stores an array of badge IDs synced from the local device
-- so other users can view achievements on the leaderboard.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS achieved_badges JSONB NOT NULL DEFAULT '[]'::jsonb;
