# FitPlan — Code Blueprint (every file of the application)

> **Version:** 1.0 · **Date:** 27.10.2026 · **Status:** draft for approval by Jakub & Ran
> **Companion of:** `TECHNICAL_DESIGN.md` (the *why* at system level). This document is the *what, file by file*.
> **Rule:** no file is created that is not listed here. A new file = update this document first (one line is enough).

---

## 0. How to read this document

- Every table row = one file: **what it contains** (main functions/exports) and **why it exists**.
- **Sprint** column = when the file is created (S1, S2, S3). The data layer (`models/`) is complete in Sprint 1 for all services (hybrid approach, Technical Design §1.1).
- Files marked S2/S3 do not exist in the Sprint 1 code at all; the app shows only what is built (Technical Design §1.3).
- §9 shows how a real request travels through the files – the best way to check that the blueprint is complete.
- Function signatures are written as `name(params) → result`. They are the contract between layers; code must follow them.

### 0.1 Naming conventions
| Thing | Convention | Example |
|---|---|---|
| Folders | lowercase | `controllers/`, `abl/` |
| Backend modules | camelCase + layer suffix | `routineAbl.js`, `routineDao.js`, `routineController.js`, `routineRoutes.js` |
| Mongoose models | PascalCase, singular | `WorkoutRoutine.js` |
| React components & pages | PascalCase `.jsx` + optional `.module.css` with the same name | `RoutineCard.jsx`, `RoutineCard.module.css` |
| Hooks | `use` + PascalCase | `useRoutines.js` |
| Tests | `<subject>.<kind>.test.js` next to `tests/` | `routine.rules.test.js`, `routine.api.test.js` |
| Error codes | UPPER_SNAKE_CASE, prefix = entity | `ROUTINE_NOT_FOUND`, `SET_WEIGHT_OUT_OF_RANGE` |
| npm packages | `@fitplan/<name>` | `@fitplan/session` |

### 0.2 File count
| Part | Files | of which tests |
|---|---|---|
| Root + tooling | 11 | – |
| `packages/shared` | 9 | 2 |
| `services/gateway` | 16 | 3 |
| `services/routine` | 22 | 4 |
| `services/session` | 31 | 8 |
| `services/audit` | 14 | 3 |
| `apps/web` | ≈ 100 (about half are small `.module.css` files) | 4 |
| `e2e` | 7 | 5 |

The app is small; most files are 20–120 lines. Many files is a consequence of the layering, not of complexity.

---

## 1. Repository root

```
fitplan/
├── package.json
├── package-lock.json
├── .nvmrc
├── .gitignore
├── .editorconfig
├── .prettierrc.json
├── .prettierignore
├── eslint.config.js
├── render.yaml
├── README.md
├── docs/
├── postman/
├── apps/  services/  packages/  e2e/
```

| File | Contains | Why | Sprint |
|---|---|---|---|
| `package.json` | `"workspaces": ["apps/*", "services/*", "packages/*", "e2e"]`; scripts `dev` (all at once via `concurrently`), `test`, `lint`, `format`; devDependencies ESLint, Prettier, concurrently | one `npm install` and one `npm run dev` for the whole project | S1 |
| `package-lock.json` | exact versions of all dependencies (generated) | the same versions on both laptops and on Render (`npm ci`) | S1 |
| `.nvmrc` | `24` | everyone (and Render) uses Node 24 | S1 |
| `.gitignore` | `node_modules`, `.env`, `dist`, `coverage`, `playwright-report` | secrets and generated files never reach Git | S1 |
| `.editorconfig` | 2 spaces, LF, UTF-8 | same formatting in any editor | S1 |
| `.prettierrc.json` | `{ "singleQuote": false, "semi": true, "printWidth": 100 }` | automatic formatting → clean diffs | S1 |
| `.prettierignore` | `docs/`, `package-lock.json` | the design documents are copies and keep their own table layout | S1 |
| `eslint.config.js` | recommended JS rules + React hooks rules for `apps/web` | catches typical bugs (unused vars, missing hook deps) | S1 |
| `render.yaml` | web services (S1 gateway + routine, S2 + session, S3 + audit): build/start commands, build filters, health check path, region Frankfurt; `INTERNAL_KEY` (env group `fitplan-internal`) and `JWT_SECRET` are `generateValue: true` (Render creates them, nobody copies them); `MONGODB_URI` per service `sync: false` (entered once in Render) | Render infrastructure as code (Technical Design §10.2) | S1 (gateway, routine) → S2 (session) → S3 (audit) |
| `README.md` | what FitPlan is, how to install and run in 5 commands, links to docs | first thing the teacher / Ran sees in the repo | S1 |
| `docs/` | `TECHNICAL_DESIGN.md`, `CODE_BLUEPRINT.md`, user stories, diagrams | documentation lives next to the code it describes | S1 |
| `postman/FitPlan.postman_collection.json` | every API request with example bodies and tests; environment variable `baseUrl` | Ran's API verification (owned by Ran) | S1–S3 |
| `postman/FitPlan.local.postman_environment.json` | `baseUrl = http://localhost:3000/api`, `token` | switch between local and deployed API | S1 |

---

## 2. `packages/shared` — code used by all backend parts

Only code that is **identical in every service and security-relevant** lives here. Business logic is never shared.

```
packages/shared/
├── package.json
├── src/
│   ├── index.js
│   ├── errors.js
│   ├── errorHandler.js
│   ├── internalAuth.js
│   ├── auditClient.js
│   └── healthRoute.js
└── tests/
    ├── errorHandler.test.js
    └── internalAuth.test.js
```

