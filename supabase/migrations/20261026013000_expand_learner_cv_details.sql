alter table public.learner_cv_details
  add column if not exists professional_title text not null default '',
  add column if not exists education text not null default '',
  add column if not exists projects text not null default '',
  add column if not exists achievements text not null default '',
  add column if not exists website text not null default '';

update public.learner_cv_details cv
set professional_title = profile.target_role
from public.learner_profiles profile
where profile.user_id = cv.user_id
  and cv.professional_title = '';

alter table public.learner_cv_details
  add constraint learner_cv_professional_title_length check (char_length(professional_title) <= 120),
  add constraint learner_cv_education_length check (char_length(education) <= 2000),
  add constraint learner_cv_projects_length check (char_length(projects) <= 2500),
  add constraint learner_cv_achievements_length check (char_length(achievements) <= 1500),
  add constraint learner_cv_website_length check (char_length(website) <= 300);
