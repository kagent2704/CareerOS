create table if not exists public.workspace_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('job', 'company', 'interview', 'contact', 'resume', 'document', 'task', 'offer', 'preparation')),
  title text not null check (char_length(title) between 1 and 180),
  subtitle text not null default '',
  status text not null default 'Active',
  due_date date,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workspace_items_user_kind_idx
  on public.workspace_items (user_id, kind, created_at desc);

alter table public.workspace_items enable row level security;

drop policy if exists "Users can read their workspace items" on public.workspace_items;
create policy "Users can read their workspace items" on public.workspace_items
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their workspace items" on public.workspace_items;
create policy "Users can create their workspace items" on public.workspace_items
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their workspace items" on public.workspace_items;
create policy "Users can update their workspace items" on public.workspace_items
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their workspace items" on public.workspace_items;
create policy "Users can delete their workspace items" on public.workspace_items
  for delete to authenticated using ((select auth.uid()) = user_id);

drop trigger if exists workspace_items_set_updated_at on public.workspace_items;
create trigger workspace_items_set_updated_at before update on public.workspace_items
for each row execute function public.set_updated_at();

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.workspace_items to authenticated;

-- Keep grants explicit for the original applications table as well.
grant select, insert, update, delete on table public.applications to authenticated;
