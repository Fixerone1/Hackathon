create table if not exists public.learner_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  checklist jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.learner_progress enable row level security;

create policy "Learners can read their own progress"
  on public.learner_progress
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Learners can create their own progress"
  on public.learner_progress
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Learners can update their own progress"
  on public.learner_progress
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.learner_progress to authenticated;