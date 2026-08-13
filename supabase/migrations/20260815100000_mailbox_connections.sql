create table if not exists public.mailbox_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('google')),
  email text,
  encrypted_refresh_token text not null,
  status text not null default 'active' check (status in ('active','reauthorize','disconnected')),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, provider)
);
create table if not exists public.mailbox_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  external_id text not null,
  sender text not null default '',
  subject text not null default '',
  received_at timestamptz,
  category text not null check (category in ('application','interview','assessment','offer','rejection','job_alert','other')),
  confidence integer not null default 0 check (confidence between 0 and 100),
  action_status text not null default 'review' check (action_status in ('review','approved','ignored')),
  created_at timestamptz not null default now(),
  unique (user_id, provider, external_id)
);
alter table public.mailbox_connections enable row level security;
alter table public.mailbox_events enable row level security;
drop policy if exists "Users manage mailbox connections" on public.mailbox_connections;
create policy "Users manage mailbox connections" on public.mailbox_connections for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users manage mailbox events" on public.mailbox_events;
create policy "Users manage mailbox events" on public.mailbox_events for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.mailbox_connections, public.mailbox_events to authenticated;
