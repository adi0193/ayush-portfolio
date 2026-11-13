/**
 * Crop lexicon. `spoken` lists words farmers actually say (Hindi, Bhojpuri and regional
 * variants). Extend these lists from field-interview transcripts — do not assume one
 * spelling per crop.
 *
 * `agmarknet` holds the commodity names used in AGMARKNET / data.gov.in records,
 * matched case-insensitively with `includes`.
 */
export interface Crop {
  id: string;
  nameHi: string;
  nameBho: string;
  spoken: string[];
  agmarknet: string[];
  seasons: Array<'kharif' | 'rabi' | 'zaid' | 'perennial'>;
}

export const CROPS: Crop[] = [
  { id: 'paddy', nameHi: 'धान', nameBho: 'धान', spoken: ['धान', 'चावल', 'paddy', 'rice', 'धनवा'], agmarknet: ['paddy', 'rice'], seasons: ['kharif'] },
  { id: 'wheat', nameHi: 'गेहूं', nameBho: 'गेहूँ', spoken: ['गेहूं', 'गेहूँ', 'गेंहू', 'गहूम', 'wheat'], agmarknet: ['wheat'], seasons: ['rabi'] },
  { id: 'maize', nameHi: 'मक्का', nameBho: 'मकई', spoken: ['मक्का', 'मकई', 'मकाई', 'maize', 'corn', 'भुट्टा'], agmarknet: ['maize'], seasons: ['kharif', 'rabi', 'zaid'] },
  { id: 'lentil', nameHi: 'मसूर', nameBho: 'मसूर', spoken: ['मसूर', 'masoor', 'lentil'], agmarknet: ['lentil', 'masur'], seasons: ['rabi'] },
  { id: 'gram', nameHi: 'चना', nameBho: 'बूट', spoken: ['चना', 'बूट', 'gram', 'chana'], agmarknet: ['bengal gram', 'gram'], seasons: ['rabi'] },
  { id: 'arhar', nameHi: 'अरहर', nameBho: 'रहर', spoken: ['अरहर', 'रहर', 'तूर', 'arhar', 'tur'], agmarknet: ['arhar', 'tur'], seasons: ['kharif'] },
  { id: 'mustard', nameHi: 'सरसों', nameBho: 'सरसो', spoken: ['सरसों', 'सरसो', 'तोरी', 'राई', 'mustard'], agmarknet: ['mustard'], seasons: ['rabi'] },
  { id: 'sugarcane', nameHi: 'गन्ना', nameBho: 'ऊख', spoken: ['गन्ना', 'ऊख', 'ईख', 'sugarcane'], agmarknet: ['sugarcane'], seasons: ['perennial'] },
  { id: 'potato', nameHi: 'आलू', nameBho: 'आलू', spoken: ['आलू', 'आलुआ', 'potato'], agmarknet: ['potato'], seasons: ['rabi'] },
  { id: 'onion', nameHi: 'प्याज', nameBho: 'पियाज', spoken: ['प्याज', 'पियाज', 'प्याज़', 'onion'], agmarknet: ['onion'], seasons: ['rabi'] },
  { id: 'tomato', nameHi: 'टमाटर', nameBho: 'टमाटर', spoken: ['टमाटर', 'tomato'], agmarknet: ['tomato'], seasons: ['rabi'] },
  { id: 'cauliflower', nameHi: 'फूलगोभी', nameBho: 'फूलगोभी', spoken: ['फूलगोभी', 'गोभी', 'cauliflower'], agmarknet: ['cauliflower'], seasons: ['rabi'] },
  { id: 'litchi', nameHi: 'लीची', nameBho: 'लीची', spoken: ['लीची', 'litchi', 'lychee'], agmarknet: ['litchi'], seasons: ['perennial'] },
  { id: 'mango', nameHi: 'आम', nameBho: 'आम', spoken: ['आम', 'मालदह', 'mango'], agmarknet: ['mango'], seasons: ['perennial'] },
  { id: 'banana', nameHi: 'केला', nameBho: 'केरा', spoken: ['केला', 'केरा', 'banana'], agmarknet: ['banana'], seasons: ['perennial'] },
  { id: 'makhana', nameHi: 'मखाना', nameBho: 'मखाना', spoken: ['मखाना', 'makhana', 'fox nut'], agmarknet: ['makhana', 'foxnut'], seasons: ['perennial'] },
];

export function findCrop(id: string | undefined | null): Crop | undefined {
  return id ? CROPS.find((c) => c.id === id) : undefined;
}

export function detectCropInText(text: string): Crop | undefined {
  const lower = text.toLowerCase();
  // "आम" is a common word ("आम तौर पर"); only match it as a whole word.
  for (const crop of CROPS) {
    for (const w of crop.spoken) {
      if (w === 'आम') {
        if (/(^|\s)आम(?=$|[\s।,?])/.test(text) && !/आम\s*(तौर|तौर पर|आदमी|जनता|लोग|बात)/.test(text)) return crop;
        continue;
      }
      if (lower.includes(w.toLowerCase())) return crop;
    }
  }
  return undefined;
}

export type Season = 'kharif' | 'rabi' | 'zaid';

/** Bihar cropping seasons by month (approximate; sowing windows vary by zone and variety). */
export function currentSeason(date = new Date()): Season {
  const m = date.getMonth() + 1;
  if (m >= 6 && m <= 10) return 'kharif';
  if (m >= 11 || m <= 2) return 'rabi';
  return 'zaid';
}

export const SEASON_HI: Record<Season, string> = { kharif: 'खरीफ', rabi: 'रबी', zaid: 'गरमा/जायद' };