| File | Contains | Why | Sprint |
|---|---|---|---|
| `package.json` | name `@fitplan/shared`, `"type": "module"`, `"exports": "./src/index.js"` | services import it as `import { AppError } from "@fitplan/shared"` | S1 |
| `src/index.js` | re-exports everything below | one import path | S1 |
| `src/errors.js` | `class AppError(status, code, message, details?)`; helpers `badRequest(code, msg, details)`, `unauthorized(code, msg)`, `notFound(code)`, `conflict(code, msg, details)`, `serviceUnavailable(code)` | ABL throws meaningful errors without knowing HTTP details | S1 |
| `src/errorHandler.js` | Express error middleware `errorHandler(err, req, res, next)`: `AppError` → its status; Mongoose `ValidationError` → 400 `VALIDATION_FAILED`; `CastError` (bad id) → 404; `E11000` → 409 `DUPLICATE`; else 500 `INTERNAL_ERROR` (logs stack, never sends it) | the uniform error JSON (Technical Design §9.1) in one place | S1 |
| `src/internalAuth.js` | `internalAuth({ key })` → middleware: rejects requests without the correct `x-internal-key` (401 `INTERNAL_AUTH_FAILED`); copies `x-user-id` to `req.userId` | services trust only the gateway (Technical Design §6.1) | S1 |
| `src/auditClient.js` | `createAuditClient({ url, key, service })` → `{ send(eventType, { userId, entityType, entityId, payload }) }`; `send` calls `fetch` **without await**, `.catch(console.error)`; does nothing if `url` is empty (tests) | fire-and-forget audit events (Technical Design §6.4) | S1 (stub), S3 (used) |
| `src/healthRoute.js` | `healthRoute(mongoose?)` → router with `GET /health` returning `{ status: "ok", db: "up" \| "down" }` | same health endpoint for Render checks and warm-up | S1 |
| `tests/errorHandler.test.js` | each error type → expected status + JSON shape | the error contract is tested once | S1 |
| `tests/internalAuth.test.js` | missing key → 401, wrong key → 401, correct key → `req.userId` set | the most important security check is tested | S1 |

---

## 3. `services/gateway` — API Gateway (:3000)

```
services/gateway/
├── package.json
├── .env.example
├── src/
│   ├── server.js
│   ├── app.js
│   ├── config.js
│   ├── auth/
│   │   ├── googleVerifier.js
│   │   ├── jwt.js
│   │   ├── authController.js
│   │   └── authRoutes.js
│   ├── middleware/
│   │   ├── requireAuth.js
│   │   └── rateLimits.js
│   ├── proxy/
│   │   └── serviceProxy.js
│   └── health/
│       └── healthRoutes.js
└── tests/
    ├── auth.api.test.js
    ├── proxy.api.test.js
    └── jwt.test.js
```

| File | Contains | Why | Sprint |
|---|---|---|---|
| `package.json` | name `@fitplan/gateway`; deps express, http-proxy-middleware, google-auth-library, jsonwebtoken, helmet, cors, express-rate-limit, @fitplan/shared; scripts `dev` (`node --watch --env-file=.env src/server.js`), `start`, `test` | | S1 |
| `.env.example` | `PORT, JWT_SECRET, GOOGLE_CLIENT_ID, CORS_ORIGIN, INTERNAL_KEY, ROUTINE_URL, SESSION_URL, AUDIT_URL` (names only) | documents required configuration without secrets | S1 |
| `src/server.js` | `import app from "./app.js"; app.listen(config.port)` – nothing else | start-up separated from the app so tests can import the app without opening a port | S1 |
| `src/app.js` | `createApp()` – middleware in the exact order of Technical Design §5.4: helmet → cors → rate limits → `/api/health` → `/api/auth` → `requireAuth` → proxy → 404 → `errorHandler` | the whole request pipeline readable in one file | S1 |
| `src/config.js` | reads `process.env`, throws a clear error if a required variable is missing, exports a frozen object `{ port, jwtSecret, googleClientId, corsOrigin, internalKey, services: { routine, session, audit } }` | fail fast at start, not in the middle of a demo | S1 |
| `src/auth/googleVerifier.js` | `verifyGoogleCredential(credential) → { sub, email, name, picture }` using `OAuth2Client.verifyIdToken({ idToken, audience })`; throws 401 `GOOGLE_TOKEN_INVALID` | wraps the Google library → easy to mock in tests | S1 |
| `src/auth/jwt.js` | `signToken(user) → string` (HS256, `expiresIn: "7d"`); `verifyToken(token) → payload` (throws 401 `TOKEN_INVALID` / `TOKEN_EXPIRED`) | the only place that knows `JWT_SECRET` | S1 |
| `src/auth/authController.js` | `loginWithGoogle(req, res)`: verify credential → sign JWT → send `USER_LOGGED_IN` audit event → `{ token, user }`; `me(req, res)` → `{ user }` | the login use case | S1 |
| `src/auth/authRoutes.js` | `POST /google` → `loginWithGoogle` (with `express.json()` + strict rate limit); `GET /me` → `requireAuth`, `me` | URL mapping for auth | S1 |
| `src/middleware/requireAuth.js` | reads `Authorization: Bearer …`, `verifyToken`, sets `req.user = { id, name, email, picture }`; else 401 `AUTH_REQUIRED` | protects everything after it | S1 |
| `src/middleware/rateLimits.js` | `generalLimiter` (300 / 15 min), `authLimiter` (20 / 15 min); JSON error `RATE_LIMITED` | flood / brute-force protection | S1 |
| `src/proxy/serviceProxy.js` | `ROUTES` table (Technical Design §5.2) and `buildProxies(config)` → array of `[prefix, middleware]`; each proxy: strips `/api`, sets `x-user-id = req.user.id`, `x-internal-key`, removes `Authorization`; on target error → 503 `SERVICE_UNAVAILABLE` | the routing table is data, not scattered code | S1 (routine), S2 (session), S3 (audit) |
| `src/health/healthRoutes.js` | `GET /api/health` → ok; `GET /api/health/services` → calls `/health` of all 3 services in parallel (`Promise.allSettled`, 60 s timeout) → status per service | warm-up before demos (Technical Design §10.6) | S1 |
| `tests/jwt.test.js` | sign → verify round-trip; expired token; wrong secret | | S1 |
| `tests/auth.api.test.js` | Supertest with mocked `googleVerifier`: valid credential → token; invalid → 401; `/me` without token → 401 | | S1 |
| `tests/testConfig.js` | `testConfig(services)` → frozen config with test secrets | tests build the app without real env vars | S1 |
| `tests/proxy.api.test.js` | a tiny fake service records received headers: `x-user-id` and `x-internal-key` present, `Authorization` removed, `/api` stripped; no token → 401 | proves identity forwarding | S1 |

