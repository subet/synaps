-- Deleting an auth user (account deletion, pruning old anonymous users) failed
-- because profiles.id → auth.users had no ON DELETE CASCADE. Every table that
-- hangs off profiles/auth.users (weekly_stats, friend_requests, friendships,
-- blocks, push_tokens) already cascades, so this makes a user delete complete.
-- Applied to the Synaps project on 2026-09-28.
alter table public.profiles
  drop constraint profiles_id_fkey,
  add constraint profiles_id_fkey
    foreign key (id) references auth.users (id) on delete cascade;
