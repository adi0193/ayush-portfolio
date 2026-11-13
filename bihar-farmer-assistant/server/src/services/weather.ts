/**
 * Weather + agricultural alerts.
 *
 * Provider: Open-Meteo (free, no key, model-based forecast). It is NOT an official IMD
 * forecast. IMD's API (api.imd.gov.in) requires IP whitelisting; an `ImdProvider` can be
 * plugged in behind the same `WeatherProvider` interface once access is granted.
 *
 * Granularity: we query the district-HQ point, so every response is labelled
 * "district level". We never present it as a village forecast.
 *
 * Official warnings (IMD district warnings, BSDMA flood bulletins) are linked, not
 * re-generated: our rule-based alerts are advisories derived from the forecast numbers.
 */
import { config } from '../lib/config.js';
import { TtlCache } from '../lib/cache.js';
import { fetchJson } from '../lib/http.js';
import type { District } from '../data/districts.js';
import type { Lang } from '../lib/types.js';

export interface DailyForecast {
  date: string;
  tMax: number;
  tMin: number;
  rainMm: number;
  rainProbability: number | null;
  windMaxKmh: number;
}

export interface WeatherSnapshot {
  current: { temperature: number; humidity: number; windKmh: number; precipitationMm: number; time: string };
  daily: DailyForecast[];
}

export interface AgriAlert {
  id: 'heavy_rain' | 'very_heavy_rain' | 'heatwave' | 'cold_wave' | 'strong_wind' | 'dry_spell' | 'blight_risk' | 'spray_window';
  severity: 'info' | 'watch' | 'warning';
  titleHi: string;
  adviceHi: string;
  adviceBho: string;
}

export interface WeatherResult {
  status: 'ok' | 'unavailable';
  district: string;
  granularity: 'district_hq_point';
  provider: { name: string; url: string; official: boolean };
  officialWarningsUrl: string;
  fetchedAt?: string;
  fromCache: boolean;
  snapshot?: WeatherSnapshot;
  alerts: AgriAlert[];
}

export interface WeatherProvider {
  name: string;
  fetch(lat: number, lon: number): Promise<WeatherSnapshot>;
}

interface OpenMeteoResponse {
  current?: { time: string; temperature_2m: number; relative_humidity_2m: number; wind_speed_10m: number; precipitation: number };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max?: (number | null)[];
    wind_speed_10m_max: number[];
  };
}

export const openMeteoProvider: WeatherProvider = {
  name: 'Open-Meteo',
  async fetch(lat, lon) {
    const url =
      `${config.openMeteoBase}?latitude=${lat}&longitude=${lon}` +
      '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation' +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max' +
      '&timezone=Asia%2FKolkata&forecast_days=5';
    const j = await fetchJson<OpenMeteoResponse>(url, { retries: 1 });
    return parseOpenMeteo(j);
  },
};

export function parseOpenMeteo(j: OpenMeteoResponse): WeatherSnapshot {
  if (!j.current || !j.daily) throw new Error('malformed weather response');
  const d = j.daily;
  return {
    current: {
      temperature: j.current.temperature_2m,
      humidity: j.current.relative_humidity_2m,
      windKmh: j.current.wind_speed_10m,
      precipitationMm: j.current.precipitation,
      time: j.current.time,
    },
    daily: d.time.map((date, i) => ({
      date,
      tMax: d.temperature_2m_max[i] ?? NaN,
      tMin: d.temperature_2m_min[i] ?? NaN,
      rainMm: d.precipitation_sum[i] ?? 0,
      rainProbability: d.precipitation_probability_max?.[i] ?? null,
      windMaxKmh: d.wind_speed_10m_max[i] ?? 0,
    })),
  };
}

/**
 * Rule-based agricultural advisories. Thresholds follow IMD's rainfall intensity
 * categories (heavy ≥64.5 mm/day, very heavy ≥115.6 mm/day) and IMD plains heatwave
 * criterion (max ≥40 °C used here as a "watch" trigger, ≥45 °C as warning).
 * They are advisories, not official warnings.
 */