---

## 4. Common layout of a backend service

`routine`, `session` and `audit` share these files (content differs only in names/routes):

| File | Contains | Why |
|---|---|---|
| `package.json` | name `@fitplan/<service>`; deps express, mongoose, helmet, @fitplan/shared; scripts `dev`, `start`, `test` (+ `seed` in routine) | |
| `.env.example` | `PORT, MONGODB_URI, INTERNAL_KEY, AUDIT_URL` (+ `ROUTINE_URL` in session) | |
| `src/server.js` | `await connectDb(config.mongoUri); createApp().listen(config.port)`; graceful shutdown on SIGTERM (Render sends it on redeploy) | start-up only |
| `src/app.js` | `createApp()`: helmet → `healthRoute` → `internalAuth` → `express.json()` → routers → 404 → `errorHandler` | pipeline in one place, importable by tests |
| `src/config.js` | validated env vars, frozen object | fail fast |
| `src/db.js` | `connectDb(uri)`, `disconnectDb()` using Mongoose; `autoIndex: true` so indexes (incl. R-3) are created | the only place that opens the connection |
| `tests/setup.js` | starts `mongodb-memory-server`, connects, clears collections between tests, stops at the end | tests never touch Atlas |
| `scripts/syncIndexes.js` | connects with `MONGODB_URI`, `syncIndexes()` for each model of the service, prints the index names; `npm run db:indexes -w @fitplan/<service>` | creates the indexes (incl. R-3) on Atlas already in the sprint where the data layer is built, before the service has a server |
| `tests/models.test.js` | schema tests without HTTP (routine: R-1 0/1/15/16, repMin ≤ repMax, unique exercise name, idempotent seed upsert) | proves the data layer before any endpoint |

---

## 5. `services/routine` — Routine Service (:3001)

```
services/routine/
├── package.json · .env.example
├── src/
│   ├── server.js · app.js · config.js · db.js
│   ├── models/
│   │   ├── Exercise.js
│   │   └── WorkoutRoutine.js
│   ├── dao/
│   │   ├── exerciseDao.js
│   │   └── routineDao.js
│   ├── abl/
│   │   ├── exerciseAbl.js
│   │   └── routineAbl.js
│   ├── controllers/
│   │   ├── exerciseController.js
│   │   └── routineController.js
│   └── routes/
│       ├── exerciseRoutes.js
│       └── routineRoutes.js
├── seed/
│   ├── exercises.json
│   └── seed.js
├── scripts/
│   └── syncIndexes.js
└── tests/
    ├── setup.js
    ├── routine.rules.test.js
    ├── routine.api.test.js
    ├── exercise.api.test.js
    ├── models.test.js
    └── helpers.js
```

