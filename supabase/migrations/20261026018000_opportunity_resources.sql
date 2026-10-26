alter table public.site_content
  drop constraint if exists site_content_content_type_check;

alter table public.site_content
  add constraint site_content_content_type_check check (content_type in (
    'announcement',
    'learning_resource',
    'faq',
    'homepage_feature',
    'money_skill',
    'growth_resource',
    'employment_resource',
    'opportunity_resource'
  ));

alter table public.site_content
  add column if not exists event_date date,
  add column if not exists event_location text;

alter table public.site_content
  add constraint site_content_event_location_length check (
    event_location is null or char_length(btrim(event_location)) <= 160
  );
