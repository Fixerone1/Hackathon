create table if not exists public.learner_milestones (
  user_id uuid not null references auth.users (id) on delete cascade,
  milestone_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, milestone_id),
  constraint learner_milestones_known_id check (milestone_id in ('cv_builder'))
);

alter table public.learner_milestones enable row level security;

create policy "Learners can read their own milestones"
  on public.learner_milestones
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Learners can create their own milestones"
  on public.learner_milestones
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Learners can update their own milestones"
  on public.learner_milestones
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.learner_milestones to authenticated;
