/**
 * Bihar's 38 districts with their agro-climatic zone and a district-headquarters point.
 *
 * - Zones follow the standard four-zone classification used by Bihar Agricultural
 *   University / ICAR (Zone I North-West, Zone II North-East, Zone IIIA South-East,
 *   Zone IIIB South-West alluvial plains).
 * - lat/lon are APPROXIMATE district-headquarters coordinates, used only to fetch
 *   district-level weather. They must never be presented as village-level precision.
 * - `riskTags` and `cropHypotheses` are starting hypotheses from secondary literature.
 *   They are marked `verified: false` and must be validated block-by-block with the
 *   district agriculture office / KVK before being used to *recommend* anything.
 *   The assistant only uses them to choose which follow-up question to ask.
 */
export type AgroZone = 'I' | 'II' | 'IIIA' | 'IIIB';
export type RiskTag = 'flood' | 'drought' | 'waterlogging' | 'heat';

export interface District {
  id: string;
  nameEn: string;
  nameHi: string;
  hq: string;
  zone: AgroZone;
  lat: number;
  lon: number;
  riskTags: RiskTag[];
  cropHypotheses: string[];
  verified: false;
}

const d = (
  id: string,
  nameEn: string,
  nameHi: string,
  hq: string,
  zone: AgroZone,
  lat: number,
  lon: number,
  riskTags: RiskTag[],
  cropHypotheses: string[],
): District => ({ id, nameEn, nameHi, hq, zone, lat, lon, riskTags, cropHypotheses, verified: false });

