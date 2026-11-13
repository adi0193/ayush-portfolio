# 2. Farmer Personas and Pain Points · 3. Competitor & Government Platform Analysis

> These personas are **hypotheses built from desk research**. Replace them with real ones after the 20+ interviews in `14-roadmap-metrics.md` §Field research.

## 2.1 Personas

### Ramesh Yadav, 46 – marginal paddy-wheat farmer, Rohtas (Zone IIIB)
- 1.5 bigha of his own land plus 2 bigha sharecropped. Canal irrigation (sometimes unreliable). Studied to class 5. Uses an ₹8,000 Android phone mostly for WhatsApp and YouTube.
- **Problems:** buys fertiliser and pesticide on the shop owner's word. Has never had his soil tested. Not sure which subsidies he can get as a sharecropper.
- **Needs:** short spoken answers. To know whether he can get seed subsidy without owning land. Wheat sowing timing.

### Sunita Devi, 34 – woman farmer, Madhubani (Zone I, Mithila)
- Runs the farm while her husband works in Delhi. Grows paddy and helps in the makhana pond. Shares a phone with her teenage son. Speaks Maithili at home and understands Bhojpuri and Hindi.
- **Problems:** offices are far away and male-dominated. Flood damage in 2 of the last 4 years. She did not know she could claim input subsidy.
- **Needs:** voice, no login, a privacy-safe shared phone, flood alerts, and simple steps for the disaster relief claim.

### Md. Irfan, 29 – maize farmer, Purnia (Zone II)
- 4 acres of rabi maize. Studied to class 10. Comfortable with smartphone apps. Sells to traders who quote low prices.
- **Problems:** doesn't know mandi prices on the day of sale. Fall armyworm damage last season.
- **Needs:** nearby mandi comparison with dates, pest identification, weather windows for spraying.

### Lalita Kumari, 52 – vegetable grower, Nalanda (Zone IIIB)
- 10 katha of potato and onion. Cannot read. Uses a basic feature phone plus her grandson's smartphone.
- **Problems:** potato blight loss in a foggy winter. Can't use text-heavy apps.
- **Needs:** fully spoken use, warnings when the weather favours blight. *(A feature phone means IVR is a future channel – see the roadmap.)*

## 2.2 Pain points ranked (hypothesis → validate)

| # | Pain point | Personas | Covered in MVP by |
|---|---|---|---|
| 1 | Can't get timely, trustworthy advice in their own language | all | Voice assistant (Bhojpuri/Hindi) |
| 2 | Depend on input dealers for chemical advice (wrong doses, money wasted) | Ramesh, Irfan | Safety rule: no doses, sends to KVK and soil test |
| 3 | Don't know the price before selling to a trader | Irfan, Ramesh | Mandi module with dates and the "wholesale ≠ farm-gate" note |
| 4 | Flood/heat/fog hits without crop-specific warning | Sunita, Lalita | Weather advisories |
| 5 | Schemes are confusing, the DBT registration step isn't known, middlemen take money | Sunita, Ramesh | Scheme module, fraud warnings, registration-first guidance |
| 6 | Can't read long text | Lalita | Read aloud, slow mode, big icons |
| 7 | Shared phone, privacy worries | Sunita | Device-only profile by default, one-tap delete |

## 3.1 Existing platforms

| Platform | What it does well | Gap for our users |
|---|---|---|
| **Bihar Krishi app** (state, 2025) | Official: mandi prices, weather, apply for schemes, DBT passbook, Soil Health Card, plant protection, all 38 districts | Menus and forms. Not a conversation. No Bhojpuri voice question-and-answer. Can't ask "my paddy leaves are yellow, what do I do?" |
| **DBT Agriculture Bihar portal** | Registration and subsidy applications (system of record) | Form-heavy, needs literacy, no explanations |
| **Kisan Call Centre (1800-180-1551)** | Human experts, free, voice | Waiting times. Not always local or Bhojpuri. No follow-up record |
| **Kisan Suvidha / mKisan** (central) | Weather, prices, SMS advisories | Generic and national. Text and SMS heavy |
| **Agmarknet / e-NAM portals** | Authoritative prices | Desktop-style data tables |
| **Private agri apps** (e.g. Kisan-oriented social/marketplace apps) | Community, disease photo ID | Often driven by product sales (possible conflict of interest). Generic, not Bihar-specific |
| **KVKs** | Local experts, field visits | Physical distance, limited staff |

## 3.2 Our positioning – the gap we fill

**We do not replace any government system of record.** We are a voice-first, conversational layer that:
1. **Understands spoken Bhojpuri and Hindi questions** and asks follow-up questions, the way an extension worker would.
2. **Explains** schemes and data in plain spoken language, then **sends people to** the official portals and apps (DBT portal, Bihar Krishi app, PM-KISAN) to apply.
3. **Shows how sure it is** on every answer (source, date, review status), and **hands off to humans** (KVK, KCC) when it isn't sure.
4. Has no commercial agenda: no product promotion, no sale of data.

Partnership target: become a recognised "voice front-door" that deep-links into Bihar Krishi and DBT flows, rather than competing with them.
