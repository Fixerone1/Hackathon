alter table public.learner_cv_details
  add column if not exists cv_data jsonb not null default '{}'::jsonb,
  add constraint learner_cv_data_object check (jsonb_typeof(cv_data) = 'object'),
  add constraint learner_cv_data_size check (octet_length(cv_data::text) <= 100000);
