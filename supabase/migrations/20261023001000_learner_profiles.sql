create table if not exists public.learner_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  highest_qualification text not null default '',
  qualification_status text not null default '',
  field_of_study text not null default '',
  qualification_year smallint,
  nqf_level smallint,
  subjects jsonb not null default '[]'::jsonb,
  skills jsonb not null default '[]'::jsonb,
  experience_months smallint not null default 0,
  province text not null default '',
  city text not null default '',
  target_role text not null default '',
  target_income_monthly integer,
  hours_available_per_week smallint,
  employment_status text not null default '',
  age_band text not null default '',
  languages jsonb not null default '[]'::jsonb,
  drivers_license boolean,
  willing_to_relocate boolean,
  remote_ok boolean,
  own_transport boolean,
  computer_or_data_access boolean,
  updated_at timestamptz not null default now(),
  constraint learner_profiles_nqf_level_range check (nqf_level is null or nqf_level between 1 and 10),
  constraint learner_profiles_experience_range check (experience_months between 0 and 600)
);

alter table public.learner_profiles enable row level security;

create trigger learner_profiles_updated_at
  before update on public.learner_profiles
  for each row execute function public.set_learner_progress_updated_at();

create policy "Learners can read their own profile"
  on public.learner_profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Learners can create their own profile"
  on public.learner_profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Learners can update their own profile"
  on public.learner_profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.learner_profiles to authenticated;

create table if not exists public.email_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  instant_matches boolean not null default false,
  instant_matches_consented_at timestamptz,
  weekly_digest boolean not null default false,
  weekly_digest_consented_at timestamptz,
  closing_reminders boolean not null default false,
  closing_reminders_consented_at timestamptz,
  frequency text not null default 'weekly' check (frequency in ('weekly', 'instant')),
  quiet_hours_start time not null default '20:00',
  quiet_hours_end time not null default '08:00',
  paused boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.email_preferences enable row level security;

create trigger email_preferences_updated_at
  before update on public.email_preferences
  for each row execute function public.set_learner_progress_updated_at();

create policy "Learners can read their own email preferences"
  on public.email_preferences
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Learners can create their own email preferences"
  on public.email_preferences
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Learners can update their own email preferences"
  on public.email_preferences
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.email_preferences to authenticated;