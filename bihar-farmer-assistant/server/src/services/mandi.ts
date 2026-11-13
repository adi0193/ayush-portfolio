/**
 * Mandi price service — AGMARKNET data via the data.gov.in Open Government Data API.
 *
 * Hard rules:
 * - Never fabricate a price. With no API key, no network, or no matching records, return
 *   `status: 'unavailable'` / `'no_records'` and say so.
 * - Always return the record's arrival date (the date the mandi reported) and our fetch
 *   time. Records older than STALE_DAYS are flagged `stale`.
 * - Label everything as WHOLESALE mandi prices (₹/quintal), not farm-gate offers.
 */
import { config } from '../lib/config.js';
import { TtlCache } from '../lib/cache.js';
import { fetchJson } from '../lib/http.js';
import { CROPS, type Crop } from '../data/crops.js';
import { DISTRICTS, type District } from '../data/districts.js';

export interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrivalDate: string; // ISO yyyy-mm-dd
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
}

export interface MandiResult {
  status: 'ok' | 'no_records' | 'unavailable';
  reason?: string;
  crop?: string;
  district?: string;
  /** Records in or nearest to the requested district, newest first. */
  records: MandiRecord[];
  latestArrivalDate?: string;
  stale: boolean;
  fetchedAt?: string;
  fromCache: boolean;
  source: { name: string; url: string };
  unit: 'INR per quintal';
  disclaimerHi: string;
}

export const STALE_DAYS = 3;
const SOURCE = {
  name: 'AGMARKNET (कृषि एवं किसान कल्याण मंत्रालय) via data.gov.in',
  url: 'https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi',
};
const DISCLAIMER =
  'यह मंडी का थोक भाव (₹ प्रति क्विंटल) है, जो मंडी ने बताया है। गाँव में व्यापारी का भाव इससे कम-ज्यादा हो सकता है। गुणवत्ता, नमी और ढुलाई खर्च से भी भाव बदलता है।';

const cache = new TtlCache<MandiRecord[]>(30 * 60 * 1000);

type RawRecord = Record<string, unknown>;

function norm(raw: RawRecord): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) out[k.toLowerCase().replace(/_x0020_/g, '_')] = String(v ?? '');
  return out;
}

/** dd/mm/yyyy → yyyy-mm-dd; passes ISO through. */
export function toIsoDate(s: string): string {
  const m = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(s.trim());
  if (m) return `${m[3]}-${m[2]!.padStart(2, '0')}-${m[1]!.padStart(2, '0')}`;
  return s.slice(0, 10);
}

export function parseRecords(json: { records?: RawRecord[] }): MandiRecord[] {
  return (json.records ?? [])
    .map(norm)
    .map((r) => ({
      state: r.state ?? '',
      district: r.district ?? '',
      market: r.market ?? '',
      commodity: r.commodity ?? '',
      variety: r.variety ?? '',
      arrivalDate: toIsoDate(r.arrival_date ?? ''),
      minPrice: Number(r.min_price),
      maxPrice: Number(r.max_price),
      modalPrice: Number(r.modal_price),
    }))
    .filter((r) => r.market && Number.isFinite(r.modalPrice) && r.modalPrice > 0);
}

function matchesCrop(rec: MandiRecord, crop: Crop): boolean {
  const c = rec.commodity.toLowerCase();
  return crop.agmarknet.some((a) => c.includes(a));
}

function daysOld(iso: string, now = new Date()): number {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return Infinity;
  return Math.floor((now.getTime() - t) / 86_400_000);
}

function haversineKm(a: District, b: District): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Districts ordered by distance from the farmer's district — used for "nearby mandi" comparisons. */
export function nearbyDistricts(origin: District, n = 4): District[] {
  return [...DISTRICTS].sort((a, b) => haversineKm(origin, a) - haversineKm(origin, b)).slice(0, n);
}

async function fetchBiharRecords(fetcher: typeof fetchJson): Promise<{ records: MandiRecord[]; fetchedAt: number; fromCache: boolean }> {
  const key = 'bihar-all';
  const hit = cache.get(key);
  if (hit) return { records: hit.value, fetchedAt: hit.fetchedAt, fromCache: true };

  const base = `https://api.data.gov.in/resource/${encodeURIComponent(config.mandiResourceId)}`;
  const qs = (filterKey: string) =>
    `${base}?api-key=${encodeURIComponent(config.dataGovApiKey)}&format=json&limit=2000&${encodeURIComponent(filterKey)}=Bihar`;

  // The OGD API has used both `filters[state]` and `filters[state.keyword]` over time.
  let json = await fetcher<{ records?: RawRecord[] }>(qs('filters[state.keyword]'), { retries: 1 });
  if (!json.records?.length) json = await fetcher<{ records?: RawRecord[] }>(qs('filters[state]'), { retries: 1 });
  const records = parseRecords(json);
  const entry = cache.set(key, records);
  return { records, fetchedAt: entry.fetchedAt, fromCache: false };
}

export async function getMandiPrices(
  params: { cropId: string; districtId?: string },
  deps: { fetcher?: typeof fetchJson; apiKey?: string; now?: Date } = {},
): Promise<MandiResult> {
  const crop = CROPS.find((c) => c.id === params.cropId);
  const district = DISTRICTS.find((d) => d.id === params.districtId);
  const base: Omit<MandiResult, 'status'> = {
    crop: crop?.id,
    district: district?.id,
    records: [],
    stale: false,
    fromCache: false,
    source: SOURCE,
    unit: 'INR per quintal',
    disclaimerHi: DISCLAIMER,
  };
  if (!crop) return { ...base, status: 'no_records', reason: 'unknown_crop' };

  const apiKey = deps.apiKey ?? config.dataGovApiKey;
  if (!apiKey) return { ...base, status: 'unavailable', reason: 'not_configured' };

  let all: MandiRecord[];
  let fetchedAt: number;
  let fromCache: boolean;
  try {
    ({ records: all, fetchedAt, fromCache } = await fetchBiharRecords(deps.fetcher ?? fetchJson));
  } catch {
    const stale = cache.getStale('bihar-all');
    if (!stale) return { ...base, status: 'unavailable', reason: 'upstream_error' };
    all = stale.value;
    fetchedAt = stale.fetchedAt;
    fromCache = true;
  }

  let records = all.filter((r) => matchesCrop(r, crop));
  if (district) {
    const order = nearbyDistricts(district, 6).map((d) => d.nameEn.toLowerCase());
    records = records
      .filter((r) => order.includes(r.district.toLowerCase()))
      .sort((a, b) => order.indexOf(a.district.toLowerCase()) - order.indexOf(b.district.toLowerCase()) || b.arrivalDate.localeCompare(a.arrivalDate));
  } else {
    records.sort((a, b) => b.arrivalDate.localeCompare(a.arrivalDate));
  }
  records = records.slice(0, 8);

  if (!records.length) return { ...base, status: 'no_records', fetchedAt: new Date(fetchedAt).toISOString(), fromCache };

  const latest = records.map((r) => r.arrivalDate).sort().at(-1)!;
  return {
    ...base,
    status: 'ok',
    records,
    latestArrivalDate: latest,
    stale: daysOld(latest, deps.now) > STALE_DAYS,
    fetchedAt: new Date(fetchedAt).toISOString(),
    fromCache,
  };
}

/** Test helper. */
export function __resetMandiCache(): void {
  (cache as unknown as { store: Map<string, unknown> }).store.clear();
}