| File | Contains | Why | Sprint |
|---|---|---|---|
| `models/Exercise.js` | schema per Technical Design §7.1; enums `CATEGORIES`, `EQUIPMENT` exported; index `{category, name}` | catalog structure | S1 |
| `models/WorkoutRoutine.js` | `RoutineItemSchema` (exerciseId, exerciseName, order, targetSets 1–10, repMin/repMax 1–50 with `repMin ≤ repMax` validator, restSeconds 0–600) + `WorkoutRoutineSchema` (userId, name 1–60, exercises with **R-1 validator 1–15**); constant `MAX_EXERCISES = 15` | R-1 at database level | S1 |
| `dao/exerciseDao.js` | `list({ category, q })` (q = case-insensitive name search), `getById(id)`, `getManyByIds(ids)`, `upsertByName(exercise)` (for seed) | only place querying exercises | S1 |
| `dao/routineDao.js` | `listByUser(userId)`, `getByIdForUser(userId, id)`, `create(doc)`, `updateForUser(userId, id, doc)`, `deleteForUser(userId, id)` – every function filters by `userId` | user scoping guaranteed by construction | S1 |
| `abl/exerciseAbl.js` | `list(filters)`, `get(id)` → 404 `EXERCISE_NOT_FOUND` | thin, but keeps the layering consistent | S1 |
| `abl/routineAbl.js` | `list(userId)`, `get(userId, id)`, `create(userId, dto)`, `update(userId, id, dto)`, `remove(userId, id)`. Inside create/update: **R-1 check** → 400 `ROUTINE_EXERCISE_COUNT_INVALID`; load exercises by ids → unknown id → 400 `ROUTINE_EXERCISE_UNKNOWN`; fill `exerciseName` snapshot and `order`; after write → audit `ROUTINE_CREATED/UPDATED/DELETED` | **all routine business rules in one file** | S1 |
| `controllers/exerciseController.js` | `list(req, res)` (reads `req.query`), `get(req, res)` | HTTP ↔ ABL | S1 |
| `controllers/routineController.js` | `list`, `get`, `create` (201), `update`, `remove` (204) – each reads `req.userId`, `req.params`, `req.body` | HTTP ↔ ABL | S1 |
| `routes/exerciseRoutes.js` | `GET /exercises`, `GET /exercises/:id` | URL mapping | S1 |
| `routes/routineRoutes.js` | `GET/POST /routines`, `GET/PUT/DELETE /routines/:id` | URL mapping | S1 |
| `seed/exercises.json` | ~40 exercises `{ name, category, primaryMuscle, equipment }` – **content prepared by Ran** | catalog data versioned in Git | S1 |
| `seed/seed.js` | connects, `upsertByName` for each item, prints "inserted X / updated Y", disconnects; safe to run repeatedly | `npm run seed -w @fitplan/routine` | S1 |
| `tests/routine.rules.test.js` | R-1 boundaries 0/1/15/16; repMin > repMax → 400; unknown exercise → 400; name snapshot filled | business rules tested without HTTP | S1 |
| `tests/routine.api.test.js` | CRUD happy path; no internal key → 401; another user's routine → 404; delete → 204 then 404 | API contract | S1 |
| `tests/exercise.api.test.js` | list, filter by category, search `q`, unknown id → 404 | | S1 |
| `tests/helpers.js` | `INTERNAL_KEY`, `seedExercises(n, prefix)`, `item(exercise)` | the same test data in every routine test file | S1 |

---

## 6. `services/session` — Session Service (:3002)

```
services/session/
├── package.json · .env.example
├── src/
│   ├── server.js · app.js · config.js · db.js
│   ├── models/
│   │   ├── WorkoutSession.js
│   │   └── ProgressLog.js
│   ├── dao/
│   │   ├── sessionDao.js
│   │   ├── progressLogDao.js
│   │   └── analyticsDao.js
│   ├── domain/
│   │   └── epley.js
│   ├── abl/
│   │   ├── sessionAbl.js
│   │   ├── prAbl.js
│   │   ├── historyAbl.js
│   │   └── analyticsAbl.js
│   ├── clients/
│   │   └── routineClient.js
│   ├── controllers/
│   │   ├── sessionController.js
│   │   ├── progressController.js
│   │   └── analyticsController.js
│   └── routes/
│       ├── sessionRoutes.js
│       ├── progressRoutes.js
│       └── analyticsRoutes.js
└── tests/
    ├── setup.js
    ├── epley.test.js
    ├── pr.rules.test.js
    ├── session.rules.test.js
    ├── session.api.test.js
    ├── history.api.test.js
    └── analytics.api.test.js
```

