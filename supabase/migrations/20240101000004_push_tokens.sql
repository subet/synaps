-- Push notification tokens (Expo Push Tokens)
create table if not exists public.push_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  token text not null,
  platform text not null check (platform in ('ios', 'android')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (user_id, token)
);

-- Index for quick lookup when broadcasting
create index if not exists idx_push_tokens_token on public.push_tokens(token);
create index if not exists idx_push_tokens_user_id on public.push_tokens(user_id);

-- RLS: users can only manage their own tokens
alter table public.push_tokens enable row level security;

create policy "Users can read own tokens"
  on public.push_tokens for select
  using (auth.uid() = user_id);

create policy "Users can insert own tokens"
  on public.push_tokens for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tokens"
  on public.push_tokens for update
  using (auth.uid() = user_id);

create policy "Users can delete own tokens"
  on public.push_tokens for delete
  using (auth.uid() = user_id);

-- Service role can read all tokens (for the edge function broadcast)
-- No policy needed — service_role bypasses RLS by default.
