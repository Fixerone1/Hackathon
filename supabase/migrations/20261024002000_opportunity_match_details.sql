alter table public.opportunities
  add column if not exists shift_types text[] not null default '{}',
  add column if not exists salary_min_monthly integer,
  add column if not exists salary_max_monthly integer;

alter table public.opportunities
  drop constraint if exists opportunities_shift_types_check;

alter table public.opportunities
  add constraint opportunities_shift_types_check
  check (shift_types <@ array['day', 'evening', 'night', 'weekend', 'flexible']::text[]);

alter table public.opportunities
  drop constraint if exists opportunities_salary_range_check;

alter table public.opportunities
  add constraint opportunities_salary_range_check
  check (
    (salary_min_monthly is null or salary_min_monthly >= 0)
    and (
      salary_max_monthly is null
      or (salary_max_monthly >= 0 and (salary_min_monthly is null or salary_max_monthly >= salary_min_monthly))
    )
  );