export function deriveAlerts(s: WeatherSnapshot): AgriAlert[] {
  const alerts: AgriAlert[] = [];
  const next2 = s.daily.slice(0, 2);
  const next5 = s.daily.slice(0, 5);
  const rain48 = next2.reduce((a, x) => a + x.rainMm, 0);
  const maxDayRain = Math.max(0, ...next2.map((x) => x.rainMm));

  if (maxDayRain >= 115.6) {
    alerts.push({
      id: 'very_heavy_rain', severity: 'warning', titleHi: 'बहुत भारी बारिश की संभावना (48 घंटे)',
      adviceHi: 'अगले 48 घंटे में बहुत भारी बारिश की संभावना है। खेत से पानी निकालने की व्यवस्था तैयार रखें, कटी फसल ऊँची जगह रखें और छिड़काव टाल दें। BSDMA/जिला प्रशासन की बाढ़ सूचना पर ध्यान दें।',
      adviceBho: 'अगिला 48 घंटा में बहुत भारी बरखा के संभावना बा। खेत से पानी निकाले के इंतजाम राखीं, कटल फसल ऊँच जगह राखीं आ छिड़काव रोक दीं। बाढ़ के सरकारी सूचना पर ध्यान दीं।',
    });
  } else if (maxDayRain >= 64.5 || rain48 >= 80) {
    alerts.push({
      id: 'heavy_rain', severity: 'watch', titleHi: 'तेज बारिश की संभावना (48 घंटे)',
      adviceHi: 'अगले 48 घंटे में आपके इलाके में तेज बारिश की संभावना है। खेत में पानी निकालने की व्यवस्था तैयार रखें और खाद/दवा का छिड़काव अभी न करें।',
      adviceBho: 'अगिला 48 घंटा में रउआ इलाका में तेज बरखा के संभावना बा। खेत से पानी निकाले के नाली तइयार राखीं आ खाद-दवाई अभी मत छिड़कीं।',
    });
  }

  const maxT = Math.max(...next5.map((x) => x.tMax));
  if (maxT >= 45) {
    alerts.push({ id: 'heatwave', severity: 'warning', titleHi: 'भीषण गर्मी/लू', adviceHi: 'तापमान 45°C या अधिक हो सकता है। सिंचाई सुबह-शाम करें, दोपहर में खेत में काम न करें, पशुओं को छाया-पानी दें।', adviceBho: 'तापमान 45°C से ऊपर जा सकेला। पटवन भोरे-साँझ करीं, दुपहरिया में खेत में काम मत करीं, माल-मवेशी के छाँह-पानी दीं।' });
  } else if (maxT >= 40) {
    alerts.push({ id: 'heatwave', severity: 'watch', titleHi: 'तेज गर्मी', adviceHi: 'तापमान 40°C के ऊपर रह सकता है। फसल में नमी बनाए रखें, सिंचाई सुबह-शाम करें, दोपहर में छिड़काव न करें।', adviceBho: 'तापमान 40°C से ऊपर रह सकेला। खेत में नमी बनवले राखीं, पटवन भोरे-साँझ करीं।' });
  }

  const minT = Math.min(...next5.map((x) => x.tMin));
  if (minT <= 5) {
    alerts.push({ id: 'cold_wave', severity: 'watch', titleHi: 'तेज ठंड / पाले का खतरा', adviceHi: 'रात का तापमान 5°C या कम हो सकता है। पाले से बचाव के लिए हल्की सिंचाई करें; आलू, सरसों और सब्जियों पर नजर रखें।', adviceBho: 'रात के तापमान 5°C भा कम हो सकेला। पाला से बचावे खातिर हल्का पटवन करीं; आलू, सरसो आ सब्जी पर नजर राखीं।' });
  }

  // Cool + humid + rain → late-blight-favourable conditions for potato (rabi).
  const humidCool = next5.filter((x) => x.tMax <= 24 && x.tMin >= 8 && (x.rainMm > 0 || (x.rainProbability ?? 0) >= 50)).length;
  if (humidCool >= 2 && s.current.humidity >= 80) {
    alerts.push({ id: 'blight_risk', severity: 'watch', titleHi: 'आलू में झुलसा रोग के अनुकूल मौसम', adviceHi: 'ठंडा, नम और बदली वाला मौसम आलू में पछेती झुलसा के लिए अनुकूल है। खेत रोज देखें और लक्षण दिखें तो KVK से संपर्क करें।', adviceBho: 'ठंडा, नम आ बदरी वाला मौसम आलू में झुलसा रोग खातिर अनुकूल बा। रोज खेत देखीं आ लच्छन लउके त KVK से बात करीं।' });
  }

  const maxWind = Math.max(...next2.map((x) => x.windMaxKmh));
  if (maxWind >= 40) {
    alerts.push({ id: 'strong_wind', severity: 'watch', titleHi: 'तेज हवा', adviceHi: 'तेज हवा चल सकती है। छिड़काव न करें; केला, मक्का और गन्ने जैसी ऊँची फसलों को सहारा दें।', adviceBho: 'तेज हवा चल सकेला। छिड़काव मत करीं; केरा, मकई आ ऊख के सहारा दीं।' });
  }

  const dry = next5.every((x) => x.rainMm < 1) && maxT >= 33;
  if (dry && !alerts.some((a) => a.id === 'heatwave')) {
    alerts.push({ id: 'dry_spell', severity: 'info', titleHi: 'अगले 5 दिन बारिश की संभावना कम', adviceHi: 'अगले 5 दिन बारिश की संभावना कम है। फसल की अवस्था देखकर सिंचाई की योजना बनाएँ।', adviceBho: 'अगिला 5 दिन बरखा के संभावना कम बा। फसल देख के पटवन के तइयारी करीं।' });
  }

  if (!alerts.some((a) => a.severity !== 'info') && rain48 < 2 && maxWind < 20) {
    alerts.push({ id: 'spray_window', severity: 'info', titleHi: 'छिड़काव के लिए मौसम ठीक', adviceHi: 'अगले 48 घंटे बारिश और तेज हवा की संभावना कम है – जरूरत हो तो छिड़काव के लिए उपयुक्त समय।', adviceBho: 'अगिला 48 घंटा बरखा आ तेज हवा के संभावना कम बा – जरूरत होखे त छिड़काव खातिर ठीक समय बा।' });
  }
  return alerts;
}

