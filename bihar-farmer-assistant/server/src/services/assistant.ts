/**
 * Conversational engine: NLU → dialogue state (slot filling, follow-up questions) →
 * tools (mandi, weather, schemes, knowledge retrieval) → answer composition → safety.
 *
 * Design choices:
 * - Data answers (prices, weather) are composed from templates so numbers are never
 *   paraphrased or invented by an LLM.
 * - Knowledge answers use retrieved KB entries; an LLM (if configured) may rephrase them
 *   but is restricted to those facts, and its output is safety-filtered again.
 * - Uncertainty is explicit: every reply carries `kind`, `confidence`, `sources`.
 */
import { currentSeason, findCrop, SEASON_HI } from '../data/crops.js';
import { findDistrict } from '../data/districts.js';
import { SCHEMES, type Scheme } from '../data/schemes.js';
import type { AssistantReply, FarmerContext, Lang, SourceRef } from '../lib/types.js';
import type { LlmProvider } from '../providers/llm.js';
import { getMandiPrices, type MandiResult } from './mandi.js';
import { parse, parseLandAcres, parseYesNo, type Intent } from './nlu.js';
import { retrieve } from './retrieval.js';
import { applySafety, CREDENTIAL_WARNING, mentionsCredentials } from './safety.js';
import { getWeather, weatherSummary, type WeatherProvider } from './weather.js';

export interface Session {
  id: string;
  lang: Lang;
  pending?: { intent: Intent; awaiting: string[] };
  slots: {
    cropId?: string;
    districtId?: string;
    days?: number;
    water?: 'standing' | 'dry';
    landAcres?: number;
    dbtRegistered?: boolean;
    schemeNeeds?: string[];
    problemText?: string;
  };
  history: Array<{ role: 'farmer' | 'assistant'; text: string; at: string }>;
  updatedAt: number;
}

export interface AssistantDeps {
  llm?: LlmProvider | null;
  mandi?: typeof getMandiPrices;
  weatherProvider?: WeatherProvider;
}

const t = (lang: Lang, hi: string, bho: string) => (lang === 'bho' ? bho : hi);

const KVK_SOURCE: SourceRef = { title: 'कृषि विज्ञान केंद्र (KVK) निर्देशिका – ICAR', url: 'https://kvk.icar.gov.in/', lastUpdated: '2026-11-13' };
const KCC_LINE = (lang: Lang) => t(lang, 'किसान कॉल सेंटर 1800-180-1551 (मुफ्त) पर भी बात कर सकते हैं।', 'किसान कॉल सेंटर 1800-180-1551 (मुफ्त) पर भी बात कर सकत बानी।');

function reply(partial: Partial<AssistantReply> & Pick<AssistantReply, 'text' | 'lang' | 'intent'>): AssistantReply {
  const { text, doseRemoved } = applySafety(partial.text);
  return {
    kind: 'knowledge',
    confidence: 'medium',
    followUps: [],
    sources: [],
    suggestExpert: false,
    ...partial,
    text: doseRemoved ? text + ' ' + t(partial.lang, '(दवा/खाद की मात्रा लेबल और KVK से ही लें।)', '(दवाई/खाद के मात्रा लेबल आ KVK से ही लीं।)') : text,
  };
}

function contextLine(s: Session, profile: FarmerContext): string {
  const d = findDistrict(s.slots.districtId ?? profile.district);
  const c = findCrop(s.slots.cropId);
  const parts = [
    d && `जिला: ${d.nameHi} (ज़ोन ${d.zone})`,
    profile.block && `प्रखंड: ${profile.block}`,
    c && `फसल: ${c.nameHi}`,
    s.slots.days !== undefined && `फसल की उम्र: ${s.slots.days} दिन`,
    s.slots.water && `खेत में पानी: ${s.slots.water === 'standing' ? 'भरा है' : 'सूखा'}`,
    `मौसम: ${SEASON_HI[currentSeason()]}`,
    profile.irrigation && `सिंचाई: ${profile.irrigation}`,
    profile.soil && `मिट्टी: ${profile.soil}`,
  ];
  return parts.filter(Boolean).join('; ');
}

/* ---------------- crop problem ---------------- */

