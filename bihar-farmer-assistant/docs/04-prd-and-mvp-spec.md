# 4. Product Requirements Document · 5. MVP Feature Specification

## 4.1 Product

**Bihar Farmer Assistant** – *खेती की सही जानकारी, अपनी भाषा में।*
A free, voice-first agricultural assistant for small and marginal farmers in Bihar. It answers spoken Bhojpuri/Hindi questions using checked sources, shows how sure it is, and hands off to human experts.

### Goals (MVP)
1. A farmer can ask a farming question **by voice** and get a spoken answer that is easy to follow, with no typing.
2. Every factual answer shows **source, date, and how sure it is**.
3. **Zero fabricated** prices, scheme benefits or chemical doses.
4. Works on low-end Android over 2G/3G-grade connections and partly offline.

### Non-goals (MVP)
Photo-based disease diagnosis · marketplaces · loan origination · applying for schemes inside the app · Maithili/Magahi/Angika voice · IVR/feature-phone channel.

### Principles
Technology adapts to the farmer · say "I don't know" rather than guess · official systems stay the system of record · free for farmers.

## 4.2 Requirements summary

| ID | Requirement | Priority |
|---|---|---|
| R1 | Big microphone button on Home and Ask. Visible listening/thinking/speaking states | Must |
| R2 | STT (browser `hi-IN`) with text fallback. TTS with replay and slow mode | Must |
| R3 | Follow-up questions (crop age, standing water, land size, registration) | Must |
| R4 | Answers use district, block, crop, stage and season context from profile and conversation | Must |
| R5 | Mandi prices from AGMARKNET/OGD with arrival date, min/max/modal, nearby markets, stale flag, wholesale disclaimer | Must |
| R6 | District-level weather + rule-based crop advisories, clearly labelled non-IMD | Must |
| R7 | Scheme catalogue with all 10 fields + conversational eligibility hints + fraud warnings | Must |
| R8 | Device-only profile by default. Server storage only with consent. No Aadhaar | Must |
| R9 | Knowledge library readable and playable offline | Should |
| R10 | Expert contacts (verified only) and "ask expert" prompt when unsure | Must |
| R11 | Admin content review workflow | Should |
| R12 | Rate limiting, input validation, safety post-filter on all output | Must |

## 5. MVP feature specifications

Each feature lists: user problem · how it's built · data dependencies · failure cases · acceptance criteria (AC). ACs marked ✅ are covered by automated tests in `server/test`.

### F1 – Voice agricultural assistant
- **Problem:** farmers can't type complex questions or move through menus. Advice from extension workers comes late.
- **How it's built:** browser STT → `POST /api/assistant/message` → rule-based NLU (intent + slots, Bhojpuri/Hindi lexicon) → dialogue state (pending intent, slots) → tools (knowledge retrieval, mandi, weather, schemes) → template answer, or LLM rephrasing **only from retrieved facts** → safety post-filter → TTS. See `08-architecture.md`.
- **Data:** knowledge base (`knowledge.ts`), district/crop lexicons, farmer context.
- **Failures:** STT not supported → text box. STT mishears → clarifying question with quick-reply chips. No KB match → "I don't have a checked answer" + KVK/KCC. LLM down or refuses → template answer. Offline → clear message plus a pointer to offline library.
- **AC:**
  - ✅ Yellow-paddy example: the first reply asks crop age **and** water status. After "30 दिन, पानी बा" the reply lists several possible causes, mentions zinc deficiency only as a possibility, asks for a photo to show the KVK, `confidence=low`, `suggestExpert=true`, sources attached.
  - ✅ No answer contains a chemical dose, even if the LLM writes one.
  - ✅ Questions about unsupported topics get `no_data`, not invented advice.
  - ✅ OTP/PIN mentions trigger a fraud warning.
  - Manual: replay and slow mode work; listening state is visible; usable with text only.

### F2 – Weather & agricultural alerts
- **Problem:** heavy rain, heat, fog and wind hit crops without crop-specific warnings.
- **How it's built:** Open-Meteo forecast for the district HQ point (5 days) → `deriveAlerts()` rules based on IMD intensity categories (heavy ≥ 64.5 mm/day, very heavy ≥ 115.6), heat ≥ 40/45 °C, cold ≤ 5 °C, wind ≥ 40 km/h, cool-humid blight risk, dry spell, spray window. Advice text in Hindi and Bhojpuri.
- **Data:** district coordinates. Open-Meteo (later IMD once whitelisted).
- **Failures:** provider down → "unavailable" + IMD link (never old forecasts). Village-level request → still labelled district-level.
- **AC:** ✅ threshold rules; ✅ label says "जिला स्तर" and "IMD की आधिकारिक चेतावनी नहीं"; manual: the screen links to IMD and BSDMA.

### F3 – Mandi price information
- **Problem:** farmers sell to traders without knowing the market price.
- **How it's built:** OGD API (state = Bihar) cached 30 min → filter by commodity aliases → sort by distance to the farmer's district (haversine over district HQs) → top 8. Offline: device copy shown with "पुराना सहेजा भाव – आज का भाव नहीं".
- **Data:** `DATA_GOV_IN_API_KEY`, resource id (configurable).
- **Failures:** no key / upstream error → `unavailable`, no numbers. No records → says so. Data > 3 days old → `stale` banner.
- **AC:** ✅ no key → no prices; ✅ nearest district first; ✅ arrival date and source on every record; ✅ stale flag; ✅ assistant reply has no ₹ figure when unavailable.

### F4 – Government schemes
- **Problem:** schemes are confusing. Farmers miss the DBT registration step. Middlemen charge fees.
- **How it's built:** curated catalogue (10 schemes, all 10 fields) with a `verification.status` shown on every card. Conversational eligibility: needs (seed/fertiliser/machinery/insurance/credit/disaster) + land size + registration → shortlist, with registration-first advice. No benefit promised.
- **Data:** `schemes.ts`, re-checked by the content team each season.
- **Failures:** scheme status unknown → "स्थिति अनिश्चित – विभाग से पूछें". Portal changed → admin marks it outdated.
- **AC:** ✅ spec dialogue asks land + registration, then lists seed subsidy + DBT registration; ✅ reply says it cannot promise benefits; manual: every card has an official link, helpline and date checked.

### F5 – Farmer profile & personalisation
- **Problem:** generic advice; repeating the same details every time.
- **How it's built:** profile stored in `localStorage` (name optional, language, district, block, village, land, crops, irrigation, soil). Sent as `context` with each question. Optional server sync with explicit consent (`consentDataStorage: true`), delete anywhere.
- **Failures:** private browsing → works without saving. Shared phone → "मेरी सारी जानकारी हटाएँ".
- **AC:** ✅ server rejects unknown fields (e.g. `aadhaar`); ✅ server refuses to store without consent; ✅ delete works; manual: assistant uses the profile district for weather/mandi without asking.

### Supporting (MVP): knowledge library (offline), expert help page, content-review admin API.

## 5.1 Phase 2+ features (specified, not built)
- **Crop disease image analysis:** in-app camera → client-side compression (≤ 200 KB) → consent prompt → vision model returns *possible* conditions + visible symptoms + confidence → always shows "expert check" if confidence is below high. Never shows a dose. Images kept only with consent and deleted after 30 days by default.
- Crop calendars per zone, soil/fertiliser guidance from the Soil Health Card, audio library, expert ticketing (KVK referral queue), buyer/FPO offers (verified only), Maithili/Magahi/Angika.
