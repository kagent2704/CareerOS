create table if not exists public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_item_id uuid references public.workspace_items(id) on delete set null,
  analysis_type text not null check (analysis_type in ('resume_profile', 'jd_match')),
  title text not null,
  source_text text,
  result jsonb not null,
  model text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_analyses_user_created_idx
  on public.ai_analyses (user_id, created_at desc);

alter table public.ai_analyses enable row level security;

drop policy if exists "Users can read their AI analyses" on public.ai_analyses;
create policy "Users can read their AI analyses" on public.ai_analyses
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their AI analyses" on public.ai_analyses;
create policy "Users can create their AI analyses" on public.ai_analyses
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their AI analyses" on public.ai_analyses;
create policy "Users can delete their AI analyses" on public.ai_analyses
  for delete to authenticated using ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, insert, delete on table public.ai_analyses to authenticated;
