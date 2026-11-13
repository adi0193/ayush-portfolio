# 14. Development Milestones · Field Research · Metrics · Sustainability

## 14.1 Status at this delivery
| Area | State |
|---|---|
| Desk research, personas (hypotheses), PRD, specs, architecture, schema, API | ✅ Done |
| Working MVP (5 capabilities) – server + PWA, 33 automated tests, mobile browser E2E | ✅ Done, demo-grade |
| Farmer interviews (≥ 20) | ❌ **Not done – must happen before the MVP is final** |
| Expert review of content, official scheme verification | ❌ Not done |
| Live AGMARKNET / Open-Meteo calls from a real environment | ❌ Not run (sandbox blocked egress) |
| Bhojpuri STT benchmark | ❌ Not run |

## 14.2 Milestones (team: 1 PM, 2 full-stack, 1 ML, 1 designer, part-time agronomist)

| # | Weeks | Milestone | Exit criteria |
|---|---|---|---|
| M0 | 0–3 | **Field research** in 5 districts (below). Apply for IMD whitelisting and a data.gov.in key. Sign MoUs with 2 KVKs | 20+ interviews written up. Personas and assumptions A1–A7 updated |
| M1 | 3–6 | Bhojpuri speech benchmark (300+ utterances). Expert review of all KB entries. Official scheme verification | Benchmark report. KB 100% `expert_reviewed`. Schemes `verified_official` |
| M2 | 6–9 | Postgres/Redis repositories, `/api/v1`, OpenAPI, IMD provider, observability. Expand KB to about 80 entries (zone × crop × stage) | Staging deployed. Load test 50 rps p95 < 800 ms (non-LLM) |
| M3 | 9–14 | **Closed pilot**: 200 farmers, 4 districts (Rohtas, Muzaffarpur, Madhubani, Purnia), with KVK partners | Metrics below collected weekly |
| M4 | 14–20 | Phase 2: photo diagnosis (with consent), crop calendars, audio library, expert referral queue | Pilot results reviewed. Go/no-go for a public beta |
| Phase 3 | 6–12 mo | FPO/buyer offers (verified), storage/transport discovery, community Q&A (moderated) | |
| Phase 4 | 12 mo+ | Maithili, Magahi, Angika voice. Regional model fine-tuning with university partners | |

## 14.3 Field research plan (M0)
- **Sample:** ≥ 24 farmers. Districts: Rohtas/Bhojpur (Bhojpuri, canal), West Champaran (Bhojpuri, sugarcane, flood), Muzaffarpur (litchi, flood), Madhubani or Darbhanga (Maithili, makhana), Gaya (Magahi, drought). **At least 8 women. At least 8 farmers with limited reading. At least 6 sharecroppers or tenants.** Plus 4 input dealers or traders, 3 KVK scientists, 2 *kisan salahkar*.
- **Method:** 45-min semi-structured interview in the farmer's language + a task test with the prototype (ask 3 questions by voice) + record utterances (with consent).
- **Guide (excerpt):** Who do you ask when the crop looks sick? · How did you decide your last fertiliser dose? · How do you learn the price before selling? · Tell me about the last flood or drought: what did you lose, what help did you get? · Have you applied for any scheme? What happened? · Who uses this phone? · Show me how you'd ask this app about your crop.
- **Ethics:** informed consent read aloud, ₹ compensation for time, no recording without consent, women interviewed by women researchers where preferred.

## 14.4 Success metrics (what usefulness actually looks like)
| Metric | Definition | Pilot target |
|---|---|---|
| Voice query success | Share of voice turns where the intent was right **and** the farmer didn't need to retype (sampled + labelled) | ≥ 75% |
| Bhojpuri STT accuracy | Intent accuracy on the benchmark set | ≥ 85% |
| Grounded answers | Share of factual answers with ≥ 1 source | 100% |
| "I don't know" honesty | Share of out-of-scope questions answered with `no_data` (red-team set) | ≥ 95% |
| Mandi freshness | Median age of the price shown (days) | ≤ 2 |
| Alert delivery | Advisories delivered / generated | ≥ 95% |
| Scheme accuracy | Expert audit of 50 random scheme answers | 0 critical errors |
| Expert referrals | Referrals the KVK closed within 7 days | ≥ 60% |
| Retention | Week-4 return rate of active farmers | ≥ 30% |
| Satisfaction | Spoken 3-point rating after an answer | ≥ 70% positive |
| Reach | Active farmers; districts covered | 200 / 4 |

Impact on yield or income is **not claimed** without a controlled study (Phase 3+, with a university partner).

## 14.5 Monetisation & sustainability
Free forever for farmers (information, alerts, guidance). Funding options: state Agriculture Department / Bihar Krishi integration contract · CSR grants (rural digital inclusion) · research grants with BAU/RPCAU/ICAR-RCER · paid **anonymised, aggregate** dashboards or tools for FPOs/cooperatives (never individual data) · enterprise API for verified FPO buyers (Phase 3). Banned: selling farmer data, undisclosed sponsored advice, paywalling alerts or scheme information.

## 14.6 Running cost estimate (pilot, 200–2,000 farmers)
A small VM or container (₹2–4k/month) · managed Postgres (₹3–5k) · LLM: only knowledge turns, about 300 output tokens each (budget ₹5–15k/month at pilot volume; template-only mode costs ₹0) · Open-Meteo commercial plan if needed.
