grant usage on schema public to authenticated;

grant select, insert, update, delete
  on table public.applications
  to authenticated;