| File | Contains | Why | Sprint |
|---|---|---|---|
| `models/WorkoutSession.js` | `PlanItemSchema`, `LoggedSetSchema` (**R-2 validator** `isInteger && > 0 && < 500`, reps 1–100, est1RM, isPR, prTypes, loggedAt), `WorkoutSessionSchema` (status enum, times, totals); indexes incl. **unique partial `{userId}` where `status: "active"` (R-3)**; constants `MIN_WEIGHT_KG = 0`, `MAX_WEIGHT_KG = 500` | R-2 and R-3 at database level | **S1** (data layer complete) |
| `models/ProgressLog.js` | schema per Technical Design §7.4; unique index `{userId, exerciseId}` | PR registry | **S1** |
| `dao/sessionDao.js` | `insertActive(doc)`, `findActive(userId)`, `getByIdForUser(userId, id)`, `pushSet(userId, sessionId, set)` (only if `status: "active"`, returns updated doc or null), `complete(userId, id, totals)`, `discard(userId, id)`, `listCompleted(userId, { page, limit })`, `countCompleted(userId)` | only place querying sessions | S2 |
| `dao/progressLogDao.js` | `findOne(userId, exerciseId)`, `createBaseline(doc)`, `raiseMaxWeight(userId, exerciseId, w, at, sessionId) → boolean` (`updateOne` with `maxWeightKg: { $lt: w }`), `raiseMaxEst1RM(…) → boolean` (same with `$lt`, plus `maxEst1RM: null` so a baseline from a set with > 12 reps can still be beaten), `listByUser(userId)` | **atomic conditional updates for R-4** | S2 |
| `dao/analyticsDao.js` | `exerciseSeries(userId, exerciseId, last)` – aggregation pipeline: `$match` completed sessions of user that contain the exercise → `$sort startTime desc` → `$limit last` → `$unwind sets` → `$match exerciseId` → `$group` by session (`max weightKg`, `max est1RM`, `sum weight×reps`, `anyElementTrue isPR`) → `$sort` by date ascending | the only aggregation, isolated | S3 |
| `domain/epley.js` | `estimate1RM(weightKg, reps) → number \| null` (reps 1 → weight; 2–12 → `w × (1 + reps/30)` rounded to 0.1; > 12 → null) | **pure function**, no DB → trivially testable; the formula exists in exactly one place | S2 |
| `abl/sessionAbl.js` | `start(userId, routineId)`: active exists → 409 `ACTIVE_SESSION_EXISTS`; `routineClient.getRoutine` → copy to `plan`; `insertActive` (E11000 → same 409); audit `SESSION_STARTED`. `getActive(userId)`. `logSet(userId, sessionId, { exerciseId, weightKg, reps })`: session must be active (else 409 `SESSION_NOT_ACTIVE`), exercise must be in `plan` (400 `SET_EXERCISE_NOT_IN_PLAN`), **R-2** (400 `SET_WEIGHT_OUT_OF_RANGE` / `SET_WEIGHT_NOT_WHOLE_KG`), `setNumber` = count + 1, `prAbl.evaluateSet`, `pushSet`; audit `SET_LOGGED` (+ `PR_ACHIEVED`). `finish(userId, id)`: totals, audit. `discard(userId, id)`: audit | **all workout rules (R-2, R-3) in one file** | S2 |
| `abl/prAbl.js` | `evaluateSet({ userId, exerciseId, exerciseName, sessionId, weightKg, reps, at }) → { est1RM, isPR, prTypes }` implementing Technical Design §8.4 (baseline on first set, then `raiseMaxWeight` / `raiseMaxEst1RM`); `listPRs(userId)` | **R-4 in one file** | S2 |
| `abl/historyAbl.js` | `list(userId, { page = 1, limit = 20 })` → `{ items: SessionSummary[], page, total }` (`prCount` = sets with isPR); `detail(userId, id)` → 404 `SESSION_NOT_FOUND` | US4 | S2 |
| `abl/analyticsAbl.js` | `exerciseProgress(userId, exerciseId, { last = 10 })` → `{ points }`; validates `last` 1–50 | US3 | S3 |
| `clients/routineClient.js` | `getRoutine(userId, routineId)` → `fetch(ROUTINE_URL/routines/:id)` with `x-internal-key`, `x-user-id`; 404 → 404 `ROUTINE_NOT_FOUND`; network error/timeout (10 s) → 503 `ROUTINE_SERVICE_UNAVAILABLE` | the only cross-service call, in one place | S2 |
| `controllers/sessionController.js` | `start` (201), `getActive` (200 or 204), `logSet` (201), `finish`, `discard`, `list`, `detail` | HTTP ↔ ABL | S2 |
| `controllers/progressController.js` | `listPRs` | HTTP ↔ ABL | S2 |
| `controllers/analyticsController.js` | `exerciseProgress` | HTTP ↔ ABL | S3 |
| `routes/sessionRoutes.js` | `POST /sessions`, `GET /sessions/active` (**before** `/:id`!), `POST /sessions/:id/sets`, `POST /sessions/:id/finish`, `POST /sessions/:id/discard`, `GET /sessions`, `GET /sessions/:id` | URL mapping | S2 |
| `routes/progressRoutes.js` | `GET /progress/prs` | | S2 |
| `routes/analyticsRoutes.js` | `GET /analytics/exercises/:exerciseId` | | S3 |
| `tests/models.test.js` | schema tests without HTTP: R-2 validator 0 / 1 / 499 / 500 / 82.5; R-3 unique partial index rejects a second active session; ProgressLog unique per (user, exercise) | proves the data layer in Sprint 1, before any endpoint | **S1** |
| `tests/epley.test.js` | 100×1 → 100; 100×8 → 126.7; 120×5 → 140; 60×15 → null; 100×12 → 140 | formula verified with the examples from the design | S2 |
| `tests/pr.rules.test.js` | first set = baseline (no PR); heavier → weight PR; same weight more reps → e1RM PR; equal → no PR; reps > 12 → only weight PR possible; two parallel heavier sets → exactly one PR | R-4 incl. race | S2 |
| `tests/session.rules.test.js` | R-2: 0/1/499/500/999/82.5; R-3: second start → 409; **two parallel starts → one 201, one 409**; discard frees R-3; logging into finished session → 409 | R-2, R-3 | S2 |
| `tests/session.api.test.js` | full flow start → log 3 sets → finish (volume, duration correct); routine service down → 503 (mocked client) | API contract | S2 |
| `tests/history.api.test.js` | only completed sessions, newest first, paging, other user's session → 404 | US4 | S2 |
| `tests/analytics.api.test.js` | 3 sessions → 3 points with correct top weight / 1RM / tonnage | US3 | S3 |

---

## 7. `services/audit` — Audit Log Service (:3003)

```
services/audit/
├── package.json · .env.example
├── src/
│   ├── server.js · app.js · config.js · db.js
│   ├── models/AuditEvent.js
│   ├── dao/auditDao.js
│   ├── abl/auditAbl.js
│   ├── controllers/auditController.js
│   └── routes/auditRoutes.js
└── tests/
    ├── setup.js
    └── audit.api.test.js
```

