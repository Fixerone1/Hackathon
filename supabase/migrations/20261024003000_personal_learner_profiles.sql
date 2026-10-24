alter table public.learner_profiles
  add column if not exists display_name text not null default '',
  add column if not exists pronouns text not null default '',
  add column if not exists about_me text not null default '',
  add column if not exists personal_goal text not null default '',
  add column if not exists interests jsonb not null default '[]'::jsonb;
