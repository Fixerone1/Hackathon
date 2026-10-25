-- Rollback: drop the generated column and the indexes created in this migration.
do $$
begin
  if exists (
    select 1
    from public.opportunities
    group by
      lower(regexp_replace(btrim(title), '\s+', ' ', 'g')),
      lower(regexp_replace(btrim(organization), '\s+', ' ', 'g')),
      btrim(source_url)
    having count(*) > 1
  ) then
    raise exception 'Duplicate opportunities prevent the normalized unique index. Review duplicate title, organization, and source URL rows, then rerun this migration.';
  end if;
end;
$$;

create unique index if not exists opportunities_normalized_listing_uidx
  on public.opportunities (
    lower(regexp_replace(btrim(title), '\s+', ' ', 'g')),
    lower(regexp_replace(btrim(organization), '\s+', ' ', 'g')),
    btrim(source_url)
  );

alter table public.opportunities
  add column if not exists search_document tsvector
  generated always as (
    setweight(to_tsvector('simple'::regconfig, coalesce(title, '')), 'A')
    || setweight(to_tsvector('simple'::regconfig, coalesce(organization, '')), 'B')
    || setweight(to_tsvector('simple'::regconfig, coalesce(summary, '')), 'C')
    || setweight(to_tsvector('simple'::regconfig, coalesce(array_to_string(required_skills, ' '), '')), 'B')
  ) stored;

create index if not exists opportunities_search_document_gin_idx
  on public.opportunities using gin (search_document);

create index if not exists opportunities_category_closing_idx
  on public.opportunities (category, closing_date)
  where status = 'published' and withdrawn_at is null;

create index if not exists opportunities_provinces_gin_idx
  on public.opportunities using gin (provinces);