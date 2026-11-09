# FitPlan

Mobile-first web app for planning workouts, logging sets in the gym and seeing personal records.
BPMI semester project, Unicorn University (Jakub Kalina, Ran Regev, Vitalik Holoienko).

## Structure

```
apps/web           React SPA (Vercel): Google sign-in, workout routines
services/gateway   API gateway (Vercel): Google login -> own JWT, rate limits, proxy to services
services/routine   Routine Service (Vercel): exercise catalog + workout templates (fitplan_routine)
services/session   Session Service: data layer for workouts, sets, personal records (fitplan_session)
services/audit     Audit Log Service: data layer for the immutable event log (fitplan_audit)
packages/shared    errors, error handler, internal auth, audit client, health route
```

Features are added sprint by sprint; a page, tab or endpoint appears only when it works.

## Run locally

```bash
nvm use                                # Node 24
npm install                            # all workspaces at once
npm test                               # tests use an in-memory MongoDB, never Atlas
npm run dev                            # gateway :3000, routine :3001, web :5173
```

Every package with a server has a `.env.example`; copy it to `.env` and fill in the values.
`npm run seed -w @fitplan/routine` fills the exercise catalog, `npm run db:indexes -w @fitplan/<service>`
creates the indexes on Atlas. Secrets live only in `.env` files, which are never committed.

## Deployment

Every part is its own Vercel project, deployed from `main`: `apps/web`, `services/gateway` and
`services/routine` (Root Directory). A service runs as a Vercel function in Frankfurt (`fra1`):
`api/index.js` exports the Express app and `vercel.json` sends every path to it. Environment
variables are set in each Vercel project, never in Git.