| File | Contains | Why | Sprint |
|---|---|---|---|
| `models/AuditEvent.js` | schema per Technical Design §7.5, all fields `immutable: true`; enum `EVENT_TYPES`; index `{userId, occurredAt: -1}` | immutability at schema level | **S1** (data layer) |
| `dao/auditDao.js` | `insert(event)`, `listByUser(userId, limit)` – **no update/delete functions exist** | immutability by design | S3 |
| `abl/auditAbl.js` | `record(dto)`: validates eventType is known (400 `AUDIT_EVENT_TYPE_UNKNOWN`), sets `occurredAt`; `listMine(userId, limit = 50)` (max 200) | | S3 |
| `controllers/auditController.js` | `record` (201), `listMine` | | S3 |
| `routes/auditRoutes.js` | `POST /events`, `GET /audit` | `/events` is not in the gateway table → internal only | S3 |
| `tests/models.test.js` | unknown event type rejected; fields cannot be changed after saving | immutability proven with the data layer | **S1** |
| `tests/audit.api.test.js` | record valid event → 201; unknown type → 400; no internal key → 401; list returns only own events, newest first; PUT/DELETE → 404 | | S3 |

> **Sprint 1 in `services/session` and `services/audit`:** only `package.json`, `.env.example`, `src/db.js`, `src/models/*`, `scripts/syncIndexes.js` and `tests/setup.js` + `tests/models.test.js` exist (complete data layer). `server.js`, `app.js`, routes and endpoints follow in the sprint where the service is deployed.

> `config.js` of the audit service has no `AUDIT_URL` (it does not audit itself).

---

## 8. `apps/web` — React SPA

```
apps/web/
├── package.json
├── index.html
├── vite.config.js
├── vercel.json
├── .env.example
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── api/ … context/ … hooks/ … routes/ … pages/ … components/ … styles/ … utils/ … test/
```

### 8.1 Configuration & entry

| File | Contains | Why | Sprint |
|---|---|---|---|
| `package.json` | name `@fitplan/web`; deps `react@18.3`, `react-dom@18.3`, `react-router-dom@6`, `@react-oauth/google`; devDeps vite, @vitejs/plugin-react, vitest, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, jsdom; scripts `dev`, `build`, `preview`, `test` | React 18 pinned | S1 |
| `index.html` | `<div id="root">`, viewport meta for mobile, theme-color `#0F172A`, title "FitPlan" | Vite entry | S1 |
| `vite.config.js` | React plugin; dev server port 5173; proxy `/api → http://localhost:3000`; Vitest config (`environment: "jsdom"`, `setupFiles: "src/test/setup.js"`) | no CORS issues locally; one config for build + tests | S1 |
| `vercel.json` | rewrites `/privacy` → `/privacy.html`, everything else → `/index.html` | reloading a deep link works on Vercel; the Google consent screen links to `/privacy` | S1 |
| `.env.example` | `VITE_API_URL=`, `VITE_GOOGLE_CLIENT_ID=` | | S1 |
| `public/favicon.svg` | FitPlan icon | | S1 |
| `public/privacy.html` | static privacy policy: what is stored (Google account id, routines, workouts, audit log), what is not, where (Vercel, Render, Atlas Frankfurt), how to delete | Google requires a privacy policy link for the published sign-in app | S1 |
| `src/main.jsx` | `createRoot` → `<GoogleOAuthProvider clientId>` → `<AuthProvider>` → `<BrowserRouter>` → `<App/>`; imports `tokens.css`, `global.css` | providers wired once | S1 |
| `src/App.jsx` | route table (Technical Design §4.2) with `<ProtectedRoute>` and `<AppShell>` | all URLs of the app in one place | S1 (login, routines) → S2 (workout, history) → S3 (progress) |

### 8.2 `src/api/` — the only place that talks to the backend

| File | Contains | Sprint |
|---|---|---|
| `client.js` | `request(method, path, body?) → data`; base URL from `VITE_API_URL`; adds Bearer token from `tokenStorage`; parses JSON; non-2xx → throws `ApiError { status, code, message, details }`; 401 → `onUnauthorized()` callback (logout); `204` → `null`; 502/503/504 without our JSON (Render waking up) → `SERVICE_UNAVAILABLE`, and a **GET** is retried every 5 s for up to 75 s (POST/PUT/DELETE never, they could be applied twice) | S1 |
| `client.test.js` | 502 then 200 → data after one retry; 504 for too long → `SERVICE_UNAVAILABLE`; POST is never repeated; our own error codes are kept | S1 |
| `ApiError.js` | `class ApiError extends Error` | S1 |
| `tokenStorage.js` | `getToken()`, `setToken(t)`, `clearToken()` (localStorage key `fitplan.token`) | S1 |
| `authApi.js` | `loginWithGoogle(credential)`, `getMe()`, `wakeUpServices()` | S1 |
| `exercisesApi.js` | `listExercises({ category, q })` | S1 |
| `routinesApi.js` | `listRoutines()`, `getRoutine(id)`, `createRoutine(dto)`, `updateRoutine(id, dto)`, `deleteRoutine(id)` | S1 |
| `sessionsApi.js` | `startSession(routineId)`, `getActiveSession()`, `logSet(sessionId, set)`, `finishSession(id)`, `discardSession(id)`, `listHistory(page)`, `getSession(id)` | S2 |
| `progressApi.js` | `listPRs()`, `getExerciseProgress(exerciseId, last)` | S2 (PRs) / S3 |

### 8.3 `src/context/`, `src/hooks/`, `src/routes/`

