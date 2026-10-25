alter table public.learner_opportunity_actions
  add column if not exists scheduled_apply_date date;

create index if not exists learner_opportunity_actions_scheduled_apply_date_idx
  on public.learner_opportunity_actions (user_id, scheduled_apply_date)
  where scheduled_apply_date is not null;