# 12. External Data Source Inventory · 13. Security & Privacy Plan

## 12.1 Data source inventory

"Checked" means the claim was cross-checked by web research on 2026-11-13. **No official endpoint could be called from the build sandbox** (egress blocked), so live behaviour must be re-tested from the deployment environment.

| Source | Use | Access / auth | Update freq. | Status | Notes / risk |
|---|---|---|---|---|---|
| data.gov.in OGD – *Current Daily Price of Various Commodities from Various Markets (Mandi)* (AGMARKNET) | Mandi prices | Free API key (`api-key` query param). Resource id configurable (`MANDI_RESOURCE_ID`) | Daily (when markets report) | Dataset existence checked; **resource id and filter syntax not live-tested** | Search showed a "last updated 23/04/2025" date on the dataset page → freshness risk. The code tries `filters[state.keyword]` then `filters[state]` |
| Agmarknet 2.0 dashboard / UPAg portal | Cross-check, possible future source | Web | Daily | Checked (referenced by MoA&FW) | No documented public API found |
| e-NAM | Phase 3 trade data | No public API found | – | Not used | Needs a partnership/MoU |
| Open-Meteo forecast API | Weather (interim) | No key; free for non-commercial use (commercial use needs a plan → budget for it) | Hourly model runs | Public docs | **Not official.** Labelled as a model forecast |
| IMD API (api.imd.gov.in) | Official forecast/nowcast | **IP whitelisting** form + email approval | Several times a day | Checked: whitelisting required | Apply in Milestone 1. Then implement `ImdProvider` |
| IMD / BSDMA warnings | Official warnings | Web pages | Event-driven | Linked | No scraping without permission |
| DBT Agriculture Bihar (dbtagriculture.bihar.gov.in) | Registration and subsidy application | Farmer portal | – | Linked | No API. Deep link only |
| Bihar Krishi app | Official state services | App | – | Linked | Partnership target for deep links |
| PM-KISAN, PMFBY, Soil Health Card, myScheme | Scheme facts | Public web | Varies | Secondary cross-check | Re-verify every season |
| ICAR, ICAR-RCER Patna, NRC Litchi, BAU Sabour, RPCAU Pusa, KVK portal | Knowledge sources | Public publications | – | URLs written down, **reachability not tested** | Content needs expert sign-off |
| AI4Bharat (IndicConformer, SRUTI Bhojpuri ASR), Bhashini | Speech candidates | Open models / govt platform | – | Research | Benchmark first |

**Never-do list:** no made-up endpoints · no scraping of portals whose terms forbid it · no static file presented as live · every number carries its own date.

## 13. Security & privacy plan

### 13.1 Data minimisation
- Browsing, asking, prices, weather, schemes: **no account, no personal data**.
- The profile lives on the device by default. Server copy only with an explicit tick box (`consentDataStorage: true` enforced by the schema).
- **Never collected:** Aadhaar, bank account, OTP, PIN, passwords, caste, exact GPS. The strict schema rejects unknown fields.
- Conversation turns: in memory for 2 hours in the MVP. In production, 90-day retention, pseudonymous, linked to a farmer only with consent.
- Crop images (Phase 2): separate consent, 30-day auto-expiry, EXIF/GPS stripped on the client.

### 13.2 Controls in the MVP code
| Threat | Control |
|---|---|
| Injection / malformed input | zod validation on all inputs, length limits, JSON limit of 32 KB |
| Abuse / cost blow-up (LLM) | Rate limit 60/min/IP. LLM only on knowledge turns. Effort `low`. Timeout 20 s, 1 retry |
| Common web attacks | `helmet` headers, CORS allow-list, `x-powered-by` off |
| Admin endpoint brute force | Bearer token ≥ 12 chars, constant-time compare. (Prod: SSO + IP allow-list) |
| Prompt injection via farmer text | LLM sees only curated facts plus the question. Output is safety-filtered again. LLM can't call tools |
| Fraud / social engineering | Detects OTP/PIN talk → warning + 1930 cyber helpline. Scheme pages say "never pay, never share OTP" |
| Harmful advice | Dose stripping, guarantee softening, `alwaysRecommendExpert` entries, low-confidence labelling |
| Secrets | `.env` (git-ignored). `.env.example` only. Production uses the platform's secret manager |

### 13.3 Production additions
TLS everywhere · DB encryption at rest · per-farmer data export and delete (DPDP Act 2023 rights) · audit log for admin edits · dependency scanning (npm audit / Dependabot) · request logs with no message text by default · a DPIA before the pilot · consent text tested with low-literacy users (read aloud).

### 13.4 Responsible-AI and content governance
1. **Content review board:** at least one agronomist (BAU/KVK) + one plant-protection specialist. Every KB entry needs `expert_reviewed` before launch. Re-review every 12 months or when rules change.
2. **Scheme desk:** checks every scheme against the official portal at the start of each season. Sets `verified_official` with a date.
3. **Incident process:** a farmer report or expert flag → the entry is marked `outdated` within 24 h (it drops out of retrieval at once) → fixed and re-reviewed.
4. **No commercial influence:** no paid placement of seeds, pesticides or fertilisers. Brand names are banned from knowledge answers.
