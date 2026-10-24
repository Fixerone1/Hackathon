create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 3 and 160),
  organization text not null check (char_length(btrim(organization)) between 2 and 160),
  category text not null check (category in ('job', 'internship', 'bursary', 'training', 'enterprise')),
  summary text not null check (char_length(btrim(summary)) between 20 and 2000),
  source_name text not null check (char_length(btrim(source_name)) between 2 and 120),
  source_url text not null check (source_url ~* '^https?://'),
  location text not null default '',
  provinces text[] not null default '{}' check (
    provinces <@ array[
      'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
      'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
    ]::text[]
  ),
  remote_ok boolean not null default false,
  minimum_nqf_level smallint check (minimum_nqf_level is null or minimum_nqf_level between 1 and 10),
  required_skills text[] not null default '{}',
  closing_date date,
  verified_at date not null default current_date,
  status text not null default 'draft' check (status in ('draft', 'published', 'withdrawn')),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists opportunities_published_closing_idx
  on public.opportunities (status, closing_date);

alter table public.opportunities enable row level security;

create trigger opportunities_updated_at
  before update on public.opportunities
  for each row execute function public.set_learner_progress_updated_at();

create policy "Anyone can read current published opportunities"
  on public.opportunities
  for select
  to anon, authenticated
  using (
    status = 'published'
    and (closing_date is null or closing_date >= current_date)
    and verified_at >= current_date - 30
  );

create policy "Admins can read all opportunities"
  on public.opportunities
  for select
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can create opportunities"
  on public.opportunities
  for insert
  to authenticated
  with check (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    and created_by = (select auth.uid())
  );

create policy "Admins can update opportunities"
  on public.opportunities
  for update
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete opportunities"
  on public.opportunities
  for delete
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant select on public.opportunities to anon, authenticated;
grant insert, update, delete on public.opportunities to authenticated;

create table if not exists public.learner_opportunity_actions (
  user_id uuid not null references auth.users (id) on delete cascade,
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  status text not null check (status in ('saved', 'applied')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

alter table public.learner_opportunity_actions enable row level security;

create trigger learner_opportunity_actions_updated_at
  before update on public.learner_opportunity_actions
  for each row execute function public.set_learner_progress_updated_at();

create policy "Learners can read listings they have saved"
  on public.opportunities
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.learner_opportunity_actions
      where learner_opportunity_actions.opportunity_id = opportunities.id
        and learner_opportunity_actions.user_id = (select auth.uid())
    )
  );

create policy "Learners can read their own opportunity actions"
  on public.learner_opportunity_actions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Learners can create their own opportunity actions"
  on public.learner_opportunity_actions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Learners can update their own opportunity actions"
  on public.learner_opportunity_actions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Learners can delete their own opportunity actions"
  on public.learner_opportunity_actions
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.learner_opportunity_actions to authenticated;
