# CareerForge AI — Youth Economic Mobility Platform

> From employment readiness to economic independence.

A Next.js 14 (App Router) + TypeScript + Tailwind CSS prototype for the FNB App of the Year / UJ Business School hackathon.
The **70 / 15 / 15** framework drives everything: Employment readiness (70%), Money confidence (15%), Growth potential (15%), combined into one **Economic Mobility Score**.

## Run it

```bash
npm install
cp .env.example .env
# Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.
npm run dev
```

Requires Node 18.17+ and a Supabase project.

The profile uses these example South African NQF mappings: Grade 9 = 1, Grade 10 = 2, Grade 11 = 3, Matric = 4, N6 certificate = 5, National Diploma = 6, Bachelor's degree = 7, Honours = 8, Master's = 9, Doctorate = 10. A qualification is not inferred from a free-text field; unsupported values have no mapped NQF level.

### Supabase setup

1. Create a Supabase project.
2. Copy its Project URL and anon/public key into local `.env` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Never use the service-role key. Do not commit `.env`.
3. In the Supabase SQL Editor, run these files in filename order:
   - [`supabase/migrations/20261023000000_learner_progress.sql`](supabase/migrations/20261023000000_learner_progress.sql)
   - [`supabase/migrations/20261023001000_learner_profiles.sql`](supabase/migrations/20261023001000_learner_profiles.sql)
   - [`supabase/migrations/20261023002000_account_privacy.sql`](supabase/migrations/20261023002000_account_privacy.sql)
   - [`supabase/migrations/20261024000000_verified_opportunities.sql`](supabase/migrations/20261024000000_verified_opportunities.sql)
   - [`supabase/migrations/20261024001000_application_profile_details.sql`](supabase/migrations/20261024001000_application_profile_details.sql)
   - [`supabase/migrations/20261024002000_opportunity_match_details.sql`](supabase/migrations/20261024002000_opportunity_match_details.sql)
4. Set the Supabase Auth Site URL to `http://localhost:3000` and allow that redirect URL. For GitHub Pages, also allow `https://fixerone1.github.io/Hackathon/login`.
5. To grant admin access, set `app_metadata.role` to `admin` for the account in Supabase. Do not use user-editable metadata for authorization.
6. Run `npm run dev`, open `http://localhost:3000/signup`, create an account, confirm your email if prompted, and sign in. Signup requires an explicit privacy-notice checkbox.

