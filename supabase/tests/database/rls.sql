begin;

select plan(23);

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'learner-a@example.test', '', now(), '{"provider":"email"}', '{"role":"admin"}', now(), now()),
  ('10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'learner-b@example.test', '', now(), '{"provider":"email"}', '{}', now(), now()),
  ('10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'admin@example.test', '', now(), '{"provider":"email","role":"admin"}', '{}', now(), now())
on conflict (id) do nothing;

insert into public.learner_profiles (user_id, highest_qualification)
values
  ('10000000-0000-0000-0000-000000000001', 'Matric'),
  ('10000000-0000-0000-0000-000000000002', 'Diploma')
on conflict (user_id) do nothing;

insert into public.learner_progress (user_id, checklist)
values
  ('10000000-0000-0000-0000-000000000001', '["profile"]'::jsonb),
  ('10000000-0000-0000-0000-000000000002', '["budget"]'::jsonb)
on conflict (user_id) do nothing;

insert into public.email_preferences (user_id)
values
  ('10000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002')
on conflict (user_id) do nothing;

insert into public.privacy_consents (user_id, policy_version)
values
  ('10000000-0000-0000-0000-000000000001', 'test-policy'),
  ('10000000-0000-0000-0000-000000000002', 'test-policy')
on conflict (user_id) do nothing;

insert into public.opportunities (
  id, title, organization, category, summary, source_name, source_url, status, created_by
) values
  ('20000000-0000-0000-0000-000000000001', 'Published learner test listing', 'Test Org', 'job', 'A verified test listing for RLS checks.', 'Test source', 'https://example.test/published', 'published', '10000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000002', 'Draft learner test listing', 'Test Org', 'job', 'A draft test listing for RLS checks.', 'Test source', 'https://example.test/draft', 'draft', '10000000-0000-0000-0000-000000000003')
on conflict (id) do nothing;

insert into public.learner_opportunity_actions (user_id, opportunity_id, status)
values
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'saved'),
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'applied')
on conflict (user_id, opportunity_id) do nothing;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","app_metadata":{"provider":"email"},"user_metadata":{"role":"admin"}}', true);

select is((select count(*)::int from public.learner_profiles), 1, 'learner reads only their own profile');
select is((select count(*)::int from public.learner_profiles where user_id = '10000000-0000-0000-0000-000000000002'), 0, 'learner cannot read another profile');
select is((with changed as (
  update public.learner_profiles set highest_qualification = 'Matric'
  where user_id = '10000000-0000-0000-0000-000000000002'
  returning user_id
) select count(*)::int from changed), 0, 'learner cannot update another profile');
select is((select count(*)::int from public.learner_progress), 1, 'learner reads only their own progress');
select is((select count(*)::int from public.learner_progress where user_id = '10000000-0000-0000-0000-000000000002'), 0, 'learner cannot read another progress row');
select is((select count(*)::int from public.email_preferences), 1, 'learner reads only their own preferences');
select is((select count(*)::int from public.email_preferences where user_id = '10000000-0000-0000-0000-000000000002'), 0, 'learner cannot read another preferences row');
select is((select count(*)::int from public.privacy_consents), 1, 'learner reads only their own consent');
select is((select count(*)::int from public.privacy_consents where user_id = '10000000-0000-0000-0000-000000000002'), 0, 'learner cannot read another consent');
select is((select count(*)::int from public.learner_opportunity_actions), 1, 'learner reads only their own opportunity actions');
select is((select count(*)::int from public.learner_opportunity_actions where user_id = '10000000-0000-0000-0000-000000000002'), 0, 'learner cannot read another opportunity action');
select is((select count(*)::int from public.opportunities where id = '20000000-0000-0000-0000-000000000001'), 1, 'signed-in learner reads a published listing');
select is((select count(*)::int from public.opportunities where id = '20000000-0000-0000-0000-000000000002'), 0, 'user_metadata role cannot expose a draft');
select is((with changed as (
  update public.opportunities set status = 'published'
  where id = '20000000-0000-0000-0000-000000000002'
  returning id
) select count(*)::int from changed), 0, 'learner cannot publish an opportunity');
select throws_ok(
  $$update auth.users set raw_app_meta_data = '{"role":"admin"}' where id = '10000000-0000-0000-0000-000000000001'$$,
  '42501', null, 'learner cannot promote themselves through app_metadata'
);

reset role;
set local role anon;
select throws_ok('select * from public.opportunities', '42501', null, 'anonymous role cannot read opportunity listings');

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated","app_metadata":{"provider":"email","role":"admin"},"user_metadata":{}}', true);
select is((select count(*)::int from public.opportunities where id = '20000000-0000-0000-0000-000000000002'), 1, 'server-managed app_metadata admin can read drafts');

reset role;
select ok((select relrowsecurity from pg_class where oid = 'public.learner_profiles'::regclass), 'learner_profiles has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.learner_progress'::regclass), 'learner_progress has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.email_preferences'::regclass), 'email_preferences has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.privacy_consents'::regclass), 'privacy_consents has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.opportunities'::regclass), 'opportunities has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.learner_opportunity_actions'::regclass), 'learner_opportunity_actions has RLS enabled');
select * from finish();
rollback;