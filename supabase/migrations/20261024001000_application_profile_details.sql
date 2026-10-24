alter table public.learner_profiles
  add column if not exists work_authorization text not null default '',
  add column if not exists availability_start_date date,
  add column if not exists shift_preferences text[] not null default '{}',
  add column if not exists certifications text[] not null default '{}',
  add column if not exists target_income_monthly_max integer;

alter table public.learner_profiles
  drop constraint if exists learner_profiles_work_authorization_check;

alter table public.learner_profiles
  add constraint learner_profiles_work_authorization_check
  check (work_authorization in ('', 'citizen', 'permanent_resident', 'work_visa', 'unsure', 'prefer_not_to_say'));

alter table public.learner_profiles
  drop constraint if exists learner_profiles_income_range_check;

alter table public.learner_profiles
  add constraint learner_profiles_income_range_check
  check (
    target_income_monthly_max is null
    or (
      target_income_monthly_max >= 0
      and (target_income_monthly is null or target_income_monthly_max >= target_income_monthly)
    )
  );

alter table public.learner_profiles
  drop column if exists age_band;