| File | Contains | Why | Sprint |
|---|---|---|---|
| `context/AuthContext.jsx` | `AuthProvider` (state `user`, `token`; `login(credential)`, `logout()`; restores user via `getMe()` on load); `useAuth()` | the only global state | S1 |
| `hooks/useAsync.js` | `useAsync(fn, deps) → { data, error, loading, reload }` | one loading/error pattern for all pages | S1 |
| `hooks/useExercises.js` | catalog with category filter + search (debounced 300 ms) | S1 |
| `hooks/useRoutines.js` | list + `create`, `update`, `remove` (reload after change) | S1 |
| `hooks/useActiveSession.js` | active session state; `start(routineId)`, `logSet(exerciseId, weightKg, reps)` (optimistic "saving…" row, then server result with PR flag), `finish()`, `discard()`; pre-fill values from the last set or routine target | the < 3 s logging logic | S2 |
| `hooks/useHistory.js` | paged history + `loadMore()` | S2 |
| `hooks/useProgress.js` | PR list + series for the selected exercise | S3 |
| `routes/ProtectedRoute.jsx` | no user → `<Navigate to="/login">` | S1 |

### 8.4 `src/pages/` — one file per URL (each with a `.module.css`)

| File | Contains | US | Sprint |
|---|---|---|---|
| `LoginPage.jsx` | app name + one-line vision, `<GoogleLogin>` button, calls `wakeUpServices()` on mount and shows "Waking up the server…" if slow | – | S1 |
| `RoutinesPage.jsx` | list of `RoutineCard`, "Create routine" button, `UnfinishedSessionBanner` (S2) | US1 | S1 |
| `RoutineEditorPage.jsx` | `RoutineBuilder` for new/edit (id from URL), save → back to list | US1 | S1 |
| `WorkoutPage.jsx` | `SessionHeader` + one `ExerciseBlock` per plan item + `FinishDialog`; no active session → redirect to `/routines` | US2 | S2 |
| `HistoryPage.jsx` | list of `SessionListItem`, "Load more" | US4 | S2 |
| `SessionDetailPage.jsx` | `SessionDetail` for `/history/:id` | US4 | S2 |
| `ProgressPage.jsx` | `ExerciseSelect` + `ProgressChart` + `PRSummaryGrid` | US3 | S3 |
| `NotFoundPage.jsx` | "Page not found" + link home | – | S1 |

### 8.5 `src/components/` (each `.jsx` has a `.module.css` with the same name)

| Folder / file | Contains | Sprint |
|---|---|---|
| `ui/Button.jsx` | variants primary / secondary / danger, loading state | S1 |
| `ui/NumberStepper.jsx` | number input (`inputmode="numeric"`) + configurable step buttons (e.g. −5/−1/+1/+5), min/max clamp | S1 |
| `ui/Modal.jsx` | accessible dialog (focus, Esc to close) | S1 |
| `ui/Badge.jsx` | small label (category, "PR") | S1 |
| `ui/Spinner.jsx` | loading indicator | S1 |
| `ui/ErrorMessage.jsx` | shows `ApiError` via `errorMessages.js` + "Try again" | S1 |
| `ui/EmptyState.jsx` | "No routines yet" style placeholder with action | S1 |
| `layout/AppShell.jsx` | page frame: header with user avatar + logout, content, `NavBar` | S1 |
| `layout/NavBar.jsx` | bottom tab bar on mobile / side links on desktop; `TABS` array grows per sprint: S1 Routines → S2 + Workout, History → S3 + Progress (Technical Design §1.3); hidden on `/workout` (focus mode) | S1 |
| `routines/RoutineCard.jsx` | routine name, exercise count, actions Edit / Delete; **Start workout** button added in S2 (not shown before) | S1 |
| `routines/RoutineBuilder.jsx` | name field, list of `RoutineItemEditor`, "Add exercise" opens `ExercisePicker`; client-side R-1 hint (counter "3 / 15", save disabled at 0) | S1 |
| `routines/RoutineItemEditor.jsx` | one exercise in the routine: target sets, rep range, rest, move up/down, remove | S1 |
| `routines/ExercisePicker.jsx` | modal with category filter + search over the catalog | S1 |
| `session/UnfinishedSessionBanner.jsx` | "Unfinished workout from <date> — Continue / Finish / Discard" (R-3 UX) | S2 |
| `session/SessionHeader.jsx` | routine name, running timer, Finish button | S2 |
| `session/ExerciseBlock.jsx` | exercise name, target, logged `SetRow`s, `SetInput` | S2 |
| `session/SetInput.jsx` | weight `NumberStepper` (−5/−1/+1/+5) + reps stepper + big "Log set" button; client-side R-2 hint | S2 |
| `session/SetRow.jsx` | "Set 2 · 120 kg × 8 · e1RM 152" + `PRBadge` | S2 |
| `session/PRBadge.jsx` | gold badge "PR" with tooltip "weight" / "1RM" | S2 |
| `session/FinishDialog.jsx` | summary (sets, volume, duration, PRs) + confirm | S2 |
| `history/SessionListItem.jsx` | date, routine, duration, volume, PR count | S2 |
| `history/SessionDetail.jsx` | sets grouped by exercise | S2 |
| `analytics/ExerciseSelect.jsx` | dropdown of exercises the user has trained | S3 |
| `analytics/ProgressChart.jsx` | hand-written SVG line chart (Technical Design §4.6), PR points gold, empty state < 2 points | S3 |
| `analytics/PRSummaryGrid.jsx` | card per exercise: best weight, best e1RM, date | S3 |

### 8.6 `src/styles/`, `src/utils/`, tests

