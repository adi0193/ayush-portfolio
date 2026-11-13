/**
 * Lightweight NLU for Hindi + Bhojpuri farmer utterances (text from STT or typed).
 *
 * Rule-based on purpose for the MVP: it is explainable, testable, works with no API, and
 * every misunderstanding found in field tests can be fixed by adding a word to a list.
 * Lexicons include regional Bhojpuri variants (e.g. पीयर/पियर, बरखा, भाव/रेट) and
 * should be grown from real interview transcripts.
 */
import { detectCropInText } from '../data/crops.js';
import { detectDistrictInText } from '../data/districts.js';

export type Intent = 'mandi' | 'weather' | 'scheme' | 'crop_problem' | 'knowledge' | 'greeting' | 'unknown';

const LEX: Record<Exclude<Intent, 'knowledge' | 'unknown'>, RegExp> = {
  mandi: /(भाव|रेट|दाम|कीमत|मंडी|बजार|बाजार|बेचे|बेचीं|बेचल|बिकी|बिकत|price|rate|mandi)/i,
  weather: /(मौसम|बारिश|बरखा|बरसात|पानी पड़|पानी परी|आंधी|आँधी|तूफान|तापमान|गर्मी|गरमी|लू(?=$|[\s।,.?!])|ठंड|जाड़ा|कुहासा|कोहरा|weather|rain)/i,
  scheme: /(योजना|सरकार|सरकारी|अनुदान|सब्सिडी|subsidy|मदद|सहायता|किस्त|सम्मान निधि|बीमा|kcc|केसीसी|लोन|कर्ज|करजा|pm.?kisan|पीएम किसान|पंजीकरण|रजिस्ट्रेशन)/i,
  crop_problem: /(पीला|पीली|पीयर|पियर|पीअर|सूख|रोग|बेमारी|बीमारी|कीड़ा|कीड़ा|कीट|धब्बा|सड़|मुरझा|झुलस|गल रहल|गल रहा|छेद|लाही|माहू|फफूंद|फाट|झड़|मर रहल|मर रहा)/i,
  greeting: /^(नमस्ते|प्रणाम|राम राम|हेलो|hello|hi)(?=$|[\s।,.?!])/i,
};

export interface Parsed {
  intent: Intent;
  cropId?: string;
  districtId?: string;
  days?: number;
  water?: 'standing' | 'dry';
  landAcres?: number;
  dbtRegistered?: boolean;
  schemeNeeds: string[];
}

const DEV_DIGITS: Record<string, string> = { '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9' };
export const toLatinDigits = (s: string) => s.replace(/[०-९]/g, (d) => DEV_DIGITS[d] ?? d);

