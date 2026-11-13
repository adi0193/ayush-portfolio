# 1. Bihar Agriculture Research Report

> Status: desk research, November 2026. **No farmer interviews have been done yet.** Everything marked *hypothesis* needs field checks (see §7 and `14-roadmap-metrics.md`).

## 1.1 Why Bihar needs its own product

| Fact | Evidence | Product implication |
|---|---|---|
| More than 91% of farmers are **marginal** (< 1 ha). Holdings are small and split into many plots. | Bihar Agriculture Dept, Fourth Agriculture Roadmap portal | Advice must be cheap to follow. No "buy a ₹2 lakh machine" answers. Land is described in **bigha/katha**, not hectares. |
| Agriculture is the main livelihood for most of the state's population. | State reporting around the Roadmap launch | Wrong advice costs a household its income → strict safety rules. |
| **Fourth Agriculture Roadmap 2023–28** (launched 18 Oct 2023): about ₹1.62 lakh crore. Focus on pulses, oilseeds and millets (crop diversification), digital agriculture and value addition. | Roadmap portal; reports of the launch | Line up the knowledge base with the roadmap's priority crops. Don't push only paddy and wheat. |
| North Bihar (Kosi, Gandak, Bagmati, Kamla basins) floods every year. South Bihar (Magadh, parts of Shahabad and the south-east) faces erratic rain and drought. | BSDMA; state disaster records | Weather alerts and flood/drought scheme help are core features, not extras. |
| State crop insurance: Bihar **left PMFBY in 2018** and runs the **Bihar Rajya Fasal Sahayata Yojana (BRFSY)**. Reports from 2024 to 2026 say Bihar is going back to PMFBY, but they give **different dates**. | News reports (BusinessLine 2024, Financial Express Jan 2025, others) | The scheme module marks crop insurance as `status_uncertain`. It must never say "apply for PMFBY" without checking. |
| Disaster relief comes through the **Krishi Input Anudan** on the DBT Agriculture portal. You need the 13-digit farmer registration number. Different sources give different per-hectare rates (older and newer figures). | myScheme; secondary guides | Show **no** rupee amount until it is checked on the official site. Explain the steps, not the money. |
| The **Bihar Krishi app** (launched May 2025, all 38 districts) already shows mandi prices, weather, scheme applications, a DBT passbook, Soil Health Card downloads and plant-protection advice. | Government launch coverage; MicroSave case study | **We must not copy it.** See the gap analysis in `03-competitor-analysis.md`. |

## 1.2 Agro-climatic zones (used as the location backbone)

| Zone | Districts | Starting crop/risk hypothesis (needs block-level checks) |
|---|---|---|
| I – North-West alluvial | W & E Champaran, Sitamarhi, Sheohar, Muzaffarpur, Vaishali, Saran, Siwan, Gopalganj, Darbhanga, Madhubani, Samastipur, Begusarai (13) | Paddy, wheat, sugarcane (Champaran, Gopalganj), litchi (Muzaffarpur, GI-tagged Shahi litchi), makhana (Darbhanga, Madhubani, GI-tagged Mithila makhana), rabi maize (Samastipur, Begusarai); floods |
| II – North-East alluvial | Purnia, Katihar, Araria, Kishanganj, Saharsa, Supaul, Madhepura, Khagaria (8) | Maize (big rabi maize belt), makhana, jute, banana; Kosi floods and waterlogging |
| IIIA – South-East alluvial | Bhagalpur, Banka, Munger, Lakhisarai, Sheikhpura, Jamui (6) | Paddy, pulses, mango (Bhagalpur); *tal* (seasonally flooded) lands; drought in Banka/Jamui |
| IIIB – South-West alluvial | Patna, Nalanda, Bhojpur, Buxar, Rohtas, Kaimur, Gaya, Jehanabad, Arwal, Nawada, Aurangabad (11) | Paddy-wheat (Rohtas/Bhojpur canal command), potato/onion/vegetables (Nalanda, Patna), pulses; rainfall variability and heat in Magadh |

All 38 districts are encoded in `server/src/data/districts.ts` with zone, district-HQ coordinates and **unverified** crop and risk tags. The assistant only uses these tags to decide **which question to ask**. It never uses them to tell a farmer what to grow.

## 1.3 Cropping calendar (approximate; varies by zone and variety)

| Season | Months | Main crops |
|---|---|---|
| Kharif | Jun–Oct | Paddy, maize, arhar, jute, vegetables |
| Rabi | Nov–Mar | Wheat (timely sowing mid-Nov to early Dec), rabi maize, lentil, gram, mustard, potato, onion |
| Zaid/Garma | Mar–Jun | Moong, vegetables, garma maize |
| Perennial | — | Sugarcane, litchi, mango, banana, makhana (pond and field systems) |

## 1.4 Language findings