async function handleCropProblem(text: string, s: Session, profile: FarmerContext, deps: AssistantDeps): Promise<AssistantReply> {
  const lang = s.lang;
  if (!s.slots.cropId) {
    const only = profile.crops?.length === 1 ? profile.crops[0] : undefined;
    if (only) s.slots.cropId = only;
  }
  if (!s.slots.cropId) {
    s.pending = { intent: 'crop_problem', awaiting: ['crop'] };
    return reply({
      lang, intent: 'crop_problem', kind: 'clarifying_question', confidence: 'low',
      text: t(lang, 'कौन-सी फसल में दिक्कत है? जैसे धान, गेहूं, मक्का, आलू…', 'कवना फसल में दिक्कत बा? जइसे धान, गेहूँ, मकई, आलू…'),
    });
  }
  const crop = findCrop(s.slots.cropId)!;
  const hits = retrieve({ text: s.slots.problemText ?? text, crop: crop.id, category: 'crop_problem' });
  const top = hits[0]?.entry;

  // Ask the entry's follow-up questions (crop age, water) before explaining causes.
  if (top && (s.slots.days === undefined || s.slots.water === undefined) && top.followUpsHi?.length && s.pending?.awaiting[0] !== 'details_done') {
    s.pending = { intent: 'crop_problem', awaiting: ['details'] };
    const qs = (lang === 'bho' ? top.followUpsBho : top.followUpsHi)!.slice(0, 2).join(' ');
    return reply({ lang, intent: 'crop_problem', kind: 'clarifying_question', confidence: 'low', text: qs, followUps: (lang === 'bho' ? top.followUpsBho : top.followUpsHi) ?? [] });
  }
  s.pending = undefined;

  if (!top) {
    return reply({
      lang, intent: 'crop_problem', kind: 'no_data', confidence: 'low', suggestExpert: true, sources: [KVK_SOURCE],
      text: t(lang,
        `${crop.nameHi} की इस समस्या के बारे में मेरे पास अभी जाँची हुई जानकारी नहीं है। पौधे की साफ फोटो लेकर नजदीकी कृषि विज्ञान केंद्र (KVK) या प्रखंड कृषि समन्वयक को दिखाएँ। ${KCC_LINE(lang)}`,
        `${crop.nameBho} के एह दिक्कत के बारे में हमरा लगे अभी जाँचल जानकारी नइखे। पौधा के साफ फोटो लेके नजदीकी KVK भा प्रखंड कृषि समन्वयक के देखाईं। ${KCC_LINE(lang)}`),
    });
  }

  // Stage-aware hint (hypothesis only, never a diagnosis).
  let hint = '';
  if (crop.id === 'paddy' && s.slots.days !== undefined && s.slots.days >= 14 && s.slots.days <= 45 && s.slots.water === 'standing') {
    hint = t(lang,
      ' इस उम्र (रोपाई के 2–6 हफ्ते) और भरे पानी में जिंक की कमी (खैरा) भी एक संभावित कारण हो सकता है – पर यह पक्का नहीं है।',
      ' एह उमिर (रोपनी के 2–6 हफ्ता) आ भरल पानी में जिंक के कमी (खैरा) भी एगो संभावित कारण हो सकेला – बाकिर ई पक्का नइखे।');
  }

  const body = lang === 'bho' ? top.bodyBho : top.bodyHi;
  let answer = t(lang, 'समझ गया। ', 'समझ गइनी। ') + body + hint;
  let kind: AssistantReply['kind'] = 'knowledge';

  if (deps.llm) {
    const llmText = await deps.llm.answer({
      lang,
      question: [s.slots.problemText, text].filter(Boolean).join(' / '),
      context: contextLine(s, profile),
      facts: hits.map((h) => ({ id: h.entry.id, title: h.entry.titleHi, text: h.entry.bodyHi, source: h.entry.source.name })),
    });
    if (llmText) {
      answer = llmText + hint;
      kind = 'ai_explanation';
    }
  }

  const photo = t(lang,
    ' कृपया पत्ते की एक साफ फोटो लेकर KVK या कृषि समन्वयक को दिखाएँ, ताकि सही कारण पता चल सके। (फोटो से जांच की सुविधा अगले चरण में आएगी।)',
    ' कृपया पत्ता के एगो साफ फोटो लेके KVK भा कृषि समन्वयक के देखाईं, ताकि सही कारण पता चले। (फोटो से जांच के सुविधा अगिला चरण में आई।)');
  s.slots.days = undefined;
  s.slots.water = undefined;
  s.slots.problemText = undefined;
  return reply({
    lang, intent: 'crop_problem', kind, confidence: 'low', suggestExpert: true,
    text: answer + photo,
    sources: [...hits.map((h) => ({ title: h.entry.titleHi, url: h.entry.source.url, lastUpdated: h.entry.lastChecked, status: h.entry.reviewStatus })), KVK_SOURCE],
  });
}

