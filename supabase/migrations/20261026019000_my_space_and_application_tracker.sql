create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_type text not null check (item_type in ('opportunity', 'lesson', 'idea', 'funding', 'interview_question', 'tool')),
  item_id text not null check (char_length(btrim(item_id)) between 1 and 240),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  link text not null check (link ~ '^/app(/[A-Za-z0-9_/#?=&%-]*)?$'),
  note text not null default '' check (char_length(note) <= 1000),
  remind_at timestamptz,
  closing_on date,
  created_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

create index if not exists saved_items_user_created_idx
  on public.saved_items (user_id, created_at desc);
create index if not exists saved_items_user_reminder_idx
  on public.saved_items (user_id, remind_at)
  where remind_at is not null;

alter table public.saved_items enable row level security;
create policy "Learners manage their own saved items"
  on public.saved_items
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.saved_items to authenticated;

create table if not exists public.drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('cv', 'cover_letter', 'assessment', 'pathway', 'growth', 'goal', 'form')),
  ref_id text not null default 'default' check (char_length(ref_id) between 1 and 120),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  progress smallint not null default 0 check (progress between 0 and 100),
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '90 days',
  unique (user_id, kind, ref_id),
  constraint drafts_data_size check (octet_length(data::text) <= 200000)
);

create index if not exists drafts_user_updated_idx
  on public.drafts (user_id, updated_at desc);
create index if not exists drafts_expiration_idx
  on public.drafts (expires_at);

alter table public.drafts enable row level security;
create policy "Learners manage their own drafts"
  on public.drafts
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.drafts to authenticated;

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  target_type text not null check (target_type in ('saved_item', 'application', 'draft', 'opportunity')),
  target_id text not null check (char_length(btrim(target_id)) between 1 and 240),
  remind_at timestamptz not null,
  channel text not null default 'in_app' check (channel in ('in_app', 'email')),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id, channel)
);

create index if not exists reminders_user_due_idx
  on public.reminders (user_id, remind_at)
  where sent_at is null;

alter table public.reminders enable row level security;
create policy "Learners manage their own reminders"
  on public.reminders
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.reminders to authenticated;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  opportunity_id uuid references public.opportunities (id) on delete set null,
  title text not null check (char_length(btrim(title)) between 2 and 160),
  employer text not null default '' check (char_length(employer) <= 160),
  url text not null default '' check (url = '' or url ~* '^https?://'),
  stage text not null default 'saved' check (stage in ('saved', 'preparing', 'applied', 'interview', 'offer', 'closed')),
  closed_reason text check (closed_reason is null or closed_reason in ('not_selected', 'withdrawn')),
  applied_on date,
  closing_on date,
  cv_version_id text not null default '',
  cover_letter_id text not null default '',
  contact text not null default '' check (char_length(contact) <= 240),
  notes text not null default '' check (char_length(notes) <= 5000),
  next_step text not null default '' check (char_length(next_step) <= 500),
  next_step_on date,
  documents_required jsonb not null default '[]'::jsonb check (jsonb_typeof(documents_required) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_user_updated_idx
  on public.applications (user_id, updated_at desc);
create index if not exists applications_user_closing_idx
  on public.applications (user_id, closing_on)
  where closing_on is not null;
create index if not exists applications_user_next_step_idx
  on public.applications (user_id, next_step_on)
  where next_step_on is not null;
create unique index if not exists applications_user_opportunity_unique_idx
  on public.applications (user_id, opportunity_id)
  where opportunity_id is not null;

alter table public.applications enable row level security;
create trigger applications_updated_at
  before update on public.applications
  for each row execute function public.set_learner_progress_updated_at();

create policy "Learners manage their own applications"
  on public.applications
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.applications to authenticated;

create table if not exists public.application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  from_stage text check (from_stage is null or from_stage in ('saved', 'preparing', 'applied', 'interview', 'offer', 'closed')),
  to_stage text not null check (to_stage in ('saved', 'preparing', 'applied', 'interview', 'offer', 'closed')),
  at timestamptz not null default now()
);

create index if not exists application_events_application_at_idx
  on public.application_events (application_id, at desc);

alter table public.application_events enable row level security;
create policy "Learners read events for their applications"
  on public.application_events
  for select
  to authenticated
  using (exists (
    select 1
    from public.applications
    where applications.id = application_events.application_id
      and applications.user_id = (select auth.uid())
  ));
grant select on public.application_events to authenticated;

