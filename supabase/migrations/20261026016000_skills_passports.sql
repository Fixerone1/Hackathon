create table if not exists public.skills_passports (
  user_id uuid primary key references auth.users (id) on delete cascade,
  share_token uuid not null unique default gen_random_uuid(),
  is_public boolean not null default false,
  expires_at timestamptz,
  public_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint skills_passports_public_data_object check (jsonb_typeof(public_data) = 'object'),
  constraint skills_passports_public_data_size check (octet_length(public_data::text) <= 50000)
);

alter table public.skills_passports enable row level security;

create trigger skills_passports_updated_at
  before update on public.skills_passports
  for each row execute function public.set_learner_progress_updated_at();

create policy "Learners can read their own skills passport"
  on public.skills_passports
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Learners can create their own skills passport"
  on public.skills_passports
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Learners can update their own skills passport"
  on public.skills_passports
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Learners can delete their own skills passport"
  on public.skills_passports
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.skills_passports from anon, public;
grant select, insert, update, delete on public.skills_passports to authenticated;

create or replace function public.get_public_skills_passport(p_share_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'display_name', case when passport.public_data #>> '{visibility,name}' = 'true'
      then nullif(passport.public_data ->> 'display_name', '') end,
    'headline', case when passport.public_data #>> '{visibility,headline}' = 'true'
      then nullif(passport.public_data ->> 'headline', '') end,
    'summary', case when passport.public_data #>> '{visibility,summary}' = 'true'
      then nullif(passport.public_data ->> 'summary', '') end,
    'skills', case when passport.public_data #>> '{visibility,skills}' = 'true'
      and jsonb_typeof(passport.public_data -> 'skills') = 'array'
      then (
        select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
          'name', skill.value ->> 'name',
          'level', skill.value -> 'level',
          'evidence_note', skill.value ->> 'evidence_note'
        ))), '[]'::jsonb)
        from jsonb_array_elements(passport.public_data -> 'skills') as skill(value)
        where jsonb_typeof(skill.value) = 'object'
      ) end,
    'experience', case when passport.public_data #>> '{visibility,experience}' = 'true'
      and jsonb_typeof(passport.public_data -> 'experience') = 'array'
      then (
        select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
          'area', entry.value ->> 'area',
          'months', entry.value -> 'months'
        ))), '[]'::jsonb)
        from jsonb_array_elements(passport.public_data -> 'experience') as entry(value)
        where jsonb_typeof(entry.value) = 'object'
      ) end,
    'projects', case when passport.public_data #>> '{visibility,projects}' = 'true'
      and jsonb_typeof(passport.public_data -> 'projects') = 'array'
      then (
        select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
          'title', project.value ->> 'title',
          'description', project.value ->> 'description',
          'url', project.value ->> 'url'
        ))), '[]'::jsonb)
        from jsonb_array_elements(passport.public_data -> 'projects') as project(value)
        where jsonb_typeof(project.value) = 'object'
      ) end,
    'education', case when passport.public_data #>> '{visibility,education}' = 'true'
      and jsonb_typeof(passport.public_data -> 'education') = 'array'
      then (
        select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
          'qualification', education.value ->> 'qualification',
          'field', education.value ->> 'field',
          'year', education.value -> 'year',
          'status', education.value ->> 'status'
        ))), '[]'::jsonb)
        from jsonb_array_elements(passport.public_data -> 'education') as education(value)
        where jsonb_typeof(education.value) = 'object'
      ) end,
    'certifications', case when passport.public_data #>> '{visibility,certifications}' = 'true'
      and jsonb_typeof(passport.public_data -> 'certifications') = 'array'
      then (
        select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
          'name', certificate.value ->> 'name'
        ))), '[]'::jsonb)
        from jsonb_array_elements(passport.public_data -> 'certifications') as certificate(value)
        where jsonb_typeof(certificate.value) = 'object'
      ) end,
    'email', case when passport.public_data #>> '{visibility,email}' = 'true'
      then nullif(passport.public_data ->> 'email', '') end
  ))
  from public.skills_passports as passport
  where passport.share_token = p_share_token
    and passport.is_public
    and (passport.expires_at is null or passport.expires_at > now())
  limit 1;
$$;

revoke all on function public.get_public_skills_passport(uuid) from public, anon, authenticated;
grant execute on function public.get_public_skills_passport(uuid) to anon, authenticated;