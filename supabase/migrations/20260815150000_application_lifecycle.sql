alter table public.applications
  add column if not exists source_url text,
  add column if not exists resume_item_id uuid references public.workspace_items(id) on delete set null,
  add column if not exists salary text not null default '',
  add column if not exists referral text not null default '',
  add column if not exists recruiter text not null default '',
  add column if not exists cover_letter text not null default '',
  add column if not exists notes text not null default '',
  add column if not exists timeline jsonb not null default '[]'::jsonb;

update public.applications
set timeline = jsonb_build_array(jsonb_build_object('stage', stage, 'at', created_at, 'note', 'Application added'))
where timeline = '[]'::jsonb;

create or replace function public.append_application_stage_event()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if old.stage is distinct from new.stage then
    new.timeline = coalesce(old.timeline, '[]'::jsonb) || jsonb_build_array(
      jsonb_build_object('stage', new.stage, 'at', now(), 'note', 'Stage changed')
    );
  end if;
  return new;
end;
$$;

drop trigger if exists applications_append_stage_event on public.applications;
create trigger applications_append_stage_event before update on public.applications
for each row execute function public.append_application_stage_event();