/* ---------------- mandi ---------------- */

function formatMandi(r: MandiResult, lang: Lang): string {
  const crop = findCrop(r.crop)!;
  const dist = findDistrict(r.district);
  if (r.status === 'unavailable') {
    return t(lang,
      `माफ कीजिए, अभी ${crop.nameHi} का मंडी भाव नहीं मिल पा रहा है (सरकारी डेटा से जुड़ाव उपलब्ध नहीं)। मैं अनुमान से भाव नहीं बताता। agmarknet.gov.in या नजदीकी मंडी से पता करें।`,
      `माफ करीं, अभी ${crop.nameBho} के मंडी भाव ना मिल पावत बा (सरकारी डेटा से जुड़ाव नइखे)। हम अंदाजा से भाव ना बताइला। agmarknet.gov.in भा नजदीकी मंडी से पता करीं।`);
  }
  if (r.status === 'no_records' || !r.records.length) {
    return t(lang,
      `${dist?.nameHi ?? 'बिहार'} के आसपास ${crop.nameHi} का हाल का मंडी भाव सरकारी डेटा में नहीं मिला। हो सकता है मंडी ने आज भाव दर्ज न किया हो।`,
      `${dist?.nameHi ?? 'बिहार'} के आसपास ${crop.nameBho} के हाल के मंडी भाव सरकारी डेटा में ना मिलल। हो सकेला मंडी आज भाव दर्ज ना कइले होखे।`);
  }
  const top = r.records.slice(0, 3);
  const lines = top
    .map((x) => t(lang,
      `${x.market} (${x.district}) में ${x.commodity}: औसत (मॉडल) ₹${x.modalPrice}, न्यूनतम ₹${x.minPrice}, अधिकतम ₹${x.maxPrice} प्रति क्विंटल, ${x.arrivalDate} का भाव`,
      `${x.market} (${x.district}) में ${x.commodity}: औसत (मॉडल) ₹${x.modalPrice}, कम से कम ₹${x.minPrice}, जादे से जादे ₹${x.maxPrice} प्रति क्विंटल, ${x.arrivalDate} के भाव`))
    .join('। ');
  const stale = r.stale
    ? t(lang, ` ध्यान दें: यह भाव ${r.latestArrivalDate} का है, आज का नहीं।`, ` ध्यान दीं: ई भाव ${r.latestArrivalDate} के ह, आज के ना।`)
    : '';
  return t(lang, 'उपलब्ध मंडी डेटा के अनुसार, ', 'उपलब्ध मंडी डेटा के हिसाब से, ') + lines + '।' + stale + ' ' + t(lang, 'यह थोक मंडी भाव है, गाँव में व्यापारी का भाव अलग हो सकता है।', 'ई थोक मंडी भाव ह, गाँव में बेपारी के भाव अलग हो सकेला।');
}

async function handleMandi(s: Session, profile: FarmerContext, deps: AssistantDeps): Promise<AssistantReply> {
  const lang = s.lang;
  if (!s.slots.cropId) {
    s.pending = { intent: 'mandi', awaiting: ['crop'] };
    return reply({ lang, intent: 'mandi', kind: 'clarifying_question', text: t(lang, 'किस फसल का भाव जानना है?', 'कवना फसल के भाव जाने के बा?') });
  }
  const districtId = s.slots.districtId ?? profile.district;
  if (!districtId) {
    s.pending = { intent: 'mandi', awaiting: ['district'] };
    return reply({ lang, intent: 'mandi', kind: 'clarifying_question', text: t(lang, 'आप किस जिले में हैं?', 'रउआ कवना जिला में बानी?') });
  }
  s.pending = undefined;
  const r = await (deps.mandi ?? getMandiPrices)({ cropId: s.slots.cropId, districtId });
  return reply({
    lang, intent: 'mandi',
    kind: r.status === 'ok' ? 'data' : 'no_data',
    confidence: r.status === 'ok' && !r.stale ? 'high' : 'low',
    text: formatMandi(r, lang),
    sources: [{ title: r.source.name, url: r.source.url, lastUpdated: r.latestArrivalDate ?? r.fetchedAt ?? 'उपलब्ध नहीं' }],
    data: r,
  });
}

