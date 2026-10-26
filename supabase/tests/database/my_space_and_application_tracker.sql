begin;

select plan(18);

insert into auth.users (
  id, aud, role, email, encrypted_password, confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('71000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'space-a@example.test', '', now(), '{"provider":"email"}', '{}', now(), now()),
  ('71000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'space-b@example.test', '', now(), '{"provider":"email"}', '{}', now(), now())
on conflict (id) do nothing;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"71000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select set_config('request.jwt.claim.sub', '71000000-0000-0000-0000-000000000001', true);

select lives_ok(
  $$insert into public.saved_items (user_id, item_type, item_id, title, link)
    values ('71000000-0000-0000-0000-000000000001', 'tool', 'study-hub', 'Study Hub', '/app/study')$$,
  'learner can save a workspace tool'
);
select is((select count(*)::int from public.saved_items), 1, 'learner sees their saved item');
select is((select count(*)::int from public.saved_items where user_id = '71000000-0000-0000-0000-000000000002'), 0, 'learner cannot read another saved item');
select throws_ok(
  $$insert into public.saved_items (user_id, item_type, item_id, title, link)
    values ('71000000-0000-0000-0000-000000000002', 'tool', 'private-tool', 'Private tool', '/app/study')$$,
  '42501', null, 'learner cannot save for another account'
);
select lives_ok(
  $$insert into public.drafts (user_id, kind, ref_id, title, progress, data)
    values ('71000000-0000-0000-0000-000000000001', 'pathway', 'default', 'Pathway draft', 25, '{"goal":"Nursing"}')$$,
  'learner can save a draft'
);
select is((select count(*)::int from public.drafts), 1, 'learner sees their draft');
select lives_ok(
  $$insert into public.reminders (user_id, target_type, target_id, remind_at)
    values ('71000000-0000-0000-0000-000000000001', 'draft', 'pathway', now() + interval '1 day')$$,
  'learner can save a reminder'
);
select is((select count(*)::int from public.reminders where user_id = '71000000-0000-0000-0000-000000000002'), 0, 'learner cannot read another reminder');
select lives_ok(
  $$insert into public.applications (user_id, title, employer, stage)
    values ('71000000-0000-0000-0000-000000000001', 'Assistant', 'Example employer', 'saved')$$,
  'learner can create a manual application'
);
select is((select count(*)::int from public.application_events), 1, 'application creation is recorded as an event');
select lives_ok(
  $$update public.applications set stage = 'preparing'
    where user_id = '71000000-0000-0000-0000-000000000001' and title = 'Assistant'$$,
  'learner can update their application stage'
);
select is((select count(*)::int from public.application_events), 2, 'application stage change is recorded');
select is((select count(*)::int from public.application_events where application_id in (
  select id from public.applications where user_id = '71000000-0000-0000-0000-000000000002'
)), 0, 'learner cannot read another application event');
select ok((select relrowsecurity from pg_class where oid = 'public.saved_items'::regclass), 'saved_items has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.drafts'::regclass), 'drafts has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.reminders'::regclass), 'reminders has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.applications'::regclass), 'applications has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.application_events'::regclass), 'application_events has RLS enabled');

select * from finish();
rollback;
