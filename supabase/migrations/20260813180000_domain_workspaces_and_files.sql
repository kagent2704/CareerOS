alter table public.workspace_items
  drop constraint if exists workspace_items_kind_check;

alter table public.workspace_items
  add constraint workspace_items_kind_check
  check (kind in ('job', 'company', 'interview', 'contact', 'resume', 'document', 'task', 'offer', 'preparation', 'preference'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resumes', 'resumes', false, 10485760, array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can read their resume files" on storage.objects;
create policy "Users can read their resume files" on storage.objects for select to authenticated
using (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Users can upload their resume files" on storage.objects;
create policy "Users can upload their resume files" on storage.objects for insert to authenticated
with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Users can delete their resume files" on storage.objects;
create policy "Users can delete their resume files" on storage.objects for delete to authenticated
using (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid())::text);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'career-files',
  'career-files',
  false,
  15728640,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/png',
    'image/jpeg'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can read their career files" on storage.objects;
create policy "Users can read their career files" on storage.objects
  for select to authenticated
  using (bucket_id = 'career-files' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users can upload their career files" on storage.objects;
create policy "Users can upload their career files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'career-files' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users can delete their career files" on storage.objects;
create policy "Users can delete their career files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'career-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
