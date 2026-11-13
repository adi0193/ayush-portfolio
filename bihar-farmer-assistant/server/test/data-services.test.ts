import { beforeEach, describe, expect, it } from 'vitest';
import { __resetMandiCache, getMandiPrices, parseRecords, toIsoDate } from '../src/services/mandi.js';
import { deriveAlerts, type WeatherSnapshot } from '../src/services/weather.js';

const sample = {
  records: [
    { state: 'Bihar', district: 'Muzaffarpur', market: 'Muzaffarpur', commodity: 'Maize', variety: 'Local', arrival_date: '12/11/2026', min_price: '2050', max_price: '2200', modal_price: '2120' },
    { state: 'Bihar', district: 'Samastipur', market: 'Samastipur', commodity: 'Maize', variety: 'Local', arrival_date: '11/11/2026', min_price: '2000', max_price: '2150', modal_price: '2080' },
    { state: 'Bihar', district: 'Patna', market: 'Patna', commodity: 'Potato', variety: 'Red', arrival_date: '12/11/2026', min_price: '900', max_price: '1100', modal_price: '1000' },
    { state: 'Bihar', district: 'Gaya', market: 'Gaya', commodity: 'Maize', variety: 'Local', arrival_date: '12/11/2026', min_price: '0', max_price: '0', modal_price: '0' },
  ],
};

describe('mandi', () => {
  beforeEach(() => __resetMandiCache());

  it('parses OGD records and dates', () => {
    expect(toIsoDate('12/11/2026')).toBe('2026-11-12');
    const recs = parseRecords(sample);
    expect(recs).toHaveLength(3); // zero-price record dropped
  });

  it('never fabricates: no API key → unavailable with no records', async () => {
    const r = await getMandiPrices({ cropId: 'maize', districtId: 'muzaffarpur' }, { apiKey: '' });
    expect(r.status).toBe('unavailable');
    expect(r.records).toEqual([]);
  });

  it('upstream failure with no cache → unavailable', async () => {
    const r = await getMandiPrices({ cropId: 'maize', districtId: 'muzaffarpur' }, { apiKey: 'k', fetcher: async () => { throw new Error('down'); } });
    expect(r.status).toBe('unavailable');
  });

  it('returns nearest-district records first, with arrival date and source', async () => {
    const r = await getMandiPrices(
      { cropId: 'maize', districtId: 'muzaffarpur' },
      { apiKey: 'k', fetcher: (async () => sample) as never, now: new Date('2026-11-13T10:00:00+05:30') },
    );
    expect(r.status).toBe('ok');
    expect(r.records[0]!.market).toBe('Muzaffarpur');
    expect(r.records.every((x) => x.commodity === 'Maize')).toBe(true);
    expect(r.latestArrivalDate).toBe('2026-11-12');
    expect(r.stale).toBe(false);
    expect(r.source.url).toMatch(/data\.gov\.in/);
    expect(r.disclaimerHi).toMatch(/थोक/);
  });

  it('flags old data as stale', async () => {
    const r = await getMandiPrices({ cropId: 'maize', districtId: 'muzaffarpur' }, { apiKey: 'k', fetcher: (async () => sample) as never, now: new Date('2026-11-25') });
    expect(r.stale).toBe(true);
  });
});

const snap = (o: Partial<WeatherSnapshot['daily'][number]>, humidity = 60): WeatherSnapshot => ({
  current: { temperature: 30, humidity, windKmh: 5, precipitationMm: 0, time: '2026-11-13T10:00' },
  daily: Array.from({ length: 5 }, (_, i) => ({ date: `2026-11-1${3 + i}`, tMax: 30, tMin: 18, rainMm: 0, rainProbability: 10, windMaxKmh: 10, ...o })),
});

describe('weather alerts', () => {
  it('heavy rain in 48h triggers drainage advice', () => {
    const a = deriveAlerts(snap({ rainMm: 70 }));
    expect(a.find((x) => x.id === 'heavy_rain')?.adviceHi).toMatch(/पानी निकालने/);
  });
  it('very heavy rain is a warning', () => {
    expect(deriveAlerts(snap({ rainMm: 120 }))[0]).toMatchObject({ id: 'very_heavy_rain', severity: 'warning' });
  });
  it('heatwave thresholds', () => {
    expect(deriveAlerts(snap({ tMax: 41 })).some((x) => x.id === 'heatwave' && x.severity === 'watch')).toBe(true);
    expect(deriveAlerts(snap({ tMax: 46 })).some((x) => x.id === 'heatwave' && x.severity === 'warning')).toBe(true);
  });
  it('cool humid rainy spell → blight risk', () => {
    expect(deriveAlerts(snap({ tMax: 20, tMin: 10, rainMm: 2 }, 90)).some((x) => x.id === 'blight_risk')).toBe(true);
  });
  it('calm dry weather → spray window info only', () => {
    const a = deriveAlerts(snap({ tMax: 26 }));
    expect(a.map((x) => x.id)).toEqual(['spray_window']);
  });
});
