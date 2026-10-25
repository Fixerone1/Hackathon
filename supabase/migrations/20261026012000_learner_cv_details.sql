create table if not exists public.learner_cv_details (
  user_id uuid primary key references auth.users (id) on delete cascade,
  phone text not null default '',
  summary text not null default '',
  experience text not null default '',
  updated_at timestamptz not null default now(),
  constraint learner_cv_phone_length check (char_length(phone) <= 40),
  constraint learner_cv_summary_length check (char_length(summary) <= 1500),
  constraint learner_cv_experience_length check (char_length(experience) <= 5000)
);

alter table public.learner_cv_details enable row level security;

create policy "Learners can read their own CV details"
  on public.learner_cv_details
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Learners can create their own CV details"
  on public.learner_cv_details
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Learners can update their own CV details"
  on public.learner_cv_details
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.learner_cv_details to authenticated;