/* ---------------- weather ---------------- */

async function handleWeather(s: Session, profile: FarmerContext, deps: AssistantDeps): Promise<AssistantReply> {
  const lang = s.lang;
  const district = findDistrict(s.slots.districtId ?? profile.district);
  if (!district) {
    s.pending = { intent: 'weather', awaiting: ['district'] };
    return reply({ lang, intent: 'weather', kind: 'clarifying_question', text: t(lang, 'आप किस जिले का मौसम जानना चाहते हैं?', 'रउआ कवना जिला के मौसम जाने के चाहत बानी?') });
  }
  s.pending = undefined;
  const r = await getWeather(district, deps.weatherProvider);
  return reply({
    lang, intent: 'weather',
    kind: r.status === 'ok' ? 'data' : 'no_data',
    confidence: r.status === 'ok' ? 'medium' : 'low',
    text: weatherSummary(r, district.nameHi, lang),
    sources: [
      { title: `${r.provider.name} (मॉडल पूर्वानुमान, जिला मुख्यालय बिंदु)`, url: r.provider.url, lastUpdated: r.fetchedAt ?? 'उपलब्ध नहीं' },
      { title: 'भारत मौसम विज्ञान विभाग – आधिकारिक चेतावनी', url: r.officialWarningsUrl, lastUpdated: 'लाइव' },
    ],
    data: r,
  });
}

/* ---------------- schemes ---------------- */

export function matchSchemes(needs: string[], landAcres?: number, dbtRegistered?: boolean): Scheme[] {
  const pool = SCHEMES.filter((x) => x.id !== 'dbt-registration');
  let list = needs.length ? pool.filter((x) => x.tags.some((tag) => needs.includes(tag))) : pool;
  if (!list.length) list = pool;
  const out = [...list];
  if (dbtRegistered !== true && out.some((x) => x.requiresDbtRegistration)) out.unshift(SCHEMES.find((x) => x.id === 'dbt-registration')!);
  void landAcres; // land size refines eligibility in Phase 2 (e.g. 2-ha caps); not used to exclude anyone in MVP
  return out.slice(0, 4);
}

