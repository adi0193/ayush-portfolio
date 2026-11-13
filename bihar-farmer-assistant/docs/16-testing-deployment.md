# 16. Testing Strategy · 17. Deployment

## 16.1 Test layers
| Layer | Tool | What | Status |
|---|---|---|---|
| Unit | Vitest | NLU (intents, Bhojpuri variants, numbers in Devanagari digits, land units), safety filters, mandi parsing/staleness, weather alert thresholds | ✅ `server/test/*.test.ts` |
| API/integration | Vitest + Supertest | Spec dialogues (yellow paddy, scheme eligibility), no fabrication when data is missing, OTP warning, LLM dose stripping (fake LLM), validation, consent, admin auth | ✅ 33 tests pass |
| E2E (mobile) | Playwright, Pixel 5 profile | Profile → ask (2-turn diagnosis) → mandi via voice → weather → schemes. No console errors, no horizontal overflow | ✅ Run manually for this delivery (script in the delivery notes). Move it into the repo CI next |
| Contract | Recorded fixtures of OGD/Open-Meteo responses | Detect schema drift upstream | ➜ M2 |
| Safety red-team | Curated set of 200 risky prompts (doses, banned pesticides, guaranteed income, OTP scams, prompt injection) | Assert no dose, no promise, `no_data` on unknowns | ➜ M1 (seeded by current tests) |
| Speech | Bhojpuri benchmark (see 11.4) | WER/intent accuracy per district/gender | ➜ M1 |
| Field usability | Moderated sessions with 12 farmers | Task success without help, time-to-answer | ➜ M0/M3 |
| Performance | k6 | 50 rps, p95 < 800 ms non-LLM | ➜ M2 |
| Accessibility | axe + manual TalkBack | Contrast, labels, focus | ➜ M2 |

Run:
```bash
cd server && npm test && npm run typecheck
cd ../web && npm run build
```

## 17. Deployment

### Local
From the project root:

```bash
npm run setup
```

```bash
cp server/.env.example server/.env
```

```bash
npm run dev
```

The API runs on :8080 and the app on http://localhost:5173 (it proxies `/api`). For a production-style single process, run `npm run build` then `npm start` (http://localhost:8080). Voice input needs Chrome/Edge over `https://` or `localhost`.

### Docker (single host)
```bash
cd bihar-farmer-assistant
docker compose up --build   # web on :8081 (nginx serving the PWA + proxying /api), api internal
```
See `docker-compose.yml`, `server/Dockerfile`, `web/Dockerfile`, `web/nginx.conf`.

### Production checklist
1. HTTPS (required for the microphone and service worker). India region hosting (Mumbai/Hyderabad) for latency and data residency.
2. Secrets in the platform's secret manager: `DATA_GOV_IN_API_KEY`, `ANTHROPIC_API_KEY`, `ADMIN_TOKEN` (≥ 32 random chars).
3. Fixed egress IP → register it for IMD API whitelisting.
4. Postgres + PostGIS from `db/schema.sql`; Redis for caches (swap the `TtlCache` implementation).
5. Uptime check on `/api/health`. Alert if `integrations.mandi` ≠ `configured` or the median mandi age is over 3 days.
6. CDN for static assets; `Cache-Control: immutable` on hashed assets; no caching of `/api/mandi` and `/api/weather`.
7. Run tests in CI (GitHub Actions: `npm ci && npm test && npm run build` for both packages).
