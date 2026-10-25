create table if not exists public.money_plans (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan_data jsonb not null default '{}'::jsonb
    check (jsonb_typeof(plan_data) = 'object' and pg_column_size(plan_data) <= 32768),
  updated_at timestamptz not null default now()
);

alter table public.money_plans enable row level security;

drop trigger if exists money_plans_updated_at on public.money_plans;
create trigger money_plans_updated_at
  before update on public.money_plans
  for each row execute function public.set_learner_progress_updated_at();

drop policy if exists "Learners can read their own money plan" on public.money_plans;
create policy "Learners can read their own money plan"
  on public.money_plans for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Learners can create their own money plan" on public.money_plans;
create policy "Learners can create their own money plan"
  on public.money_plans for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Learners can update their own money plan" on public.money_plans;
create policy "Learners can update their own money plan"
  on public.money_plans for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.money_plans to authenticated;

alter table public.email_preferences
  add column if not exists payday_reminders boolean not null default false,
  add column if not exists payday_reminders_consented_at timestamptz,
  add column if not exists money_goal_reminders boolean not null default false,
  add column if not exists money_goal_reminders_consented_at timestamptz,
  add column if not exists money_lesson_reminders boolean not null default false,
  add column if not exists money_lesson_reminders_consented_at timestamptz,
  add column if not exists bursary_deadline_reminders boolean not null default false,
  add column if not exists bursary_deadline_reminders_consented_at timestamptz;

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  type text not null check (type in ('Emergency fund', 'Study', 'Transport/licence', 'Laptop/phone', 'Business start-up', 'Other')),
  target_amount bigint not null check (target_amount between 1 and 100000000000),
  target_date date not null,
  starting_amount bigint not null default 0 check (starting_amount between 0 and 100000000000),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint savings_goals_starting_not_over_target check (starting_amount <= target_amount)
);

create index if not exists savings_goals_user_active_idx
  on public.savings_goals (user_id, archived, target_date);

alter table public.savings_goals enable row level security;

drop trigger if exists savings_goals_updated_at on public.savings_goals;
create trigger savings_goals_updated_at
  before update on public.savings_goals
  for each row execute function public.set_learner_progress_updated_at();

drop policy if exists "Learners can read their own savings goals" on public.savings_goals;
create policy "Learners can read their own savings goals"
  on public.savings_goals for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Learners can create their own savings goals" on public.savings_goals;
create policy "Learners can create their own savings goals"
  on public.savings_goals for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Learners can update their own savings goals" on public.savings_goals;
create policy "Learners can update their own savings goals"
  on public.savings_goals for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Learners can delete their own savings goals" on public.savings_goals;
create policy "Learners can delete their own savings goals"
  on public.savings_goals for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.savings_goals to authenticated;

create table if not exists public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.savings_goals (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount bigint not null check (amount between 1 and 100000000000),
  contributed_on date not null default current_date,
  note text not null default '' check (char_length(note) <= 300),
  created_at timestamptz not null default now()
);

create index if not exists goal_contributions_user_goal_date_idx
  on public.goal_contributions (user_id, goal_id, contributed_on desc);

alter table public.goal_contributions enable row level security;

drop policy if exists "Learners can read their own goal contributions" on public.goal_contributions;
create policy "Learners can read their own goal contributions"
  on public.goal_contributions for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Learners can add their own goal contributions" on public.goal_contributions;
create policy "Learners can add their own goal contributions"
  on public.goal_contributions for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.savings_goals goal
      where goal.id = goal_id and goal.user_id = (select auth.uid())
    )
  );

drop policy if exists "Learners can update their own goal contributions" on public.goal_contributions;
create policy "Learners can update their own goal contributions"
  on public.goal_contributions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.savings_goals goal
      where goal.id = goal_id and goal.user_id = (select auth.uid())
    )
  );

drop policy if exists "Learners can delete their own goal contributions" on public.goal_contributions;
create policy "Learners can delete their own goal contributions"
  on public.goal_contributions for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.goal_contributions to authenticated;

create table if not exists public.money_lesson_completions (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null check (lesson_id in (
    'reading-a-payslip',
    'irregular-income',
    'emergency-fund',
    'debt-and-credit',
    'banking-and-mobile-money',
    'stokvels-and-burial-societies',
    'starting-to-invest',
    'first-tax-return'
  )),
  quiz_correct smallint not null check (quiz_correct between 0 and 5),
  quiz_total smallint not null check (quiz_total between 3 and 5),
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id),
  check (quiz_correct * 100 >= quiz_total * 70)
);

alter table public.money_lesson_completions enable row level security;

drop policy if exists "Learners can read their own money lessons" on public.money_lesson_completions;
create policy "Learners can read their own money lessons"
  on public.money_lesson_completions for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Learners can complete their own money lessons" on public.money_lesson_completions;
create policy "Learners can complete their own money lessons"
  on public.money_lesson_completions for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Learners can update their own money lessons" on public.money_lesson_completions;
create policy "Learners can update their own money lessons"
  on public.money_lesson_completions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.money_lesson_completions to authenticated;