function handleScheme(text: string, s: Session, profile: FarmerContext): AssistantReply {
  const lang = s.lang;
  const p = parse(text);
  if (p.schemeNeeds.length) s.slots.schemeNeeds = p.schemeNeeds;
  if (s.slots.landAcres === undefined) s.slots.landAcres = p.landAcres ?? profile.landAcres;
  if (s.slots.dbtRegistered === undefined && p.dbtRegistered !== undefined) s.slots.dbtRegistered = p.dbtRegistered;

  const awaiting: string[] = [];
  if (s.slots.landAcres === undefined) awaiting.push('land');
  if (s.slots.dbtRegistered === undefined) awaiting.push('dbt');
  if (awaiting.length && s.pending?.awaiting[0] !== 'asked_once') {
    s.pending = { intent: 'scheme', awaiting: [...awaiting] };
    return reply({
      lang, intent: 'scheme', kind: 'clarifying_question',
      text: t(lang,
        'जी, कुछ सरकारी कृषि सहायता योजनाएँ उपलब्ध हो सकती हैं। पहले बताइए कि आप कितनी जमीन पर खेती करते हैं, और क्या आपका DBT पोर्टल पर किसान पंजीकरण है या नहीं?',
        'जी, कुछ सरकारी कृषि सहायता योजना उपलब्ध हो सकेली। पहिले बताईं कि रउआ केतना जमीन पर खेती करेलीं आ रउआ के किसान पंजीकरण बा कि ना?'),
    });
  }
  s.pending = undefined;
  const list = matchSchemes(s.slots.schemeNeeds ?? [], s.slots.landAcres, s.slots.dbtRegistered);
  const names = list.map((x) => x.nameHi).join(', ');
  const regNote = s.slots.dbtRegistered !== true
    ? t(lang, ' सबसे पहले DBT कृषि पोर्टल पर किसान पंजीकरण कराएँ – ज्यादातर राज्य योजनाओं के लिए यह जरूरी है।', ' सबसे पहिले DBT कृषि पोर्टल पर किसान पंजीकरण करवाईं – जादेतर राज्य योजना खातिर ई जरूरी बा।')
    : '';
  const text2 = t(lang,
    `आपके लिए ये योजनाएँ देखने लायक हो सकती हैं: ${names}।${regNote} हर योजना की शर्तें और राशि बदल सकती हैं, इसलिए आधिकारिक पोर्टल पर जांच लें। मैं यह वादा नहीं कर सकता कि लाभ मिलेगा ही। कोई भी आपसे OTP या पैसे मांगे तो न दें।`,
    `रउआ खातिर ई योजना देखे लायक हो सकेली: ${names}।${regNote} हर योजना के शर्त आ रकम बदल सकेला, एह से आधिकारिक पोर्टल पर जांच लीं। हम ई वादा ना कर सकीं कि लाभ मिलबे करी। केहू OTP भा पइसा माँगे त मत दीं।`);
  return reply({
    lang, intent: 'scheme', kind: 'knowledge',
    confidence: list.every((x) => x.verification.status === 'verified_official') ? 'high' : 'medium',
    text: text2,
    sources: list.map((x) => ({ title: x.nameHi, url: x.officialUrl, lastUpdated: x.verification.checkedOn, status: x.verification.status })),
    data: { schemeIds: list.map((x) => x.id) },
  });
}

/* ---------------- general knowledge ---------------- */

async function handleKnowledge(text: string, s: Session, profile: FarmerContext, deps: AssistantDeps): Promise<AssistantReply> {
  const lang = s.lang;
  const hits = retrieve({ text, crop: s.slots.cropId });
  if (!hits.length) {
    return reply({
      lang, intent: 'knowledge', kind: 'no_data', confidence: 'low', suggestExpert: true, sources: [KVK_SOURCE],
      text: t(lang,
        `इस सवाल का जाँचा हुआ जवाब मेरे पास अभी नहीं है। अंदाजे से गलत सलाह देना ठीक नहीं होगा। नजदीकी KVK या प्रखंड कृषि समन्वयक से पूछें। ${KCC_LINE(lang)}`,
        `एह सवाल के जाँचल जवाब हमरा लगे अभी नइखे। अंदाजा से गलत सलाह दिहल ठीक ना होई। नजदीकी KVK भा प्रखंड कृषि समन्वयक से पूछीं। ${KCC_LINE(lang)}`),
    });
  }
  let body = hits.slice(0, 1).map((h) => (lang === 'bho' ? h.entry.bodyBho : h.entry.bodyHi)).join(' ');
  let kind: AssistantReply['kind'] = 'knowledge';
  if (deps.llm) {
    const llmText = await deps.llm.answer({
      lang, question: text, context: contextLine(s, profile),
      facts: hits.map((h) => ({ id: h.entry.id, title: h.entry.titleHi, text: h.entry.bodyHi, source: h.entry.source.name })),
    });
    if (llmText) { body = llmText; kind = 'ai_explanation'; }
  }
  return reply({
    lang, intent: 'knowledge', kind, confidence: 'medium',
    suggestExpert: hits.some((h) => h.entry.alwaysRecommendExpert),
    text: body,
    sources: hits.map((h) => ({ title: h.entry.titleHi, url: h.entry.source.url, lastUpdated: h.entry.lastChecked, status: h.entry.reviewStatus })),
  });
}

/* ---------------- entry point ---------------- */

