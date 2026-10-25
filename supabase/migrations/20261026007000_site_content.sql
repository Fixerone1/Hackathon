create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in (
    'announcement',
    'learning_resource',
    'faq',
    'homepage_feature',
    'money_skill',
    'growth_resource',
    'employment_resource'
  )),
  title text not null check (char_length(btrim(title)) between 3 and 160),
  body text not null check (char_length(btrim(body)) between 10 and 8000),
  link_label text,
  link_url text,
  image_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order smallint not null default 0 check (sort_order between -10000 and 10000),
  published_at timestamptz,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_content_link_pair_check check (
    (link_url is null and link_label is null)
    or (
      link_url ~* '^https://[^[:space:]/]+(:[0-9]+)?([/?#].*)?$'
      and link_label is not null
      and char_length(btrim(link_label)) between 2 and 80
    )
  ),
  constraint site_content_image_url_check check (
    image_url is null or image_url ~* '^https://[^[:space:]/]+(:[0-9]+)?([/?#].*)?$'
  ),
  constraint site_content_published_at_check check (
    status <> 'published' or published_at is not null
  )
);

create index if not exists site_content_published_idx
  on public.site_content (content_type, sort_order, published_at desc)
  where status = 'published';

alter table public.site_content enable row level security;

create trigger site_content_updated_at
  before update on public.site_content
  for each row execute function public.set_learner_progress_updated_at();

create policy "Visitors can read published public site content"
  on public.site_content
  for select
  to anon, authenticated
  using (
    content_type in ('homepage_feature', 'faq')
    and status = 'published'
    and published_at <= now()
  );

create policy "Learners can read published workspace content"
  on public.site_content
  for select
  to authenticated
  using (status = 'published' and published_at <= now());

create policy "Admins can read all site content"
  on public.site_content
  for select
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can create site content"
  on public.site_content
  for insert
  to authenticated
  with check (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    and created_by = (select auth.uid())
  );

create policy "Admins can update site content"
  on public.site_content
  for update
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete site content"
  on public.site_content
  for delete
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
