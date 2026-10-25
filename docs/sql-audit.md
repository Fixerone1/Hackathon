# SQL and Application Schema Audit

**Audit date:** 2026-10-25  
**Scope:** All eight repository SQL files under `supabase/migrations/` were read before any schema or application changes. No seeds, SQL tests, Supabase CLI configuration, or other SQL files were present. Applied-migration status cannot be determined from the repository; treat every existing migration as immutable and use new ordered migrations for fixes.

## Findings by severity

### Critical

1. **Opportunity data is readable without signing in.** `20261024000000_verified_opportunities.sql` grants SELECT to `anon, authenticated` and its first policy permits current published listings to both. The learner feed is behind the signed-in workspace guard, and the public opportunities page does not fetch listings. Restrict the public-listing policy/grant to authenticated learners in a new migration. Admin-only draft access already uses `auth.jwt() -> 'app_metadata' ->> 'role'`; the admin page also checks `app_metadata`. Do not use editable `user_metadata` for authorization.
2. **No automated database/RLS tests or reproducible clean install.** There is no `supabase/config.toml`, seed, SQL test directory, or database reset script. The README describes manually running migrations. This leaves cross-user reads, learner publishing, self-promotion, and migration ordering unverified.
3. **Opportunity creator foreign key can block account deletion.** `opportunities.created_by` references `auth.users(id)` with the default `NO ACTION`. `delete_my_account()` deletes the auth user, so an admin who created a surviving opportunity cannot delete their account. Use a new migration to make the attribution nullable and `ON DELETE SET NULL` (or deliberately cascade the opportunity, with a documented data-retention decision).

### High

4. **The opportunity category/type list is duplicated and the database permits HTTP.** The UI list is in `src/lib/opportunities.ts` and the SQL CHECK repeats its five slug values. The UI accepts either HTTP or HTTPS; the database regex accepts either. The requested canonical type labels map to the existing values `job`, `internship`, `bursary`, `training`, `enterprise`; keep one application source for labels/options and validate HTTPS in a new migration. A Postgres constraint remains necessary at the database boundary.
5. **Visibility/status values differ.** Admin offers only `draft` and `published`, while SQL and `OpportunityStatus` also allow `withdrawn`. Either expose/document withdrawal as a first-class state or remove it only after checking existing data. The request explicitly names draft/published; do not silently drop existing withdrawn rows.
6. **No duplicate-listing key or full-text search.** `opportunities` has no normalized title/organization/source URL uniqueness key and no search vector/index. Duplicate adverts can be inserted. A new migration should add a normalized unique key with a collision preflight and a GIN full-text index. Existing data must be checked before enforcing uniqueness.
7. **No durable match, dismissal, application workflow, or notification-delivery tables.** Matching is computed in `src/lib/opportunities.ts`; only the learner's `saved`/`applied` action and an optional return date persist. There are no stored match score/tier/breakdown/reasons/gaps, pathways, application follow-up state, dismissed matches/reasons, or due-notification queue. Email settings are consent/preferences only; the UI explicitly says email sending is not active. Do not claim these systems exist until code and schema are delivered together.
8. **Existing migrations are not safely rerunnable.** Tables/indices generally use `IF NOT EXISTS`, but `CREATE TRIGGER` and `CREATE POLICY` do not. Re-running the initial/profile/opportunity migrations fails on already-created triggers or policies. Do not edit applied files; new migrations should use guarded catalog checks or replace/drop-and-create patterns and include rollback notes.

### Medium

9. **Province constraints validate membership but not duplicates or ordering.** Opportunity provinces use a hard-coded allowed-value array and the admin form repeats the same list locally. Learner province is an unconstrained text field. Share the canonical province list in application code and add database validation for learner values; consider a lookup table only if province administration is expected.
10. **Profile dropdown/range values are only partly constrained in SQL.** `nqf_level` is constrained to 1–10. Work authorization and shift preferences have checks. `qualification_status`, `qualification_year`, `employment_status`, `hours_available_per_week`, `target_income_monthly`, and several list shapes are not comprehensively constrained. The profile UI offers exact sets for qualification status and employment status, so add matching checks/ranges without rejecting valid existing rows.
11. **Notification settings have no channel model.** `email_preferences` stores email-category toggles, frequency, quiet hours and pause state; dashboard alerts are device-local storage. There is no channel enum/column, send queue, or delivery audit. The UI also stores consent timestamps in the preference row rather than a separate consent-event history.
12. **Application tracker is intentionally minimal.** `learner_opportunity_actions.status` is only `saved` or `applied`; this matches the current UI. It has no applied-at timestamp, status history, follow-up note/date, or dismiss reason. `scheduled_apply_date` was added by the latest migration and is used by the profile planner and opportunity feed.
13. **The learner profile permits flexible JSON but does not validate its shape.** Subjects, skills, skill ratings, experience areas, languages, and some lists are JSONB. The UI parses these into known structures, but the database accepts arbitrary JSON. Add checks only with safe legacy-data validation, or migrate to typed child tables where queries need indexing/integrity.
14. **Export omits saved/application actions and planned return dates.** `src/app/app/settings/page.tsx` exports profile, progress, email preferences, privacy consent and local preferences, but not `learner_opportunity_actions` or linked opportunities. Add those rows to the user export and document a direct SQL export query.

