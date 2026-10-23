# CareerForge AI — Youth Economic Mobility Platform

> From employment readiness to economic independence.

A Next.js 14 (App Router) + TypeScript + Tailwind CSS prototype for the FNB App of the Year / UJ Business School hackathon.
The **70 / 15 / 15** framework drives everything: Employment readiness (70%), Money confidence (15%), Growth potential (15%), combined into one **Economic Mobility Score**.

## Run it

```bash
npm install
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
cp .env.example .env
# Fill in the Supabase settings below before starting the app.
npm run dev
```

Requires Node 18.17+, Python 3.10+, and a Supabase project.

### Supabase setup

1. Create a Supabase project.
2. Copy its Project URL and anon/public key into local `.env` as `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Never use the service-role key. Do not commit `.env`.
3. In the Supabase SQL Editor, run these files in filename order:
   - [`supabase/migrations/20261023000000_learner_progress.sql`](supabase/migrations/20261023000000_learner_progress.sql)
   - [`supabase/migrations/20261023001000_learner_profiles.sql`](supabase/migrations/20261023001000_learner_profiles.sql)
   - [`supabase/migrations/20261023002000_account_privacy.sql`](supabase/migrations/20261023002000_account_privacy.sql)
4. Set the Supabase Auth Site URL to `http://localhost:3000` and allow that redirect URL.
5. Optionally set `ADMIN_EMAILS=you@example.com` in `.env` to allowlist an admin account. Admin status is checked on the Python server.
6. Run `npm run dev`, open `http://localhost:3000/signup`, create an account, confirm your email if prompted, and sign in.

The `.env.example` values are placeholders. Authentication and data storage return a configuration error until valid Supabase values and the migrations are installed.

**Production:** deploy Next.js and the Python service to server-capable hosts. Set `AUTH_SERVICE_URL` to the Python service’s HTTPS URL and set `AUTH_COOKIE_SECURE=true`. Add the production site URL to Supabase Authentication settings. Keep `.env` values out of source control.

### Optional: real AI feedback
The `/api/ai` endpoint can use Azure OpenAI when configured with the values in `.env.example`. Without those values it responds with a local-fallback marker. The current demo UI does not call this endpoint.

## Routes in this preview

- Public pages: `/`, `/how-it-works`, `/opportunities`, `/partners`, `/about`, `/privacy`, `/login`, `/signup`.
- `/signup` and `/login` use Supabase Auth through the Python service.
- `/app` is a protected dashboard with six primary sections. The current repo has a progressive profile, checklist, notification preferences, and empty verified-opportunity states.
- `/admin` is separate from learner navigation and requires an email in `ADMIN_EMAILS`.
- `/api/ai` is an optional server route. Without Azure OpenAI environment variables it returns `{ "text": null, "source": "local" }`; the current dashboard does not call it.

Authentication is delegated to Supabase; passwords are not stored by this application. Supabase Auth manages identities and sessions. The current migrations store learner profile, checklist, and email preferences with per-user row-level security. Consent is recorded at signup and per email category. Email sending is not implemented.

`prisma/schema.prisma` is a legacy planning artifact and is not applied by this application. Supabase migrations are the active database schema. The Python gateway has process-local request throttles for the demo; production deployments should also enforce rate limits at the hosting edge or through a shared limiter.

## Phase 1 scope and tests

The uploaded source did not include the previously described assessment, CV builder, interview coach, Skills Academy, salary planner, savings-goal, or idea-validator modules. Their routes are present but clearly marked unavailable; they have not been represented as working features. Opportunity connectors, eligibility scoring, pathways, application tracking, partner posting, email delivery, and admin review tools are future phases. No real listings or match claims are seeded.

The synthetic learner fixture is [`tests/fixtures/learner_profile.json`](tests/fixtures/learner_profile.json). Run the current Python tests with `python -m unittest discover -s tests -v`; frontend types/build use `npm run typecheck` and `npm run build`.

The AI route applies an in-memory rate limit and basic request-size and prompt-injection checks. These controls are demo-level and should be replaced with shared, production-grade controls before deployment to real users.

## Notes
- Palette: Sand White `#FDFBF7`, Deep Ocean Teal `#0F2E35`, Terracotta `#E05A36`, Sage `#E2ECE9`. Primary button text uses a darker Terracotta shade for contrast.

## Publish on GitHub (free, GitHub Pages)

GitHub Pages can only serve the static marketing export. It cannot run the Python authentication service, so signup, login, and learner data will not work on Pages. Use a server-capable deployment for the full application.

1. Create a new **public** repository on GitHub (for example `careerforge`).
2. Upload everything in this folder to it (or push with git):
   ```bash
   git init && git add . && git commit -m "CareerForge AI"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/careerforge.git
   git push -u origin main
   ```
3. In the repository go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` runs automatically on every push to `main`. When it finishes (about 2 minutes, see the **Actions** tab) your site is live at `https://YOUR-USERNAME.github.io/careerforge/`.

Notes
- The base path is taken from the repository name automatically, so you can rename the repo without editing code.
- GitHub Pages serves static files only, so its build removes server API routes and does not provide authentication or saved learner data.
- To preview the Pages build locally: `STATIC_EXPORT=true NEXT_PUBLIC_BASE_PATH=/careerforge npm run build` then serve the `out` folder.

## Other hosting
- **Full application:** deploy Next.js to Vercel and the FastAPI service to a Python host such as Render or Azure App Service. Set `AUTH_SERVICE_URL` on the Next.js deployment to the FastAPI HTTPS URL and set Supabase credentials on the Python service.
- **Static marketing only:** GitHub Pages can host the exported public site, but not authentication or the private dashboard.
- **Database:** Supabase Auth plus the Supabase Postgres database. Apply schema changes through versioned files in `supabase/migrations/`.

## Project layout
```
src/app/         App Router pages, metadata routes, and API route
src/components/  shared shell, navigation, and form components
auth_service/    Python FastAPI auth and user-scoped data gateway
supabase/        SQL migrations and row-level security policies
.github/workflows/  GitHub Pages deployment workflow
```
