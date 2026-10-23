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
The `/api/ai` endpoint can use Azure OpenAI when configured with the values in `.env.example`. Without those values it responds with a local-fallback marker. The current demo UI does not call this endpoint.

## Routes in this preview

- `/` is the public introduction page.
- `/app` is an interactive starter dashboard with a checklist and progress indicator.
- `/signup` is a visual form. Account creation is not connected.
- `/api/ai` is an optional server route. Without Azure OpenAI environment variables it returns `{ "text": null, "source": "local" }`; the current dashboard does not call it.

The checklist exists in memory only and resets on reload. No account details or personal data are saved. The Prisma schema is a production data-model starting point, not a connected database.

The AI route applies an in-memory rate limit and basic request-size and prompt-injection checks. These controls are demo-level and should be replaced with shared, production-grade controls before deployment to real users.

## Notes
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
- GitHub Pages serves static files only, so the optional `/api/ai` route is removed during the Pages build. Deploy to a server-capable host such as Vercel or Azure to use that endpoint.
- To preview the Pages build locally: `STATIC_EXPORT=true NEXT_PUBLIC_BASE_PATH=/careerforge npm run build` then serve the `out` folder.

## Other hosting
- **Fast (MVP):** push to GitHub and import into Vercel.
- **Azure:** Azure Static Web Apps or App Service (Node), Azure OpenAI for the AI layer, Azure Database for PostgreSQL with the Prisma schema.

## Project layout
```
src/app/         App Router pages, metadata routes, and API route
src/components/  shared shell, navigation, and form components
prisma/          production database schema (not connected to the demo)
.github/workflows/  GitHub Pages deployment workflow
```
