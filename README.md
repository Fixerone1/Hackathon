# CareerForge AI — Youth Economic Mobility Platform

> From employment readiness to economic independence.

A Next.js 14 (App Router) + TypeScript + Tailwind CSS prototype for the FNB App of the Year / UJ Business School hackathon.
The **70 / 15 / 15** framework drives everything: Employment readiness (70%), Money confidence (15%), Growth potential (15%), combined into one **Economic Mobility Score**.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
# production check
npm run build && npm start
```

Requires Node 18.17+ . No database or API key is needed for the demo.

### Optional: real AI feedback
Copy `.env.example` to `.env.local` and fill in your Azure OpenAI values. Without them the app uses built-in local coaching rules (`src/lib/coach.ts`) and everything still works.

## Site map and navigation

**Public (visitors)**: `/` Home · `/how-it-works` · `/opportunities` (browse, filter, search) · `/partners` (analytics demo for banks/universities/NGOs) · `/about` (+ privacy, contact) · `/login` · `/signup`

**Signed-in app (6 primary items, per the design note)**

| Menu | Pages |
|---|---|
| Dashboard `/app` | Score ring, pillar scores, next steps with points, journey stage, badges |
| Employment Hub | Overview · Assessment · CV builder · Interview coach · Opportunities · Skills Academy |
| Money Skills | Overview · Salary planner · Savings goals · Lessons |
| Growth Studio | Overview · Side hustles · Idea validator · Business tools (pricing, cash-flow) · Readiness checklist |
| Profile | Details, progress summary, achievements |
| Settings | Text size, high contrast, reduce motion, data export/delete |

Wayfinding aids: sticky sidebar (bottom tab bar on phones), section tabs, breadcrumbs, global search (press `/`), "next steps" cards, skip-to-content links, footer sitemap.

## How the score works (`src/lib/scoring.ts`)
Every action has a weight inside its pillar and a progress value 0–1. Pillar score = weighted progress. Overall = 0.70·Employment + 0.15·Money + 0.15·Growth. "Next steps" show the actions worth the most overall points.

## Security (what is real in this demo vs. production)

| Feature | In this repo | Production plan |
|---|---|---|
| Password storage | Salted PBKDF2-SHA256 (150k) hash in the browser, never plain text | Argon2id on the server (`prisma/schema.prisma` has `passwordHash`) |
| MFA | Demo one-time code shown on screen | Email/SMS OTP provider |
| Login throttling | 5 failures → 5-minute lock (client-side) | Server-side per-IP + per-account limits |
| Sessions | 12-hour local session | httpOnly cookie / JWT with refresh tokens |
| AI route | Rate limit 20/hr/IP, size caps, prompt-injection screening, audit log lines | Redis rate limiting, central audit log table |
| Headers | HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy | Add a strict CSP |
| Data isolation | Per-account storage key | PostgreSQL Row-Level Security |
| Uploads | No upload feature yet | Type/size checks + virus scanning |

**Important:** this prototype stores data in the user's browser (localStorage). That is fine for a demo, but it is **not** production-grade security. Do not collect real personal data until the server-side items above are built.

## Notes
- Opportunity listings, partner analytics numbers and employer names are **sample/demo data**, labelled as such in the UI.
- Lesson content is general education. Confirm current rules with CIPC, SARS, Seda, NYDA and sefa before giving legal or financial guidance.
- Voice input in the interview coach uses the browser Web Speech API (Chrome/Edge). Scores are rule-based (length, STAR structure, specifics, filler words), not tone-of-voice analysis.
- Colours follow the design note: Midnight `#0D1B2A`, Navy `#1B263B`, Emerald `#10B981`, background `#F8FAFC`, text `#111827`.

## Publish on GitHub (free, GitHub Pages)

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
- GitHub Pages serves static files only, so the optional `/api/ai` route is removed during the Pages build and the app uses its built-in local coaching. To use Azure OpenAI, deploy to Vercel or Azure instead (see below).
- To preview the Pages build locally: `STATIC_EXPORT=true NEXT_PUBLIC_BASE_PATH=/careerforge npm run build` then serve the `out` folder.
- Prefer no build tools? `careerforge.html` (delivered alongside this project) is a single-file version. Rename it to `index.html`, put it in a repository, and enable Pages from the `main` branch.

## Other hosting
- **Fast (MVP):** push to GitHub and import into Vercel.
- **Azure:** Azure Static Web Apps or App Service (Node), Azure OpenAI for the AI layer, Azure Database for PostgreSQL with the Prisma schema.

## Project layout
```
src/app          pages (public + /app) and /api/ai
src/components   shell, navigation, search, shared UI
src/lib          data, scoring, coaching rules, auth, store, AI client
prisma/          production database schema
```