create or replace function public.record_application_stage_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.application_events (application_id, from_stage, to_stage)
    values (new.id, null, new.stage);
  elsif old.stage is distinct from new.stage then
    insert into public.application_events (application_id, from_stage, to_stage)
    values (new.id, old.stage, new.stage);
  end if;
  return new;
end;
$$;

revoke all on function public.record_application_stage_event() from public, anon, authenticated;
create trigger applications_record_stage_event
  after insert or update of stage on public.applications
  for each row execute function public.record_application_stage_event();

insert into public.applications (user_id, opportunity_id, title, employer, url, stage, closing_on, applied_on, created_at, updated_at)
select
  actions.user_id,
  actions.opportunity_id,
  opportunities.title,
  opportunities.organization,
  coalesce(opportunities.source_url, ''),
  case when actions.status = 'applied' then 'applied' else 'saved' end,
  opportunities.closing_date,
  case when actions.status = 'applied' then actions.updated_at::date else null end,
  actions.created_at,
  actions.updated_at
from public.learner_opportunity_actions as actions
join public.opportunities as opportunities on opportunities.id = actions.opportunity_id
on conflict do nothing;

insert into public.saved_items (user_id, item_type, item_id, title, link, closing_on, created_at)
select
  actions.user_id,
  case when opportunities.category = 'bursary' then 'funding' else 'opportunity' end,
  actions.opportunity_id::text,
  opportunities.title,
  case when opportunities.category = 'bursary' then '/app/study#bursaries' else '/app/employment/opportunities' end,
  opportunities.closing_date,
  actions.created_at
from public.learner_opportunity_actions as actions
join public.opportunities as opportunities on opportunities.id = actions.opportunity_id
where actions.status = 'saved'
on conflict (user_id, item_type, item_id) do nothing;

create or replace function public.sync_opportunity_action_to_my_space()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  listing public.opportunities%rowtype;
begin
  if tg_op = 'DELETE' then
    delete from public.reminders
    where user_id = old.user_id
      and target_type = 'saved_item'
      and target_id in (
        select id::text
        from public.saved_items
        where user_id = old.user_id
          and item_type in ('opportunity', 'funding')
          and item_id = old.opportunity_id::text
      );
    delete from public.saved_items
    where user_id = old.user_id
      and item_type in ('opportunity', 'funding')
      and item_id = old.opportunity_id::text;
    return old;
  end if;

  if new.status <> 'saved' then
    delete from public.reminders
    where user_id = new.user_id
      and target_type = 'saved_item'
      and target_id in (
        select id::text
        from public.saved_items
        where user_id = new.user_id
          and item_type in ('opportunity', 'funding')
          and item_id = new.opportunity_id::text
      );
    delete from public.saved_items
    where user_id = new.user_id
      and item_type in ('opportunity', 'funding')
      and item_id = new.opportunity_id::text;
  end if;

  if new.status = 'saved' then
    select * into listing
    from public.opportunities
    where id = new.opportunity_id;

    insert into public.saved_items (user_id, item_type, item_id, title, link, closing_on)
    values (new.user_id, case when listing.category = 'bursary' then 'funding' else 'opportunity' end, new.opportunity_id::text, listing.title, case when listing.category = 'bursary' then '/app/study#bursaries' else '/app/employment/opportunities' end, listing.closing_date)
    on conflict (user_id, item_type, item_id)
    do update set title = excluded.title, link = excluded.link, closing_on = excluded.closing_on;
  end if;

  insert into public.applications as app (user_id, opportunity_id, title, employer, url, stage, closing_on, applied_on)
  select
    new.user_id,
    listing.id,
    listing.title,
    listing.organization,
    coalesce(listing.source_url, ''),
    case when new.status = 'applied' then 'applied' else 'saved' end,
    listing.closing_date,
    case when new.status = 'applied' then now()::date else null end
  from public.opportunities as listing
  where listing.id = new.opportunity_id
  on conflict (user_id, opportunity_id) where opportunity_id is not null
  do update set
    stage = excluded.stage,
    applied_on = case when excluded.stage = 'applied' then coalesce(app.applied_on, excluded.applied_on) else null end,
    updated_at = now();

  return new;
end;
$$;

revoke all on function public.sync_opportunity_action_to_my_space() from public, anon, authenticated;
create trigger learner_opportunity_actions_sync_my_space
  after insert or update of status or delete on public.learner_opportunity_actions
  for each row execute function public.sync_opportunity_action_to_my_space();