export const DISTRICTS: District[] = [
  // Zone I – North-West Alluvial Plains
  d('west-champaran', 'West Champaran', 'पश्चिम चंपारण', 'Bettiah', 'I', 26.8, 84.5, ['flood'], ['paddy', 'sugarcane', 'wheat', 'maize']),
  d('east-champaran', 'East Champaran', 'पूर्वी चंपारण', 'Motihari', 'I', 26.65, 84.92, ['flood'], ['paddy', 'sugarcane', 'wheat', 'maize']),
  d('sitamarhi', 'Sitamarhi', 'सीतामढ़ी', 'Sitamarhi', 'I', 26.6, 85.48, ['flood'], ['paddy', 'wheat', 'maize', 'sugarcane']),
  d('sheohar', 'Sheohar', 'शिवहर', 'Sheohar', 'I', 26.51, 85.29, ['flood'], ['paddy', 'wheat', 'maize']),
  d('muzaffarpur', 'Muzaffarpur', 'मुजफ्फरपुर', 'Muzaffarpur', 'I', 26.12, 85.39, ['flood', 'heat'], ['litchi', 'paddy', 'wheat', 'maize', 'vegetables']),
  d('vaishali', 'Vaishali', 'वैशाली', 'Hajipur', 'I', 25.69, 85.21, ['flood'], ['banana', 'vegetables', 'maize', 'wheat']),
  d('saran', 'Saran', 'सारण', 'Chhapra', 'I', 25.78, 84.73, ['flood'], ['paddy', 'wheat', 'maize', 'pulses']),
  d('siwan', 'Siwan', 'सीवान', 'Siwan', 'I', 26.22, 84.36, [], ['paddy', 'wheat', 'sugarcane']),
  d('gopalganj', 'Gopalganj', 'गोपालगंज', 'Gopalganj', 'I', 26.47, 84.44, ['flood'], ['sugarcane', 'paddy', 'wheat']),
  d('darbhanga', 'Darbhanga', 'दरभंगा', 'Darbhanga', 'I', 26.15, 85.9, ['flood', 'waterlogging'], ['makhana', 'paddy', 'wheat', 'mango']),
  d('madhubani', 'Madhubani', 'मधुबनी', 'Madhubani', 'I', 26.35, 86.07, ['flood', 'waterlogging'], ['makhana', 'paddy', 'wheat', 'mango']),
  d('samastipur', 'Samastipur', 'समस्तीपुर', 'Samastipur', 'I', 25.86, 85.78, ['flood'], ['maize', 'tobacco', 'paddy', 'wheat', 'vegetables']),
  d('begusarai', 'Begusarai', 'बेगूसराय', 'Begusarai', 'I', 25.42, 86.13, ['flood'], ['maize', 'wheat', 'pulses', 'vegetables']),
  // Zone II – North-East Alluvial Plains (Kosi–Seemanchal)
  d('purnia', 'Purnia', 'पूर्णिया', 'Purnia', 'II', 25.78, 87.47, ['flood'], ['maize', 'makhana', 'paddy', 'jute', 'banana']),
  d('katihar', 'Katihar', 'कटिहार', 'Katihar', 'II', 25.54, 87.58, ['flood'], ['maize', 'makhana', 'paddy', 'banana']),
  d('araria', 'Araria', 'अररिया', 'Araria', 'II', 26.15, 87.47, ['flood'], ['paddy', 'jute', 'maize']),
  d('kishanganj', 'Kishanganj', 'किशनगंज', 'Kishanganj', 'II', 26.1, 87.95, ['flood'], ['paddy', 'jute', 'tea', 'pineapple']),
  d('saharsa', 'Saharsa', 'सहरसा', 'Saharsa', 'II', 25.88, 86.6, ['flood', 'waterlogging'], ['makhana', 'paddy', 'maize']),
  d('supaul', 'Supaul', 'सुपौल', 'Supaul', 'II', 26.12, 86.6, ['flood'], ['paddy', 'maize', 'wheat']),
  d('madhepura', 'Madhepura', 'मधेपुरा', 'Madhepura', 'II', 25.92, 86.79, ['flood'], ['maize', 'paddy', 'makhana']),
  d('khagaria', 'Khagaria', 'खगड़िया', 'Khagaria', 'II', 25.5, 86.47, ['flood'], ['maize', 'banana', 'wheat']),
  // Zone IIIA – South-East Alluvial Plains
  d('bhagalpur', 'Bhagalpur', 'भागलपुर', 'Bhagalpur', 'IIIA', 25.24, 86.97, ['flood'], ['mango', 'paddy', 'wheat', 'maize']),
  d('banka', 'Banka', 'बांका', 'Banka', 'IIIA', 24.88, 86.92, ['drought'], ['paddy', 'pulses', 'maize']),
  d('munger', 'Munger', 'मुंगेर', 'Munger', 'IIIA', 25.37, 86.47, ['flood'], ['paddy', 'wheat', 'pulses']),
  d('lakhisarai', 'Lakhisarai', 'लखीसराय', 'Lakhisarai', 'IIIA', 25.17, 86.09, ['waterlogging'], ['pulses', 'paddy', 'wheat']),
  d('sheikhpura', 'Sheikhpura', 'शेखपुरा', 'Sheikhpura', 'IIIA', 25.14, 85.85, ['waterlogging', 'drought'], ['pulses', 'paddy', 'wheat']),
  d('jamui', 'Jamui', 'जमुई', 'Jamui', 'IIIA', 24.92, 86.22, ['drought'], ['paddy', 'maize', 'pulses']),
  // Zone IIIB – South-West Alluvial Plains (Magadh–Shahabad)
  d('patna', 'Patna', 'पटना', 'Patna', 'IIIB', 25.59, 85.14, ['flood', 'heat'], ['paddy', 'wheat', 'vegetables', 'pulses']),
  d('nalanda', 'Nalanda', 'नालंदा', 'Bihar Sharif', 'IIIB', 25.2, 85.52, ['heat'], ['potato', 'onion', 'paddy', 'wheat', 'vegetables']),
  d('bhojpur', 'Bhojpur', 'भोजपुर', 'Arrah', 'IIIB', 25.56, 84.66, ['heat'], ['paddy', 'wheat', 'pulses']),
  d('buxar', 'Buxar', 'बक्सर', 'Buxar', 'IIIB', 25.56, 83.98, ['heat'], ['paddy', 'wheat', 'pulses']),
  d('rohtas', 'Rohtas', 'रोहतास', 'Sasaram', 'IIIB', 24.95, 84.03, ['heat'], ['paddy', 'wheat', 'pulses']),
  d('kaimur', 'Kaimur', 'कैमूर', 'Bhabua', 'IIIB', 25.04, 83.61, ['drought', 'heat'], ['paddy', 'wheat', 'pulses']),
  d('gaya', 'Gaya', 'गया', 'Gaya', 'IIIB', 24.79, 85.0, ['drought', 'heat'], ['paddy', 'wheat', 'pulses', 'vegetables']),
  d('jehanabad', 'Jehanabad', 'जहानाबाद', 'Jehanabad', 'IIIB', 25.21, 84.99, ['drought', 'heat'], ['paddy', 'wheat', 'pulses']),
  d('arwal', 'Arwal', 'अरवल', 'Arwal', 'IIIB', 25.25, 84.68, ['drought', 'heat'], ['paddy', 'wheat']),
  d('nawada', 'Nawada', 'नवादा', 'Nawada', 'IIIB', 24.88, 85.54, ['drought', 'heat'], ['paddy', 'wheat', 'pulses', 'vegetables']),
  d('aurangabad', 'Aurangabad', 'औरंगाबाद', 'Aurangabad', 'IIIB', 24.75, 84.37, ['drought', 'heat'], ['paddy', 'wheat', 'pulses']),
];