const cache = new TtlCache<WeatherSnapshot>(60 * 60 * 1000);

export async function getWeather(district: District, provider: WeatherProvider = openMeteoProvider): Promise<WeatherResult> {
  const base = {
    district: district.id,
    granularity: 'district_hq_point' as const,
    provider: { name: provider.name, url: 'https://open-meteo.com/', official: false },
    officialWarningsUrl: 'https://mausam.imd.gov.in/',
  };
  const hit = cache.get(district.id);
  if (hit) return { ...base, status: 'ok', fromCache: true, fetchedAt: new Date(hit.fetchedAt).toISOString(), snapshot: hit.value, alerts: deriveAlerts(hit.value) };
  try {
    const snap = await provider.fetch(district.lat, district.lon);
    const e = cache.set(district.id, snap);
    return { ...base, status: 'ok', fromCache: false, fetchedAt: new Date(e.fetchedAt).toISOString(), snapshot: snap, alerts: deriveAlerts(snap) };
  } catch {
    return { ...base, status: 'unavailable', fromCache: false, alerts: [] };
  }
}

export function weatherSummary(r: WeatherResult, districtNameHi: string, lang: Lang): string {
  if (r.status !== 'ok' || !r.snapshot) {
    return lang === 'bho'
      ? `माफ करीं, अभी ${districtNameHi} के मौसम जानकारी ना मिल पावत बा। थोड़ा देर बाद फेर से पूछीं, भा IMD के वेबसाइट देखीं।`
      : `माफ कीजिए, अभी ${districtNameHi} की मौसम जानकारी नहीं मिल पा रही है। थोड़ी देर बाद फिर पूछें या IMD की वेबसाइट देखें।`;
  }
  const c = r.snapshot.current;
  const today = r.snapshot.daily[0];
  const rain2 = r.snapshot.daily.slice(0, 2).reduce((a, x) => a + x.rainMm, 0);
  const head =
    lang === 'bho'
      ? `${districtNameHi} (जिला स्तर) में अभी तापमान ${Math.round(c.temperature)}°C आ नमी ${Math.round(c.humidity)}% बा। आज अधिकतम ${Math.round(today?.tMax ?? c.temperature)}°C। अगिला 48 घंटा में करीब ${Math.round(rain2)} मिमी बरखा के अनुमान बा।`
      : `${districtNameHi} (जिला स्तर) में अभी तापमान ${Math.round(c.temperature)}°C और नमी ${Math.round(c.humidity)}% है। आज अधिकतम ${Math.round(today?.tMax ?? c.temperature)}°C। अगले 48 घंटे में लगभग ${Math.round(rain2)} मिमी बारिश का अनुमान है।`;
  const alertText = r.alerts.filter((a) => a.severity !== 'info').map((a) => (lang === 'bho' ? a.adviceBho : a.adviceHi)).join(' ');
  const tail = lang === 'bho' ? ' (ई मॉडल पर आधारित अनुमान ह, सरकारी IMD चेतावनी ना।)' : ' (यह मॉडल आधारित अनुमान है, IMD की आधिकारिक चेतावनी नहीं।)';
  return head + (alertText ? ' ' + alertText : '') + tail;
}

export function __resetWeatherCache(): void {
  (cache as unknown as { store: Map<string, unknown> }).store.clear();
}