### Low

15. **No sample seed data or seed labeling exists.** This is good for avoiding fake live listings, but makes demos/tests less repeatable. Any future seed must be clearly marked as sample and isolated from the real published feed.
16. **Index coverage is incomplete.** There is an index on `(status, closing_date)`, a primary key on `(user_id, opportunity_id)`, and a partial `(user_id, scheduled_apply_date)` index. There are no category/province search indexes, full-text index, match-by-user/tier index, or due-notification index. Some become useful only when those missing features are implemented.

## Tables and feature mapping

| Table | Purpose and columns | Current page/feature use | Unused or missing notes |
|---|---|---|---|
| `public.learner_progress` | Per-user `checklist` JSON and `updated_at`; `user_id` is the account key. FK cascades on account deletion. | Dashboard starter plan reads/writes checklist (`src/app/app/page.tsx`); settings export reads it. | `updated_at` is audit metadata. Checklist IDs are validated by UI, not SQL. No evidence of other unused columns. |
| `public.learner_profiles` | Learner information: qualification/status/year/NQF, field, subjects, skills/ratings, experience, province/city, target role/income, availability/employment, languages, access/transport/relocation, work authorization, shifts, certificates, display name/pronouns/about/goal/interests, `updated_at`. | Profile form/save (`src/app/app/profile/page.tsx`); matching and application pack (`OpportunityFeed`, `DashboardNotifications`); dashboard greeting/goals; settings export. The CV and assessment routes are placeholders and currently read/write nothing. | `age_band` was explicitly dropped by migration and is not a current field. `updated_at` is system metadata. Personal profile columns added in `20261024003000` are used for dashboard/profile UI. JSON shapes and several dropdown domains need stronger constraints. |
| `public.email_preferences` | Email toggles and consent timestamps for instant matches, weekly digest and closing reminders; frequency, quiet-hours start/end, pause, `updated_at`. | Settings form load/save (`src/app/app/settings/page.tsx`); data export. | Email delivery is not implemented. Device-local dashboard-alert, home-focus, and accessibility settings are not stored here. No channel, queue, delivery outcome, or consent-event history exists. |
| `public.privacy_consents` | One current policy version and consent timestamp per user. FK cascades. Inserted by auth trigger from signup metadata; user can read own record. | Signup form posts privacy consent metadata (`AuthForm`); settings displays/export through export JSON; deletion cascades. | No UI to revoke or view version history; current single-row model is not an event ledger. The insert is trigger-only, consistent with current grants. |
| `public.opportunities` | Verified listing identity/content, category, source, location/provinces/remote, minimum NQF, skills/shifts/salary, closing/verification dates, status, creator and timestamps. | Admin add/edit/publish (`OpportunityAdmin`); learner feed and dashboard notification matching; application tracker joins listing details. Public `/opportunities` is a sign-in prompt and does not query this table. | `id`, creator and timestamps are system fields; `verified_at` is set by admin code. `withdrawn` is allowed in SQL/type but not the admin visibility selector. HTTP is allowed by DB/UI. No duplicate hash/key or full-text search. |
| `public.learner_opportunity_actions` | Per-user/per-opportunity `saved` or `applied` status and timestamps; `scheduled_apply_date` added in `20261025000000`. Both FKs cascade. | Opportunity feed and application tracker read/write status; profile planner reads/writes return date. | No applied timestamp/history, dismissed status/reason, follow-up state, or match explanation persisted. `created_at`/`updated_at` are system metadata. |

## Forms and schema cross-check

- **Sign-up:** email/password/name/consent are sent to Supabase Auth, not a public table. Name/consent/version live in `auth.users` metadata; consent trigger copies policy version/time to `privacy_consents`. There is no app-owned password column (correct).
- **Profile:** current editable values map to `learner_profiles`; `nqf_level` is derived from the chosen qualification. Database columns are mostly present, but validation for allowed dropdown values and some numeric bounds is incomplete.
- **Assessment and CV:** both routes explicitly render unavailable placeholders. They have no active form fields or tables; future implementation requires a schema/UI design decision.
- **Admin listing form:** current fields map to `opportunities`; `created_by`, `verified_at`, and timestamps are set by code/database. `minimum_nqf_level` and `closing_date` are nullable as required. Source name and URL are required. Database allows `http://` while the acceptance requirement says HTTPS.
- **Notification settings:** email fields map to `email_preferences`; dashboard-alert/accessibility/home-focus preferences are localStorage only, not database fields. Sending is not implemented.
- **Application tracker:** status/date map to `learner_opportunity_actions`; listing content comes from `opportunities`. This is a saved/applied tracker, not a complete application workflow.