export const ZONE_LABEL_HI: Record<AgroZone, string> = {
  I: 'उत्तर-पश्चिम जलोढ़ मैदान (ज़ोन I)',
  II: 'उत्तर-पूर्व जलोढ़ मैदान (ज़ोन II)',
  IIIA: 'दक्षिण-पूर्व जलोढ़ मैदान (ज़ोन IIIA)',
  IIIB: 'दक्षिण-पश्चिम जलोढ़ मैदान (ज़ोन IIIB)',
};

export function findDistrict(idOrName: string | undefined | null): District | undefined {
  if (!idOrName) return undefined;
  const q = idOrName.trim().toLowerCase();
  return DISTRICTS.find(
    (x) => x.id === q || x.nameEn.toLowerCase() === q || x.nameHi === idOrName.trim() || x.hq.toLowerCase() === q,
  );
}

/** Finds a district mentioned anywhere in free text (Hindi or English names, HQ town). */
export function detectDistrictInText(text: string): District | undefined {
  const lower = text.toLowerCase();
  // Longest names first so "पश्चिम चंपारण" wins over a shorter accidental match.
  const candidates = [...DISTRICTS].sort((a, b) => b.nameHi.length - a.nameHi.length);
  for (const x of candidates) {
    if (text.includes(x.nameHi) || lower.includes(x.nameEn.toLowerCase()) || lower.includes(x.hq.toLowerCase())) {
      return x;
    }
  }
  // Common spoken spelling variants.
  const variants: Record<string, string> = {
    'मुजफ्फरपुर': 'muzaffarpur', 'मुज़फ़्फ़रपुर': 'muzaffarpur', 'पुरनिया': 'purnia', 'पूर्णियाँ': 'purnia',
    'बेतिया': 'west-champaran', 'मोतिहारी': 'east-champaran', 'छपरा': 'saran', 'हाजीपुर': 'vaishali',
    'आरा': 'bhojpur', 'सासाराम': 'rohtas', 'भभुआ': 'kaimur', 'बिहारशरीफ': 'nalanda', 'बिहार शरीफ': 'nalanda',
  };
  for (const [word, id] of Object.entries(variants)) {
    if (text.includes(word)) return findDistrict(id);
  }
  return undefined;
}
