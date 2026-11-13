export type Lang = 'hi' | 'bho';

export interface SourceRef { title: string; url: string; lastUpdated: string; status?: string }

export interface AssistantReply {
  text: string;
  lang: Lang;
  kind: 'data' | 'knowledge' | 'ai_explanation' | 'clarifying_question' | 'no_data' | 'safety';
  confidence: 'high' | 'medium' | 'low';
  followUps: string[];
  sources: SourceRef[];
  suggestExpert: boolean;
  intent: string;
}

export interface Profile {
  name?: string;
  preferredLang: Lang;
  district?: string;
  block?: string;
  village?: string;
  landAcres?: number;
  crops: string[];
  irrigation?: 'none' | 'partial' | 'full';
  soil?: string;
  syncToServer: boolean;
  serverId?: string;
}

export interface MandiRecord { market: string; district: string; commodity: string; variety: string; arrivalDate: string; minPrice: number; maxPrice: number; modalPrice: number }
export interface MandiResult {
  status: 'ok' | 'no_records' | 'unavailable';
  reason?: string;
  records: MandiRecord[];
  latestArrivalDate?: string;
  stale: boolean;
  fetchedAt?: string;
  source: { name: string; url: string };
  disclaimerHi: string;
}

export interface AgriAlert { id: string; severity: 'info' | 'watch' | 'warning'; titleHi: string; adviceHi: string; adviceBho: string }
export interface WeatherResult {
  status: 'ok' | 'unavailable';
  provider: { name: string; url: string; official: boolean };
  officialWarningsUrl: string;
  fetchedAt?: string;
  snapshot?: {
    current: { temperature: number; humidity: number; windKmh: number; precipitationMm: number; time: string };
    daily: Array<{ date: string; tMax: number; tMin: number; rainMm: number; rainProbability: number | null; windMaxKmh: number }>;
  };
  alerts: AgriAlert[];
}

export interface Scheme {
  id: string; level: 'central' | 'state'; nameHi: string; purposeHi: string; eligibilityHi: string[]; documentsHi: string[];
  benefitHi: string; applyHi: string[]; officialUrl: string; deadlineHi: string; statusHi: string; helplineHi: string;
  verification: { status: 'verified_official' | 'secondary_source' | 'status_uncertain'; checkedOn: string; note: string };
}

export interface KnowledgeEntry {
  id: string; category: string; crops: string[]; titleHi: string; bodyHi: string; bodyBho: string;
  source: { name: string; url: string }; lastChecked: string; reviewStatus: string;
}

export interface Meta {
  season: string;
  districts: Array<{ id: string; nameHi: string; nameEn: string; zone: string; zoneLabelHi: string }>;
  crops: Array<{ id: string; nameHi: string; nameBho: string }>;
}
