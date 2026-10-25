-- Rollback: drop the added constraints and withdrawn_at; restore the prior category/status/URL checks and migrate withdrawn rows back first.
alter table public.opportunities
  add column if not exists withdrawn_at timestamptz;

update public.opportunities
set withdrawn_at = coalesce(updated_at, now()), status = 'draft'
where status = 'withdrawn';

alter table public.opportunities
  drop constraint if exists opportunities_category_check,
  drop constraint if exists opportunities_status_check,
  drop constraint if exists opportunities_source_url_check,
  drop constraint if exists opportunities_source_url_https_check;

alter table public.opportunities
  add constraint opportunities_category_check
    check (category in ('job', 'internship', 'bursary', 'training', 'enterprise')),
  add constraint opportunities_status_check
    check (status in ('draft', 'published')),
  add constraint opportunities_source_url_https_check
    check (source_url ~* '^https://[^[:space:]/]+(:[0-9]+)?([/?#].*)?$') not valid;

alter table public.opportunities
  validate constraint opportunities_source_url_https_check;