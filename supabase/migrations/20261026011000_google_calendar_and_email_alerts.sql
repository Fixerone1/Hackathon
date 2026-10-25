alter table public.email_preferences
  add column if not exists application_reminders boolean not null default false,
  add column if not exists application_reminders_consented_at timestamptz;

create table if not exists public.google_calendar_integrations (
  user_id uuid primary key references auth.users (id) on delete cascade,
  refresh_token_ciphertext text not null,
  refresh_token_iv text not null,
  updated_at timestamptz not null default now()
);

alter table public.google_calendar_integrations enable row level security;
revoke all on public.google_calendar_integrations from anon, authenticated;
grant all on public.google_calendar_integrations to service_role;

drop trigger if exists auth_user_update_privacy_consent on auth.users;
create trigger auth_user_update_privacy_consent
  after update of raw_user_meta_data on auth.users
  for each row
  when (new.raw_user_meta_data ->> 'privacy_consent' = 'true')
  execute function public.record_signup_privacy_consent();
