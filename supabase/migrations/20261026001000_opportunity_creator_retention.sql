-- Rollback: delete opportunities created by a user before restoring created_by NOT NULL and the default foreign key.
alter table public.opportunities
  alter column created_by drop not null;

alter table public.opportunities
  drop constraint if exists opportunities_created_by_fkey;

alter table public.opportunities
  add constraint opportunities_created_by_fkey
  foreign key (created_by) references auth.users (id) on delete set null;