- Bhojpuri is spoken mainly in the western districts (Saran division, Champaran, Bhojpur, Buxar, Rohtas, Kaimur). Maithili is spoken in Mithila, Magahi in Magadh, and Angika around Bhagalpur and Munger. A "Bihar app in Hindi only" leaves out how many farmers actually talk.
- Bhojpuri varies by area (for example *बा / बाटे / हवे*, *पीयर / पियर*, *केतना / कतना*). The NLU lexicon (`server/src/services/nlu.ts`) stores variants, not one spelling.
- **ASR:** AI4Bharat has published research-grade Bhojpuri ASR (SRUTI benchmark of rural Bhojpuri women speakers, Interspeech 2025; Bhojpuri/Hindi rural women ASR collection). IndicConformer covers the 22 scheduled languages. **Bhojpuri is not a scheduled language**, so support is not built in.
- **TTS:** we found **no confirmed production Bhojpuri TTS**. The SRUTI authors had to create synthetic Bhojpuri speech themselves. The MVP reads Bhojpuri text with a Hindi voice (same script). This is a known quality gap.
- Browsers offer `hi-IN` speech recognition, not Bhojpuri. Hindi models partly understand Bhojpuri. **How well they do must be measured** (see the benchmark plan in `08-architecture.md` §AI & Voice).

## 1.5 Data access findings

| Source | Access in practice | Used in MVP? |
|---|---|---|
| AGMARKNET daily prices via **data.gov.in OGD API** | Free API key; JSON. The "Current Daily Price…" resource page showed last-updated 23/04/2025 in search results, so **freshness must be checked** | Yes, with the date shown and a stale flag |
| e-NAM | No open public price API found; prices visible on the website | No (Phase 3, through a partnership) |
| IMD (api.imd.gov.in) | City forecast and nowcast endpoints exist. **Your IP must be whitelisted** through a form, with approval by email | No → Open-Meteo for now, clearly labelled "model forecast, not IMD". IMD application to be filed |
| BSDMA flood bulletins | Web pages/PDFs, no API | Link only |
| DBT Agriculture Bihar, Bihar Krishi app | No public API | Deep links only |
| myScheme.gov.in | Public scheme pages | Used to cross-check scheme facts |
| Soil Health Card portal | Farmer-facing portal | Link |

## 1.6 Data gaps and API limits

1. **No block-level crop pattern dataset** we could reach → district crop tags stay hypotheses.
2. **Mandi coverage is uneven.** Many small Bihar markets don't report daily. "No records" will be a common, correct answer.
3. **IMD access is gated** → until approved, weather comes from a non-official model.
4. **Scheme rules change every season**, and official portals were not reachable from the build environment → all schemes are marked `secondary_source` or `status_uncertain`.
5. **No Bhojpuri TTS** and no benchmark of Bhojpuri ASR on farm vocabulary.
6. **No expert-reviewed knowledge base** → all 14 seed entries are `pending_expert_review`.

## 1.7 Assumptions to check with farmers (top ones)

| # | Assumption | How to check |
|---|---|---|
| A1 | Farmers prefer to speak, not type | Field test: same task done by voice and by tapping |
| A2 | `hi-IN` browser STT is good enough for Bhojpuri farm questions (aim: ≥ 80% of intents understood) | Record 300 utterances across 4 Bhojpuri districts and score them |
| A3 | Farmers know their district and block but not their soil type | Interviews |
| A4 | Wholesale mandi price still helps a farmer bargain with a trader | Interviews with farmers and traders |
| A5 | A shared family phone is common, so the profile must be easy to switch or clear | Interviews (especially with women farmers) |
| A6 | Farmers trust "source + date" labels more than a confident answer | A/B test in the pilot |
| A7 | KVKs can take referrals from the app | Talk to 3 KVKs before launch |

## Sources

- [Fourth Agriculture Roadmap 2023-28 – Bihar Agriculture Dept](https://onlinedbtagriservice.bihar.gov.in/RoadMap/krishirodamapmis/about.html)
- [President launches Bihar's Fourth Agricultural Roadmap – Drishti IAS](https://www.drishtiias.com/state-pcs-current-affairs/president-draupadi-murmu-launched-the-fourth-agricultural-roadmap-of-bihar)
- [Down To Earth – Bihar roadmap launch](https://www.downtoearth.org.in/news/bihar-s-food-production-has-risen-during-the-last-15-years-due-to-agriculture-roadmaps-say-officials-92376)
- [Bihar Rajya Fasal Sahayata Yojna guide – Krishi Jagran](https://krishijagran.com/agriculture-world/bihar-rajya-fasal-sahayata-yojna-a-complete-guide/)
- [Gujarat, Bihar to rejoin Fasal Bima – Financial Express (Magzter)](https://magzter.com/stories/newspaper/Financial-Express-Mumbai/GUJARAT-BIHAR-TO-REJOIN-FASAL-BIMA)
- [Krishi Input Anudan Yojana – myScheme](https://www.myscheme.gov.in/schemes/kiay)
- [Bihar Krishi app launch – Ten News](https://tennews.in/cm-nitish-kumar-launches-major-agricultural-initiatives-in-bihar-unveils-krishi-mobile-app)
- [Integrated DFS platform for Bihar Krishi – MicroSave](https://www.microsave.net/wp-content/uploads/2026/01/260120_Integrated-Digital-Farmer-Services-DFS-platform-for-Bihar-Krishi.pdf)
- [Current Daily Price of Various Commodities – data.gov.in](https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi)
- [IMD API reference](https://api.imd.gov.in/public/api_reference.html) · [IMD IP whitelisting request](https://city.imd.gov.in/citywx/api_request.php)
- [AI4Bharat Bhojpuri & Hindi rural women ASR – Hugging Face](https://huggingface.co/collections/ai4bharat/bhojpuri-and-hindi-rural-women-asr)
- [IndicConformerASR – GitHub](https://github.com/AI4Bharat/IndicConformerASR)
- [SRUTI paper – arXiv 2506.09653](https://arxiv.org/html/2506.09653v1)