For GitHub Pages, add repository Actions secrets named `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The anon key is public by design; RLS must protect every table. Never add a service-role key.

### Optional: real AI feedback
The `/api/ai` endpoint uses Azure OpenAI when configured with the values in `.env.example`. Learners can request an AI application plan from a verified opportunity's “Prepare your application” section. Only the selected listing and relevant profile fields are sent when they click the button; CareerForge does not save the generated plan or send it to the employer. Plans are suggestions, not eligibility decisions, and must be checked against the original advert. The employer's site remains responsible for application submission. Without Azure OpenAI configuration the endpoint returns an explicit service-unavailable error.

## Routes in this preview

- Public pages: `/`, `/how-it-works`, `/opportunities`, `/partners`, `/about`, `/privacy`, `/login`, `/signup`.
- `/signup` and `/login` use Supabase Auth through the Supabase JavaScript client.
- `/app` is a protected dashboard with a progressive profile, checklist, notification preferences, and a personalized verified-opportunity feed.
- `/admin` is separate from learner navigation and requires `app_metadata.role = admin` in Supabase. Admins can verify and publish opportunities with their original source link, stated requirements, location, and closing date.
- `/api/ai` is an optional server route for AI application plans. Configure the Azure OpenAI values in `.env.example` on a server-capable host to enable it.

Authentication is delegated to Supabase; passwords are not stored by this application. The browser client stores its session in browser storage, not an HttpOnly cookie. Migrations store learner profile, checklist, privacy consent, and email preferences with per-user row-level security. Email categories are off by default; preference and consent timestamps are saved, but email sending is not implemented.

### Verified opportunity feed

The learner dashboard and Employment Hub show published opportunities from Supabase, compare stated listing requirements with a learner's saved role, skills, province, NQF level, certifications, shift preferences, and salary range, and explain the fit signals. Admins should only enter salary or shift information explicitly stated in the original advert. The optional learner profile also supports work authorization, availability, certificates, and existing experience, language, and transport information. These details are included only in a learner-reviewed application pack and AI coaching; they affect matching only when a listing includes the relevant verified requirement. Learners can copy a pack of saved details to paste into another form. A normal web app cannot access or fill forms on external employer sites. Learners review and submit applications themselves; CareerForge never applies on a learner's behalf. ID/passport numbers, bank details, demographics, and reference contact details are not collected. A reminder prompts learners to provide documents or references directly to an employer only if requested. Fit signals are guidance, not an eligibility decision.

Listings are admin-curated rather than scraped. Check the live original advert and its terms before publishing; use a short summary you have permission to share. Possible primary sources include [SAYouth](https://sayouth.mobi/), the [DPSA Public Service Vacancy Circular](https://www.dpsa.gov.za/newsroom/psvc/), and [NSFAS](https://www.nsfas.org.za/), as well as the opportunity provider's own advert. Each listing is hidden from the feed if its closing date passes or it has not been re-verified for 30 days. Admins can confirm that a listing is still open from `/admin`.

Apply the opportunity migration, grant `app_metadata.role = admin` to a trusted account, sign in, and add a verified listing at `/admin` before learners will see entries. Automated source ingestion is not enabled: the Adzuna API requires registration credentials, and South African coverage must be confirmed before relying on it. Email alerts are also not enabled; this release uses the on-site feed only.

`prisma/schema.prisma` is a legacy planning artifact and is not applied by this application. Supabase migrations are the active database schema. Keep every user table protected by RLS and configure a strict Content Security Policy before production use.

## Phase 1 scope and tests

The uploaded source did not include the previously described assessment, CV builder, interview coach, Skills Academy, salary planner, savings-goal, or idea-validator modules. Their routes are present but clearly marked unavailable; they have not been represented as working features. The Mobility Score is not calculated until its underlying tools exist. The opportunity feed supports verified admin-curated listings and learner save/applied tracking, but it does not automatically ingest third-party sources, submit applications, or send email alerts. No real listings are seeded; admins must verify and publish genuine openings before the feed is populated. No third-party job sources have been scraped.

The synthetic learner fixture is [`tests/fixtures/learner_profile.json`](tests/fixtures/learner_profile.json). Frontend checks use `npm run typecheck` and `npm run build`.

The AI route applies an in-memory rate limit and basic request-size and prompt-injection checks. These controls are demo-level and should be replaced with shared, production-grade controls before deployment to real users.

## Notes
- Palette: white, near-black `#222222`, Sunshine Yellow `#FFE500`, and neutral gray. Shared page banners use the supplied learner photo in grayscale with a yellow gradient overlay. Set `NEXT_PUBLIC_LINKEDIN_URL` to the official LinkedIn page URL to enable the primary LinkedIn footer link; until configured, the icon is shown as “Coming soon.” For GitHub Pages, add this as a repository Actions variable with an `https://www.linkedin.com/` URL.

## Publish on GitHub (free, GitHub Pages)

GitHub Pages serves the static frontend. Authentication and learner data use Supabase directly; no Python server is required for these flows. Browser sessions are not HttpOnly, so rely on RLS and HTTPS.

1. Create a new **public** repository on GitHub (for example `careerforge`).
2. Upload everything in this folder to it (or push with git):
   ```bash
   git init && git add . && git commit -m "CareerForge AI"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/careerforge.git
   git push -u origin main
   ```
3. In the repository go to **Settings → Pages → Build and deployment → Source: GitHub Actions**. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under **Settings → Secrets and variables → Actions**.
4. The workflow in `.github/workflows/deploy.yml` runs automatically on every push to `main`. It configures the GitHub Pages environment, builds a static export, creates a `404.html` fallback, and writes `.nojekyll` so `_next` assets load correctly on Pages. When it finishes (about 2 minutes, see the **Actions** tab) your site is live at `https://YOUR-USERNAME.github.io/careerforge/`.

Notes
- The base path is taken from the repository name automatically, so you can rename the repo without editing code.
- GitHub Pages serves static files only; the workflow removes the optional server AI route, so AI application plans are not available there. Authentication and learner data use Supabase directly.
- To preview the Pages build locally: `GITHUB_PAGES=true NEXT_PUBLIC_BASE_PATH=/Hackathon NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... npm run build` then `touch out/.nojekyll` and serve the `out` folder.

## Other hosting
- **Frontend:** GitHub Pages, Vercel, or another static-capable host.
- **Database and authentication:** Supabase Auth plus Supabase Postgres. Apply schema changes through versioned files in `supabase/migrations/`.

## Project layout
```
src/app/         App Router pages, metadata routes, and API route
src/components/  shared shell, navigation, and form components
supabase/        SQL migrations and row-level security policies
.github/workflows/  GitHub Pages deployment workflow
```
