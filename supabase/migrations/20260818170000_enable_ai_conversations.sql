drop policy if exists "Users can update their AI analyses" on public.ai_analyses;
create policy "Users can update their AI analyses" on public.ai_analyses
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant update on table public.ai_analyses to authenticated;
