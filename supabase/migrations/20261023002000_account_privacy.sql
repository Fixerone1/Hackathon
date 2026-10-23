create table if not exists public.privacy_consents (
  user_id uuid primary key references auth.users (id) on delete cascade,
  policy_version text not null,
  consented_at timestamptz not null default now()
);

alter table public.privacy_consents enable row level security;

create policy "Users can read their own privacy consent"
  on public.privacy_consents
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

grant select on public.privacy_consents to authenticated;

create or replace function public.record_signup_privacy_consent()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.raw_user_meta_data ->> 'privacy_consent' = 'true' then
    insert into public.privacy_consents (user_id, policy_version)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'privacy_notice_version', 'prototype-1'))
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger auth_user_signup_privacy_consent
  after insert on auth.users
  for each row execute function public.record_signup_privacy_consent();

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from auth.users
  where id = (select auth.uid());
end;
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;