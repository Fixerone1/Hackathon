begin;

select plan(5);

insert into auth.users (
  id, aud, role, email, encrypted_password, confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('60000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'milestone-a@example.test', '', now(), '{"provider":"email"}', '{}', now(), now()),
  ('60000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'milestone-b@example.test', '', now(), '{"provider":"email"}', '{}', now(), now())
on conflict (id) do nothing;

insert into public.learner_milestones (user_id, milestone_id)
values ('60000000-0000-0000-0000-000000000001', 'cv_builder')
on conflict (user_id, milestone_id) do nothing;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"60000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select set_config('request.jwt.claim.sub', '60000000-0000-0000-0000-000000000001', true);

select is((select count(*)::int from public.learner_milestones), 1, 'learner reads their own milestone');
select is((select count(*)::int from public.learner_milestones where user_id = '60000000-0000-0000-0000-000000000002'), 0, 'learner cannot read another milestone');
select lives_ok(
  $$insert into public.learner_milestones (user_id, milestone_id) values ('60000000-0000-0000-0000-000000000001', 'cv_builder') on conflict (user_id, milestone_id) do update set completed_at = now()$$,
  'learner can complete their own milestone'
);
select throws_ok(
  $$insert into public.learner_milestones (user_id, milestone_id) values ('60000000-0000-0000-0000-000000000002', 'cv_builder')$$,
  '42501', null, 'learner cannot complete another user milestone'
);

reset role;
select ok((select relrowsecurity from pg_class where oid = 'public.learner_milestones'::regclass), 'learner_milestones has RLS enabled');
select * from finish();
rollback;
