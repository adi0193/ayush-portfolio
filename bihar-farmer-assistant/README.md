# Bihar Farmer Assistant · बिहार किसान सहायक

*खेती की सही जानकारी, अपनी भाषा में।*

A voice-first agricultural assistant for small and marginal farmers in Bihar. Farmers ask in **Bhojpuri or Hindi** and get spoken answers, with the source, date and confidence of every fact, and a hand-off to human experts when the app is unsure.

> **Status: MVP prototype – not ready for farmers yet.** Before any pilot:
> (1) at least 20 farmer interviews, (2) agronomist review of all content, (3) official checks of every scheme, (4) a Bhojpuri speech benchmark, and (5) a test of live data feeds from the deployment network. See [`docs/14-roadmap-metrics.md`](docs/14-roadmap-metrics.md).

## What works today (Phase 1 MVP)

| Capability | Notes |
|---|---|
| 🎤 Voice assistant (Bhojpuri/Hindi) | Browser speech-to-text (`hi-IN`) with a typing fallback. Spoken replies with replay and slow mode. Asks follow-up questions (crop age, standing water, land, registration). Optional Claude phrasing that may only use facts already retrieved |
| 🌦️ Weather + crop advisories | District-level 5-day forecast with rule-based alerts (heavy rain, heat, cold, wind, blight risk, spray window). Labelled as *not* official IMD |
| 💰 Mandi prices | AGMARKNET via the data.gov.in API. Nearby markets first, price date, stale flag, "wholesale ≠ farm-gate" note. **Never invents prices** |
| 🏛️ Government schemes | 10 schemes, each with all 10 required fields and a verification status. Conversational eligibility check and fraud/OTP warnings |
| 👤 Farmer profile | Stays on the device by default. Server copy only with consent. No Aadhaar. One-tap delete |
| 📘 Offline library, 👩‍🌾 expert help | Knowledge cached for offline use. Only verified national helplines are shown |

## Getting started

Requires **Node.js 20+** (22 recommended, see `.nvmrc`). Run all commands from this folder.

```bash
npm run setup
```

```bash
cp server/.env.example server/.env
```

Edit `server/.env` (all optional):
- `DATA_GOV_IN_API_KEY` turns on live mandi prices. Without it, the app says prices are unavailable.
- `ANTHROPIC_API_KEY` turns on AI-phrased answers. Without it, the built-in templates answer.
- `ADMIN_TOKEN` (12+ characters) protects the content-review endpoints.

**Develop** (API on :8080, app on http://localhost:5173 with hot reload):

```bash
npm run dev
```

**Production-style, one process** (the API also serves the built app at http://localhost:8080):

```bash
npm run build
```

```bash
npm start
```

**Checks:**

```bash
npm run typecheck
```

```bash
npm test
```

**Docker** (http://localhost:8081):

```bash
docker compose up --build
```

Voice input needs Chrome or Edge, served over `https://` or `localhost`.

### Scripts

| Command | What it does |
|---|---|
| `npm run setup` | Clean-installs `server/` and `web/` dependencies from their lockfiles |
| `npm run dev` | Runs API + web dev server together (Ctrl+C stops both) |
| `npm run build` | Compiles the API to `server/dist` and the PWA to `web/dist` |
| `npm start` | Runs the built API and serves `web/dist` from it |
| `npm test` / `npm run typecheck` | Server tests (33) / type checks for both packages |

### Moving this folder into its own repository

The folder is self-contained (no dependency on the parent repo):

```bash
cp -r bihar-farmer-assistant ~/bihar-farmer-assistant
```

```bash
cd ~/bihar-farmer-assistant && git init && git add . && git commit -m "Initial commit"
```

Once it is its own repo, `.github/workflows/ci.yml` runs setup, typecheck, tests and build on every push.

## Documentation (deliverables)

| # | Deliverable | File |
|---|---|---|
| 1 | Bihar agriculture research report | [docs/01-research-report.md](docs/01-research-report.md) |
| 2–3 | Personas & pain points · competitor/government platform analysis | [docs/02-personas-and-competitors.md](docs/02-personas-and-competitors.md) |
| 4–5 | PRD · MVP feature spec (problem, approach, data, failures, acceptance per feature) | [docs/04-prd-and-mvp-spec.md](docs/04-prd-and-mvp-spec.md) |
| 6–7 | User journeys · wireframes | [docs/06-user-journeys-and-wireframes.md](docs/06-user-journeys-and-wireframes.md) |
| 8, 11 | System architecture · AI & voice architecture | [docs/08-architecture-ai-voice.md](docs/08-architecture-ai-voice.md) |
| 9–10 | Database schema & ER diagram · API spec | [docs/09-database-and-api.md](docs/09-database-and-api.md), [db/schema.sql](db/schema.sql) |
| 12–13 | Data source inventory · security & privacy | [docs/12-data-sources-security.md](docs/12-data-sources-security.md) |
| 14 | Milestones, field research plan, metrics, sustainability | [docs/14-roadmap-metrics.md](docs/14-roadmap-metrics.md) |
| 15 | Working frontend & backend | [`web/`](web), [`server/`](server) |
| 16–17 | Testing strategy · deployment | [docs/16-testing-deployment.md](docs/16-testing-deployment.md) |

Screenshots: [`docs/screenshots/`](docs/screenshots).

## Layout

```
package.json      root scripts (setup/dev/build/start/test)
scripts/          dev.mjs (runs both servers), start.mjs (single-process production)
.github/          CI workflow (active when this folder is its own repo)
server/   Node + Express + TypeScript API
  src/data/        38 districts, crop lexicon, knowledge base, schemes (each with source + review status)
  src/services/    nlu, assistant (dialogue), retrieval, safety, mandi, weather, store
  src/providers/   LLM (Claude, optional) and speech interfaces
  test/            vitest + supertest
web/      React + Vite + Tailwind PWA (service worker, manifest)
db/       PostgreSQL + PostGIS production schema
docs/     research, product, architecture, plans
```