## RLS and relationship review

- All six public tables enable RLS. Learner-owned tables scope reads/writes by `auth.uid() = user_id`; privacy consent is read-only to the learner. Opportunity creation/update/delete policies check the server-managed `app_metadata.role` claim. No policy uses `user_metadata` for admin authorization.
- **Mismatch:** published listing SELECT currently includes `anon`; restrict to `authenticated` per the requested signed-in-only learner feed. Keep admin visibility based solely on `app_metadata`.
- Personal profile/progress/settings/consent/action FKs cascade from `auth.users`; actions also cascade from opportunities. `opportunities.created_by` does not specify delete behavior and can block deleting the creator's account.
- RLS has not been tested with two users or attempted learner/admin mutations because no SQL test suite is present.

## Query and integrity review

- Current listing feed filters published, non-expired, and recently verified results in the client; dashboard inbox queries published records and filters to seven-day creation in code. Listings are not deleted when expired.
- The database requires a source name and URL but accepts any `http(s)` prefix; it does not verify a normalized URL or prevent duplicate listings.
- Existing indexes: `(status, closing_date)`, action primary key `(user_id, opportunity_id)`, and partial `(user_id, scheduled_apply_date)`. There is no full-text search, province/category index, match-tier index, or notification scheduling index.
- No pathways, computed match records, notification queue, application follow-up records, or saved-match dismissal tables exist. The current matching engine computes scores/reasons at request time and stores no match breakdown.

## Migration inventory and hygiene

1. `20261023000000_learner_progress.sql` — progress table and shared timestamp function.
2. `20261023001000_learner_profiles.sql` — profile and email preference tables.
3. `20261023002000_account_privacy.sql` — privacy consent trigger and account-deletion function.
4. `20261024000000_verified_opportunities.sql` — opportunities, learner actions, RLS and indexes.
5. `20261024001000_application_profile_details.sql` — profile columns/checks and removal of `age_band`.
6. `20261024002000_opportunity_match_details.sql` — opportunity shifts/salary columns/checks.
7. `20261024003000_personal_learner_profiles.sql` — display and personal-goal columns.
8. `20261025000000_opportunity_return_dates.sql` — scheduled application return date and index.

No migration contains a rollback note. Most additive DDL is guarded, but trigger/policy creation is not re-runnable. There is no repository command to create a clean database from zero.

## Candidates and planned remediation

- **Do not remove any live column from this audit alone.** `age_band` is already dropped and has no UI consumer. `updated_at`, timestamps, and creator fields are operational metadata, not dead fields.
- **Add through new migrations:** signed-in-only opportunity read policy; nullable creator attribution with safe account deletion; HTTPS-only URL validation after legacy-data preflight; normalized duplicate key after collision report; full-text search/index; profile domain/range checks; application/match/notification/pathway schemas only alongside the corresponding features and RLS.
- **Share in application code:** opportunity categories and canonical provinces, used by admin form and other consumers. Preserve one source for labels and dropdown values.
- **Do not invent seed listings.** If fixtures are needed, keep them explicitly marked sample and excluded from production publishing.

## Account export query

The settings export currently omits opportunity actions. A complete per-user export can query all personal tables with `auth.uid()` under the signed-in role and include linked listing details:

```sql
select jsonb_build_object(
  'profile', (select to_jsonb(p) from public.learner_profiles p where p.user_id = auth.uid()),
  'progress', (select to_jsonb(p) from public.learner_progress p where p.user_id = auth.uid()),
  'email_preferences', (select to_jsonb(e) from public.email_preferences e where e.user_id = auth.uid()),
  'privacy_consents', coalesce((select jsonb_agg(to_jsonb(c)) from public.privacy_consents c where c.user_id = auth.uid()), '[]'::jsonb),
  'opportunity_actions', coalesce((
    select jsonb_agg(jsonb_build_object('action', to_jsonb(a), 'opportunity', to_jsonb(o)))
    from public.learner_opportunity_actions a
    join public.opportunities o on o.id = a.opportunity_id
    where a.user_id = auth.uid()
  ), '[]'::jsonb)
);
```

This query is for an authenticated user session, not an admin/service-role export.
