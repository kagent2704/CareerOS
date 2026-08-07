create extension if not exists pgcrypto;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null check (char_length(company) between 1 and 120),
  role text not null check (char_length(role) between 1 and 160),
  location text not null default '',
  stage text not null default 'Saved' check (stage in ('Saved', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected')),
  match_score integer not null default 0 check (match_score between 0 and 100),
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_user_created_idx
  on public.applications (user_id, created_at desc);

alter table public.applications enable row level security;

drop policy if exists "Users can read their applications" on public.applications;
create policy "Users can read their applications"
  on public.applications for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their applications" on public.applications;
create policy "Users can create their applications"
  on public.applications for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their applications" on public.applications;
create policy "Users can update their applications"
  on public.applications for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their applications" on public.applications;
create policy "Users can delete their applications"
  on public.applications for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

insert into public.applications (user_id, company, role, location, stage, match_score, deadline)
select u.id, seed.company, seed.role, seed.location, seed.stage, seed.match_score, seed.deadline
from auth.users u
cross join (values
  ('Razorpay', 'Backend Engineer', 'Bengaluru · Hybrid', 'Interview', 94, date '2026-08-12'),
  ('Atlassian', 'Graduate Software Engineer', 'Bengaluru · Remote', 'Applied', 91, date '2026-08-06'),
  ('Zepto', 'Data Engineer', 'Mumbai · On-site', 'OA', 88, date '2026-08-09'),
  ('CRED', 'Software Engineer I', 'Bengaluru · Hybrid', 'Saved', 84, date '2026-08-15')
) as seed(company, role, location, stage, match_score, deadline)
where lower(u.email) = 'kashmirasanjaypatil@gmail.com'
  and not exists (
    select 1 from public.applications a
    where a.user_id = u.id and a.company = seed.company and a.role = seed.role
  );
