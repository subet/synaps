-- Add explicit FK constraints from friend_requests to profiles
-- so PostgREST can resolve the join relationship.
-- (The existing FKs point to auth.users; PostgREST needs one to public.profiles.)

ALTER TABLE friend_requests
  ADD CONSTRAINT friend_requests_from_profile_fkey
    FOREIGN KEY (from_user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT friend_requests_to_profile_fkey
    FOREIGN KEY (to_user_id)   REFERENCES profiles(id) ON DELETE CASCADE;
