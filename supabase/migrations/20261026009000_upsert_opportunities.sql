create or replace function public.save_opportunity(p_payload jsonb)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_opportunity public.opportunities%rowtype;
  v_id uuid;
begin
  select *
  into v_opportunity
  from jsonb_populate_record(null::public.opportunities, p_payload);

  insert into public.opportunities (
    title,
    organization,
    category,
    summary,
    source_name,
    source_url,
    banner_image_url,
    location,
    provinces,
    remote_ok,
    minimum_nqf_level,
    required_skills,
    shift_types,
    salary_min_monthly,
    salary_max_monthly,
    closing_date,
    verified_at,
    status,
    withdrawn_at,
    created_by
  ) values (
    v_opportunity.title,
    v_opportunity.organization,
    v_opportunity.category,
    v_opportunity.summary,
    v_opportunity.source_name,
    v_opportunity.source_url,
    v_opportunity.banner_image_url,
    v_opportunity.location,
    v_opportunity.provinces,
    v_opportunity.remote_ok,
    v_opportunity.minimum_nqf_level,
    v_opportunity.required_skills,
    v_opportunity.shift_types,
    v_opportunity.salary_min_monthly,
    v_opportunity.salary_max_monthly,
    v_opportunity.closing_date,
    v_opportunity.verified_at,
    v_opportunity.status,
    v_opportunity.withdrawn_at,
    auth.uid()
  )
  on conflict (
    (lower(regexp_replace(btrim(title), '\s+', ' ', 'g'))),
    (lower(regexp_replace(btrim(organization), '\s+', ' ', 'g'))),
    (btrim(source_url))
  ) do update set
    title = excluded.title,
    organization = excluded.organization,
    category = excluded.category,
    summary = excluded.summary,
    source_name = excluded.source_name,
    source_url = excluded.source_url,
    banner_image_url = excluded.banner_image_url,
    location = excluded.location,
    provinces = excluded.provinces,
    remote_ok = excluded.remote_ok,
    minimum_nqf_level = excluded.minimum_nqf_level,
    required_skills = excluded.required_skills,
    shift_types = excluded.shift_types,
    salary_min_monthly = excluded.salary_min_monthly,
    salary_max_monthly = excluded.salary_max_monthly,
    closing_date = excluded.closing_date,
    verified_at = excluded.verified_at,
    status = excluded.status,
    withdrawn_at = excluded.withdrawn_at
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.save_opportunity(jsonb) from public, anon;
grant execute on function public.save_opportunity(jsonb) to authenticated;
