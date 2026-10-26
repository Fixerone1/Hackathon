begin;

select plan(14);

insert into auth.users (
  id, aud, role, email, encrypted_password, confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('40000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'passport-a@example.test', '', now(), '{"provider":"email"}', '{}', now(), now()),
  ('40000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'passport-b@example.test', '', now(), '{"provider":"email"}', '{}', now(), now()),
  ('40000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'passport-c@example.test', '', now(), '{"provider":"email"}', '{}', now(), now())
on conflict (id) do nothing;

insert into public.skills_passports (user_id, share_token, is_public, expires_at, public_data)
values
  (
    '40000000-0000-0000-0000-000000000001',
    '50000000-0000-0000-0000-000000000001',
    true,
    null,
    '{"display_name":"Amahle Example","headline":"Junior designer","summary":"A learner portfolio.","email":"private@example.test","skills":[{"name":"Layout","level":3,"evidence_note":"Designed a community flyer.","private_note":"must never be returned"}],"experience":[{"area":"Volunteer","months":2,"private_note":"must never be returned"}],"secret_note":"must never be returned","visibility":{"name":true,"headline":true,"summary":true,"skills":true,"experience":false,"projects":false,"education":false,"certifications":false,"email":false}}'::jsonb
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '50000000-0000-0000-0000-000000000002',
    false,
    null,
    '{"display_name":"Unpublished learner","visibility":{"name":true}}'::jsonb
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    '50000000-0000-0000-0000-000000000003',
    true,
    now() - interval '1 minute',
    '{"display_name":"Expired learner","visibility":{"name":true}}'::jsonb
  )
on conflict (user_id) do update set
  share_token = excluded.share_token,
  is_public = excluded.is_public,
  expires_at = excluded.expires_at,
  public_data = excluded.public_data;

set local role anon;
select is(public.get_public_skills_passport('50000000-0000-0000-0000-000000000001')->>'display_name', 'Amahle Example', 'public visitor sees the selected name');
select is(jsonb_array_length(public.get_public_skills_passport('50000000-0000-0000-0000-000000000001')->'skills'), 1, 'public visitor sees selected skills');
select ok(not (public.get_public_skills_passport('50000000-0000-0000-0000-000000000001') ? 'experience'), 'unselected experience is omitted');
select ok(not (public.get_public_skills_passport('50000000-0000-0000-0000-000000000001') ? 'email'), 'email is omitted unless explicitly selected');
select ok(not (public.get_public_skills_passport('50000000-0000-0000-0000-000000000001') ? 'secret_note'), 'unrecognized private data is never returned');
select ok(not (public.get_public_skills_passport('50000000-0000-0000-0000-000000000001') ? 'user_id'), 'internal user ID is never returned');
select ok(not ((public.get_public_skills_passport('50000000-0000-0000-0000-000000000001')->'skills'->0) ? 'private_note'), 'unrecognized nested skill data is never returned');
select is(public.get_public_skills_passport('50000000-0000-0000-0000-000000000002'), null::jsonb, 'revoked passport is unavailable');
select is(public.get_public_skills_passport('50000000-0000-0000-0000-000000000003'), null::jsonb, 'expired passport is unavailable');
select is(public.get_public_skills_passport('50000000-0000-0000-0000-000000000099'), null::jsonb, 'unknown share token returns no passport');
select throws_ok('select * from public.skills_passports', '42501', null, 'public visitor cannot query passport storage directly');

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"40000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select set_config('request.jwt.claim.sub', '40000000-0000-0000-0000-000000000001', true);
select is((select count(*)::int from public.skills_passports), 1, 'learner reads only their own passport');
select is((select count(*)::int from public.skills_passports where user_id = '40000000-0000-0000-0000-000000000002'), 0, 'learner cannot read another passport');

reset role;
select ok((select relrowsecurity from pg_class where oid = 'public.skills_passports'::regclass), 'skills_passports has RLS enabled');
select * from finish();
rollback;