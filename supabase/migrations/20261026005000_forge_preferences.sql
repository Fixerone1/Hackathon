-- Rollback: drop public.learner_preferences; this removes only Forge preferences and does not affect learner profile data.
create table if not exists public.learner_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  forge_name text not null default 'Forge' check (char_length(btrim(forge_name)) between 1 and 40),
  tone text not null default 'straight_up' check (tone in ('chill', 'straight_up', 'coach')),
  language text not null default 'en-ZA' check (language in ('en-ZA')),
  data_light boolean not null default false,
  personalisation_paused boolean not null default false,
  streak_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.learner_preferences enable row level security;

drop trigger if exists learner_preferences_updated_at on public.learner_preferences;
create trigger learner_preferences_updated_at
  before update on public.learner_preferences
  for each row execute function public.set_learner_progress_updated_at();

drop policy if exists "Learners can read their own Forge preferences" on public.learner_preferences;
create policy "Learners can read their own Forge preferences"
  on public.learner_preferences
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Learners can create their own Forge preferences" on public.learner_preferences;
create policy "Learners can create their own Forge preferences"
  on public.learner_preferences
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Learners can update their own Forge preferences" on public.learner_preferences;
create policy "Learners can update their own Forge preferences"
  on public.learner_preferences
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.learner_preferences to authenticated;