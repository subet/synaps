-- ============================================================
-- Friends System Migration
-- Adds: invite_code on profiles, score columns on weekly_stats,
--       friend_requests, friendships, blocks tables,
--       lookup_invite_code RPC, friend_privacy setting
-- ============================================================

-- ── 1. Extend profiles ───────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS invite_code    TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS friend_privacy TEXT NOT NULL DEFAULT 'invite_only'
    CHECK (friend_privacy IN ('everyone', 'invite_only', 'nobody'));

-- Auto-generate invite code for existing users
UPDATE profiles
  SET invite_code = upper(substr(md5(random()::text), 1, 8))
  WHERE invite_code IS NULL;

-- Function: generate invite code on new profile creation
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := upper(substr(md5(random()::text || NEW.id::text), 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_invite_code_trigger ON profiles;
CREATE TRIGGER profiles_invite_code_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_invite_code();

-- ── 2. Extend weekly_stats ───────────────────────────────────

ALTER TABLE weekly_stats
  ADD COLUMN IF NOT EXISTS friend_score  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cards_correct INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS study_days    INTEGER NOT NULL DEFAULT 0;

-- ── 3. friend_requests ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS friend_requests (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status        TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'declined')),
  via_code      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_user_id, to_user_id)
);

CREATE INDEX IF NOT EXISTS idx_friend_requests_to ON friend_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_from ON friend_requests(from_user_id);

ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "friend_requests_own" ON friend_requests;
CREATE POLICY "friend_requests_own" ON friend_requests
  FOR ALL USING (
    auth.uid() = from_user_id OR auth.uid() = to_user_id
  );

-- ── 4. friendships ───────────────────────────────────────────
-- user_a < user_b enforced to keep the relationship canonical
-- (one row per pair, no duplicates)

CREATE TABLE IF NOT EXISTS friendships (
  user_a      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_a, user_b),
  CONSTRAINT canonical_order CHECK (user_a < user_b)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user_b ON friendships(user_b);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "friendships_own" ON friendships;
CREATE POLICY "friendships_own" ON friendships
  FOR ALL USING (
    auth.uid() = user_a OR auth.uid() = user_b
  );

-- ── 5. blocks ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS blocks (
  blocker_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks(blocked_id);

ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blocks_own" ON blocks;
CREATE POLICY "blocks_own" ON blocks
  FOR ALL USING (auth.uid() = blocker_id);

-- ── 6. RPC: lookup_invite_code ───────────────────────────────
-- SECURITY DEFINER so caller does not need direct SELECT on
-- profiles.invite_code (which is otherwise hidden by RLS).

CREATE OR REPLACE FUNCTION lookup_invite_code(p_code TEXT)
RETURNS TABLE(user_id UUID, display_name TEXT, avatar_url TEXT)
SECURITY DEFINER
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
    SELECT p.id, p.display_name, p.avatar_url
    FROM profiles p
    WHERE p.invite_code = upper(trim(p_code))
    LIMIT 1;
END;
$$;

-- ── 7. RPC: get_friend_ids ───────────────────────────────────
-- Returns all accepted friend UUIDs for a given user.
-- Queries both columns since we store canonical (smaller, larger).

CREATE OR REPLACE FUNCTION get_friend_ids(p_user_id UUID)
RETURNS TABLE(friend_id UUID)
SECURITY DEFINER
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
    SELECT user_b AS friend_id FROM friendships WHERE user_a = p_user_id
    UNION
    SELECT user_a AS friend_id FROM friendships WHERE user_b = p_user_id;
END;
$$;
