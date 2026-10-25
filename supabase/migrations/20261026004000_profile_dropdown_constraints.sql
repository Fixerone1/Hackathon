-- Rollback: drop the constraints added here; retain profile values unchanged.
alter table public.learner_profiles
  drop constraint if exists learner_profiles_qualification_check,
  drop constraint if exists learner_profiles_qualification_status_check,
  drop constraint if exists learner_profiles_employment_status_check,
  drop constraint if exists learner_profiles_province_check,
  drop constraint if exists learner_profiles_shift_preferences_check,
  drop constraint if exists learner_profiles_qualification_year_check,
  drop constraint if exists learner_profiles_hours_available_check,
  drop constraint if exists learner_profiles_target_income_check;

alter table public.learner_profiles
  add constraint learner_profiles_qualification_check
    check (highest_qualification in ('', 'Below Grade 9', 'Grade 9', 'Grade 10', 'Grade 11', 'Matric', 'N6 certificate', 'Diploma', 'Bachelor''s degree', 'Honours degree', 'Master''s degree', 'Doctorate')) not valid,
  add constraint learner_profiles_qualification_status_check
    check (qualification_status in ('', 'in_progress', 'completed')) not valid,
  add constraint learner_profiles_employment_status_check
    check (employment_status in ('', 'unemployed', 'student', 'employed_looking', 'self_employed')) not valid,
  add constraint learner_profiles_province_check
    check (province in ('', 'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape')) not valid,
  add constraint learner_profiles_shift_preferences_check
    check (shift_preferences <@ array['day', 'evening', 'night', 'weekend', 'flexible']::text[]) not valid,
  add constraint learner_profiles_qualification_year_check
    check (qualification_year is null or qualification_year between 1950 and 2100) not valid,
  add constraint learner_profiles_hours_available_check
    check (hours_available_per_week is null or hours_available_per_week between 0 and 168) not valid,
  add constraint learner_profiles_target_income_check
    check (target_income_monthly is null or target_income_monthly >= 0) not valid;

alter table public.learner_profiles
  validate constraint learner_profiles_qualification_check,
  validate constraint learner_profiles_qualification_status_check,
  validate constraint learner_profiles_employment_status_check,
  validate constraint learner_profiles_province_check,
  validate constraint learner_profiles_shift_preferences_check,
  validate constraint learner_profiles_qualification_year_check,
  validate constraint learner_profiles_hours_available_check,
  validate constraint learner_profiles_target_income_check;