const WORD_NUM: Record<string, number> = { 'एक': 1, 'दो': 2, 'दु': 2, 'दुगो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5, 'पाँच': 5, 'छह': 6, 'सात': 7, 'आठ': 8, 'दस': 10, 'बीस': 20, 'पच्चीस': 25, 'तीस': 30, 'चालीस': 40, 'पचास': 50, 'साठ': 60, 'आधा': 0.5 };

function numberBefore(text: string, unit: RegExp): number | undefined {
  const t = toLatinDigits(text);
  const m = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(?:${unit.source})`, 'i').exec(t);
  if (m) return Number(m[1]);
  for (const [w, n] of Object.entries(WORD_NUM)) {
    if (new RegExp(`${w}\\s*(?:${unit.source})`, 'i').test(t)) return n;
  }
  return undefined;
}

/**
 * Land units. Bihar's bigha and katha vary by district; we use common approximations
 * (1 bigha ≈ 0.625 acre, 20 katha = 1 bigha) only to pick eligibility hints, never for
 * any calculation shown as exact.
 */
export function parseLandAcres(text: string): number | undefined {
  const acre = numberBefore(text, /एकड़|एकड|acre/);
  if (acre !== undefined) return acre;
  const bigha = numberBefore(text, /बीघा|बिगहा|bigha/);
  if (bigha !== undefined) return +(bigha * 0.625).toFixed(2);
  const katha = numberBefore(text, /कट्ठा|कठ्ठा|katha/);
  if (katha !== undefined) return +((katha / 20) * 0.625).toFixed(2);
  const ha = numberBefore(text, /हेक्टेयर|hectare/);
  if (ha !== undefined) return +(ha * 2.471).toFixed(2);
  return undefined;
}

export function parseDays(text: string): number | undefined {
  const d = numberBefore(text, /दिन|day/);
  if (d !== undefined) return d;
  const weeks = numberBefore(text, /हफ्ता|हफ्ते|सप्ताह|week/);
  if (weeks !== undefined) return weeks * 7;
  const months = numberBefore(text, /महीना|महीने|माह|month/);
  return months !== undefined ? months * 30 : undefined;
}

export function parseWater(text: string): 'standing' | 'dry' | undefined {
  if (/(सूखल|सूखा|सुखल|पानी ना|पानी नहीं|पानी नइखे|dry)/i.test(text)) return 'dry';
  if (/(पानी\s*(बा|है|भरल|भरा|लागल|लगा|जमा)|पानी में|standing water)/i.test(text)) return 'standing';
  return undefined;
}

export function parseYesNo(text: string): boolean | undefined {
  // \b does not work for Devanagari in JS regex, so word ends are explicit.
  const E = '(?=$|[\\s।,.?!])';
  if (new RegExp(`(नहीं|(^|\\s)ना${E}|नइखे|नईखे|ना बा|(^|\\s)no${E}|ना हो)`, 'i').test(text)) return false;
  if (new RegExp(`(हाँ|हां|हँ|(^|\\s)जी${E}|बा${E}|है${E}|हो गइल|करवले बानी|(^|\\s)yes${E})`, 'i').test(text)) return true;
  return undefined;
}

export function parseSchemeNeeds(text: string): string[] {
  const needs: string[] = [];
  const add = (re: RegExp, tag: string) => re.test(text) && needs.push(tag);
  add(/(खाद|बीज|बिया|seed|fertili)/i, 'input');
  add(/(बीज|बिया|seed)/i, 'seed');
  add(/(मशीन|यंत्र|ट्रैक्टर|थ्रेसर|machine)/i, 'machinery');
  add(/(बीमा|नुकसान|बाढ़|सूखा|insurance)/i, 'insurance');
  add(/(बाढ़|सूखा|आपदा|नुकसान|ओला)/i, 'disaster');
  add(/(लोन|कर्ज|करजा|kcc|केसीसी|credit)/i, 'credit');
  add(/(किस्त|सम्मान निधि|pm.?kisan|पीएम किसान|६०००|6000)/i, 'income');
  add(/(मिट्टी|माटी|soil)/i, 'soil');
  add(/(पटवन|सिंचाई|डीजल|पंप|irrigation)/i, 'irrigation');
  add(/(बगइचा|बागवानी|फल|मखाना|सब्जी|horticulture)/i, 'horticulture');
  return [...new Set(needs)];
}

export function parse(text: string): Parsed {
  let intent: Intent = 'unknown';
  // Order matters: a crop symptom mentioned with "का करीं" is a problem, not a price query.
  if (LEX.crop_problem.test(text)) intent = 'crop_problem';
  else if (LEX.mandi.test(text)) intent = 'mandi';
  else if (LEX.weather.test(text)) intent = 'weather';
  else if (LEX.scheme.test(text)) intent = 'scheme';
  else if (LEX.greeting.test(text.trim())) intent = 'greeting';
  else if (detectCropInText(text) || /(खेती|बुआई|बोआई|खाद|पटवन|सिंचाई|कब|कइसे|कैसे|किस्म)/.test(text)) intent = 'knowledge';

  return {
    intent,
    cropId: detectCropInText(text)?.id,
    districtId: detectDistrictInText(text)?.id,
    days: parseDays(text),
    water: parseWater(text),
    landAcres: parseLandAcres(text),
    dbtRegistered: /(पंजीकरण|रजिस्ट्रेशन|registration)/i.test(text) ? parseYesNo(text) : undefined,
    schemeNeeds: parseSchemeNeeds(text),
  };
}