| File | Contains | Sprint |
|---|---|---|
| `styles/tokens.css` | CSS variables from the blueprint (colors, fonts, spacing, radius) | S1 |
| `styles/global.css` | reset, body font, dark background, focus outlines | S1 |
| `utils/format.js` | `formatDate`, `formatDuration(sec)`, `formatRest(sec)` ("1:30"), `formatKg(n)` | S1 |
| `utils/errorMessages.js` | map error code → friendly English text (e.g. `ROUTINE_EXERCISE_COUNT_INVALID` → "A routine needs 1–15 exercises.") | S1 |
| `test/setup.js` | Testing Library `jest-dom` matchers, `cleanup` after each test | S1 |
| `components/routines/RoutineBuilder.test.jsx` | save disabled with 0 exercises; counter stops at 15 | S1 |
| `components/session/SetInput.test.jsx` | stepper changes weight by ±1/±5; cannot go ≤ 0 or ≥ 500 | S2 |
| `components/analytics/ProgressChart.test.jsx` | renders one circle per point; gold for PR | S3 |
| `utils/format.test.js` | duration and date formatting | S1 |

---

## 9. `e2e/` — end-to-end tests (Sprint 3)

| File | Contains |
|---|---|
| `package.json` | name `@fitplan/e2e`, devDep `@playwright/test`, script `test` |
| `playwright.config.js` | `baseURL` from env (local or deployed), mobile viewport (iPhone 13) |
| `tests/us1-routines.spec.js` | create routine with 3 exercises, edit, delete |
| `tests/us2-workout.spec.js` | start workout, log sets, see PR badge, finish |
| `tests/us3-progress.spec.js` | progress chart shows points after 2 workouts |
| `tests/us4-history.spec.js` | finished workout appears in history with details |
| `tests/auth.setup.js` | the Google popup cannot be automated, so the test signs a JWT with the test `JWT_SECRET` (from env, never committed) and puts it into localStorage before the tests – the gateway accepts it like a normal login |

---

## 10. How a request travels through the files

### 10.1 Create a routine (US1, R-1)
```
RoutineBuilder.jsx  (Save clicked)
 → RoutineEditorPage.jsx → useRoutines.create(dto)
 → routinesApi.createRoutine(dto) → client.request("POST", "/routines", dto)
 ── HTTPS ──▶ gateway: app.js → rateLimits → requireAuth (JWT → req.user)
 → serviceProxy  (/api stripped, x-user-id + x-internal-key added)
 ── HTTPS ──▶ routine: app.js → internalAuth (req.userId) → express.json
 → routineRoutes  POST /routines → routineController.create
 → routineAbl.create(userId, dto)   ← R-1 check, exercises exist, name snapshots
     → exerciseDao.getManyByIds(ids)
     → routineDao.create(doc)        ← WorkoutRoutine schema validates R-1 again
     → auditClient.send("ROUTINE_CREATED")   (not awaited)
 ← 201 JSON ← controller ← gateway ← client.js → hook reloads list → RoutinesPage
```

### 10.2 Log a set (US2, R-2, R-4)
```
SetInput.jsx ("Log set") → useActiveSession.logSet(exerciseId, 120, 8)  (shows "saving…")
 → sessionsApi.logSet(id, set) → client.request("POST", "/sessions/:id/sets")
 ── gateway (as above) ──▶ session: internalAuth → sessionRoutes → sessionController.logSet
 → sessionAbl.logSet(userId, sessionId, set)
     → sessionDao.getByIdForUser        (must be active, exercise in plan)
     → R-2 check                        (0 < 120 < 500, integer)
     → prAbl.evaluateSet(...)
         → epley.estimate1RM(120, 8) = 152.0
         → progressLogDao.findOne / raiseMaxWeight / raiseMaxEst1RM   (atomic $lt)
     → sessionDao.pushSet(...)          (only if still active)
     → auditClient.send("SET_LOGGED"), ("PR_ACHIEVED")
 ← 201 { set, isPR, prTypes } → useActiveSession replaces "saving…" row → SetRow + PRBadge
```

### 10.3 Start a workout (US2, R-3)
```
RoutineCard.jsx ("Start workout") → useActiveSession.start(routineId)
 → sessionsApi.startSession → gateway → session: sessionController.start
 → sessionAbl.start(userId, routineId)
     → sessionDao.findActive            (exists → 409 ACTIVE_SESSION_EXISTS)
     → routineClient.getRoutine ── HTTPS ──▶ routine service GET /routines/:id
     → sessionDao.insertActive          (unique partial index → E11000 → 409)
     → auditClient.send("SESSION_STARTED")
 ← 201 session → navigate("/workout")
```

---

## 11. Build order inside Sprint 1 (what Jakub writes first)

| Step | Files | Done when |
|---|---|---|
| 1 | root files, `packages/shared` | `npm install` works, shared tests green |
| 2 | **all `models/`** of routine, session, audit + `db.js` | schemas load, indexes created on Atlas (incl. R-3 partial index) |
| 3 | routine: dao → abl → controllers → routes → seed | routine tests green, catalog seeded |
| 4 | gateway: config, jwt, googleVerifier, auth, requireAuth, proxy, health | gateway tests green, Postman login works |
| 5 | web: config, api, AuthContext, LoginPage, AppShell | Google login works locally |
| 6 | web: routines pages & components | US1 works end-to-end locally |
| 7 | `render.yaml`, Vercel project, Atlas users, Google origins | US1 works on the public URL |
| 8 | Ran: Postman collection + manual QA; fixes | ready for demo 23.11. |

---

## 12. Approval

| | Name | Date | Signature / OK |
|---|---|---|---|
| Lead Developer | Jakub Kalina | | |
| Lead Analyst & QA | Ran Regev | | |