export async function respond(text: string, s: Session, profile: FarmerContext, deps: AssistantDeps = {}): Promise<AssistantReply> {
  s.history.push({ role: 'farmer', text, at: new Date().toISOString() });
  const out = await route(text, s, profile, deps);
  s.history.push({ role: 'assistant', text: out.text, at: new Date().toISOString() });
  if (s.history.length > 40) s.history.splice(0, s.history.length - 40);
  s.updatedAt = Date.now();
  return out;
}

async function route(text: string, s: Session, profile: FarmerContext, deps: AssistantDeps): Promise<AssistantReply> {
  const lang = s.lang;
  if (mentionsCredentials(text)) {
    return reply({ lang, intent: 'safety', kind: 'safety', confidence: 'high', text: CREDENTIAL_WARNING[lang], sources: [{ title: 'राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल', url: 'https://cybercrime.gov.in/', lastUpdated: '2026-11-13' }] });
  }

  const p = parse(text);
  // Merge slots: new mentions override.
  if (p.cropId) s.slots.cropId = p.cropId;
  if (p.districtId) s.slots.districtId = p.districtId;
  if (p.days !== undefined) s.slots.days = p.days;
  if (p.water) s.slots.water = p.water;
  if (p.landAcres !== undefined) s.slots.landAcres = p.landAcres;

  // A new explicit intent interrupts a pending one; otherwise continue the pending flow.
  let intent: Intent = p.intent;
  const continuing = s.pending && (p.intent === 'unknown' || p.intent === 'knowledge' || p.intent === s.pending.intent);
  if (continuing && s.pending) intent = s.pending.intent;
  else if (s.pending && p.intent !== s.pending.intent) s.pending = undefined;

  switch (intent) {
    case 'crop_problem':
      if (!continuing || !s.slots.problemText) s.slots.problemText = text;
      if (continuing && s.pending?.awaiting[0] === 'details') s.pending = { intent: 'crop_problem', awaiting: ['details_done'] };
      return handleCropProblem(text, s, profile, deps);
    case 'mandi':
      return handleMandi(s, profile, deps);
    case 'weather':
      return handleWeather(s, profile, deps);
    case 'scheme':
      if (continuing && s.pending?.awaiting.length) {
        const land = parseLandAcres(text);
        if (land !== undefined) s.slots.landAcres = land;
        if (s.pending.awaiting.includes('dbt')) {
          // "दो बीघा बा" must not be read as "yes, registered": use a bare yes/no only when
          // the farmer is not answering the land question in the same breath.
          if (p.dbtRegistered !== undefined) s.slots.dbtRegistered = p.dbtRegistered;
          else if (land === undefined) {
            const yn = parseYesNo(text);
            if (yn !== undefined) s.slots.dbtRegistered = yn;
          }
        }
        s.pending = { intent: 'scheme', awaiting: ['asked_once'] };
      }
      return handleScheme(text, s, profile);
    case 'greeting':
      return reply({
        lang, intent: 'greeting', kind: 'clarifying_question', confidence: 'high',
        text: t(lang,
          'नमस्ते! मैं बिहार किसान सहायक हूँ। आप खेती की समस्या, मंडी भाव, मौसम या सरकारी योजना के बारे में बोलकर पूछ सकते हैं।',
          'प्रणाम! हम बिहार किसान सहायक हईं। रउआ खेती के दिक्कत, मंडी भाव, मौसम भा सरकारी योजना के बारे में बोल के पूछ सकत बानी।'),
      });
    case 'knowledge':
      return handleKnowledge(text, s, profile, deps);
    default:
      return reply({
        lang, intent: 'unknown', kind: 'clarifying_question', confidence: 'low',
        text: t(lang,
          'माफ कीजिए, मैं ठीक से समझ नहीं पाया। क्या आप फसल की समस्या, मंडी भाव, मौसम या सरकारी योजना के बारे में पूछ रहे हैं?',
          'माफ करीं, हम ठीक से ना समझ पवनी। का रउआ फसल के दिक्कत, मंडी भाव, मौसम भा सरकारी योजना के बारे में पूछत बानी?'),
        followUps: [t(lang, 'मंडी भाव', 'मंडी भाव'), t(lang, 'मौसम', 'मौसम'), t(lang, 'सरकारी योजना', 'सरकारी योजना'), t(lang, 'फसल की समस्या', 'फसल के दिक्कत')],
      });
  }
}

