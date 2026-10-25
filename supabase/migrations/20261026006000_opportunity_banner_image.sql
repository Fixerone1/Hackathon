-- Rollback: drop the banner URL check and column; opportunity text/listing data is preserved.
alter table public.opportunities
  add column if not exists banner_image_url text;

alter table public.opportunities
  drop constraint if exists opportunities_banner_image_url_https_check;

alter table public.opportunities
  add constraint opportunities_banner_image_url_https_check
  check (
    banner_image_url is null
    or btrim(banner_image_url) = ''
    or banner_image_url ~* '^https://[^[:space:]/]+(:[0-9]+)?([/?#].*)?$'
  ) not valid;

alter table public.opportunities
  validate constraint opportunities_banner_image_url_https_check;