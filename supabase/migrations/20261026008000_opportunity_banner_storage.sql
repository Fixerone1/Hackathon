insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'opportunity-banners',
  'opportunity-banners',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can view opportunity banners" on storage.objects;
create policy "Anyone can view opportunity banners"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'opportunity-banners');

drop policy if exists "Admins can upload opportunity banners" on storage.objects;
create policy "Admins can upload opportunity banners"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'opportunity-banners'
    and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

drop policy if exists "Admins can update opportunity banners" on storage.objects;
create policy "Admins can update opportunity banners"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'opportunity-banners'
    and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    bucket_id = 'opportunity-banners'
    and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

drop policy if exists "Admins can delete opportunity banners" on storage.objects;
create policy "Admins can delete opportunity banners"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'opportunity-banners'
    and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
