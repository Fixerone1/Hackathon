# CareerForge AI — Youth Economic Mobility Platform

> From employment readiness to economic independence.

A Next.js 14 (App Router) + TypeScript + Tailwind CSS prototype for the FNB App of the Year / UJ Business School hackathon.
The **70 / 15 / 15** framework drives everything: Employment readiness (70%), Money confidence (15%), Growth potential (15%), combined into one **Economic Mobility Score**.

## Run it

```bash
npm install
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
# Set SUPABASE_URL and SUPABASE_ANON_KEY in .env
npm run dev        # Next.js + FastAPI at http://localhost:3000
# production check
npm run build && npm start
```

Requires Node 18.17+ and Python 3.10+. Create a Supabase project before using signup, login, or saved progress.

### Supabase setup

1. Create a Supabase project and copy its Project URL and anon/public key into `.env` as `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Never use a service-role or secret key in this app.
2. In the Supabase SQL Editor, run [`supabase/migrations/20261023000000_learner_progress.sql`](supabase/migrations/20261023000000_learner_progress.sql). It creates the learner checklist table and row-level security policies.
3. In Supabase Authentication settings, set the site URL to `http://localhost:3000` for local development and configure email confirmation as required by your organization.
4. Run `npm run dev`. Create an account, confirm the email if enabled, and sign in. Checklist progress is saved per authenticated user.

For production, set `AUTH_COOKIE_SECURE=true`. Configure `AUTH_SERVICE_URL` to the HTTPS address of the deployed FastAPI service. Deploy the Next.js site to a server-capable host with the same environment variable and keep both services behind HTTPS.

### Optional: real AI feedback
The `/api/ai` endpoint can use Azure OpenAI when configured with the values in `.env.example`. Without those values it responds with a local-fallback marker. The current demo UI does not call this endpoint.

## Routes in this preview

- `/` is the public introduction page.
- `/signup` and `/login` use Supabase Auth through the Python service.
- `/app` is a protected learner dashboard. Checklist progress is persisted in Supabase and protected by row-level security.
- `/api/ai` is an optional server route. Without Azure OpenAI environment variables it returns `{ "text": null, "source": "local" }`; the current dashboard does not call it.

Authentication is delegated to Supabase; passwords are not stored by this application. Supabase Auth manages identities and sessions. The current Supabase migration stores checklist state only; add a migration and user-scoped RLS policies for every new personal-data table.

`prisma/schema.prisma` is a legacy planning artifact and is not applied by this application. Supabase migrations are the active database schema. The Python gateway has process-local request throttles for the demo; production deployments should also enforce rate limits at the hosting edge or through a shared limiter.

The AI route applies an in-memory rate limit and basic request-size and prompt-injection checks. These controls are demo-level and should be replaced with shared, production-grade controls before deployment to real users.

## Notes
- Colours follow the design note: Midnight `#0D1B2A`, Navy `#1B263B`, Emerald `#10B981`, background `#F8FAFC`, text `#111827`.

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
