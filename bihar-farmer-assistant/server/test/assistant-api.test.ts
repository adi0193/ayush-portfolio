import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import type { LlmProvider } from '../src/providers/llm.js';
import type { WeatherProvider } from '../src/services/weather.js';

const weatherProvider: WeatherProvider = {
  name: 'fake',
  fetch: async () => ({
    current: { temperature: 29, humidity: 70, windKmh: 6, precipitationMm: 0, time: 'now' },
    daily: Array.from({ length: 5 }, (_, i) => ({ date: `d${i}`, tMax: 31, tMin: 20, rainMm: i < 2 ? 45 : 0, rainProbability: 80, windMaxKmh: 12 })),
  }),
};

const app = () => createApp({ llm: null, weatherProvider });

async function say(a: ReturnType<typeof createApp>, text: string, sessionId?: string, extra: object = {}) {
  const r = await request(a).post('/api/assistant/message').send({ text, lang: 'bho', sessionId, ...extra });
  expect(r.status).toBe(200);
  return r.body as { sessionId: string; reply: { text: string; kind: string; confidence: string; suggestExpert: boolean; sources: unknown[]; intent: string } };
}

describe('spec conversation: yellow paddy leaves', () => {
  it('asks follow-ups first, then explains possible causes without confirming a diagnosis', async () => {
    const a = app();
    const t1 = await say(a, 'हमरा खेत में धान के फसल में पत्ता पीयर हो रहल बा।');
    expect(t1.reply.kind).toBe('clarifying_question');
    expect(t1.reply.text).toContain('केतना दिन');
    expect(t1.reply.text).toContain('पानी');

    const t2 = await say(a, 'लगभग 30 दिन के बा आ खेत में पानी बा।', t1.sessionId);
    expect(t2.reply.text).toContain('समझ गइनी');
    expect(t2.reply.text).toMatch(/कई गो कारण|कई कारण/);
    expect(t2.reply.text).toContain('फोटो');
    expect(t2.reply.text).toContain('पक्का');
    expect(t2.reply.confidence).toBe('low');
    expect(t2.reply.suggestExpert).toBe(true);
    expect(t2.reply.sources.length).toBeGreaterThan(0);
  });
});

describe('spec conversation: scheme eligibility', () => {
  it('asks land size and registration, then lists schemes with caveats', async () => {
    const a = app();
    const t1 = await say(a, 'हम छोट किसान हईं, खाद आ बीज खातिर सरकार से मदद मिल सकेला?');
    expect(t1.reply.text).toContain('केतना जमीन');
    expect(t1.reply.text).toContain('पंजीकरण');
    const t2 = await say(a, 'दो बीघा बा, पंजीकरण ना भइल बा', t1.sessionId);
    expect(t2.reply.text).toContain('DBT');
    expect(t2.reply.text).toContain('बीज अनुदान');
    expect(t2.reply.text).toMatch(/वादा ना/);
  });
});

describe('mandi via assistant', () => {
  it('says clearly when live prices are unavailable and invents no number', async () => {
    const a = createApp({ llm: null, weatherProvider, mandi: async () => ({ status: 'unavailable', records: [], stale: false, fromCache: false, crop: 'maize', district: 'muzaffarpur', source: { name: 'AGMARKNET', url: 'https://data.gov.in' }, unit: 'INR per quintal', disclaimerHi: '' }) });
    const r = await say(a, 'आज मुजफ्फरपुर में मक्का का भाव का बा?');
    expect(r.reply.kind).toBe('no_data');
    expect(r.reply.text).toMatch(/ना मिल पावत/);
    expect(r.reply.text).not.toMatch(/₹\s*\d/);
  });
  it('asks for district when unknown', async () => {
    const r = await say(app(), 'मक्का के भाव का बा?');
    expect(r.reply.kind).toBe('clarifying_question');
  });
});

describe('weather via assistant', () => {
  it('uses profile district and labels district-level model forecast', async () => {
    const r = await say(app(), 'मौसम कइसन रही?', undefined, { context: { district: 'gaya' } });
    expect(r.reply.text).toContain('गया');
    expect(r.reply.text).toContain('जिला स्तर');
    expect(r.reply.text).toMatch(/तेज बरखा/);
    expect(r.reply.text).toMatch(/IMD/);
  });
});

describe('safety via assistant', () => {
  it('warns on OTP mentions', async () => {
    const r = await say(app(), 'योजना वाला आदमी फोन पर OTP माँगत बा');
    expect(r.reply.kind).toBe('safety');
    expect(r.reply.text).toContain('1930');
  });
  it('strips doses even if an LLM produces them', async () => {
    const badLlm: LlmProvider = { name: 'bad', answer: async () => 'यूरिया 50 किलो प्रति एकड़ डालीं।' };
    const r = await request(createApp({ llm: badLlm, weatherProvider })).post('/api/assistant/message').send({ text: 'गेहूँ के बोआई कब करीं', lang: 'bho' });
    expect(r.body.reply.text).not.toMatch(/50 किलो/);
    expect(r.body.reply.kind).toBe('ai_explanation');
  });
  it('admits when it does not know', async () => {
    const r = await say(app(), 'ड्रैगन फ्रूट के खेती कइसे करीं?');
    expect(['no_data', 'clarifying_question']).toContain(r.reply.kind);
  });
});

describe('api validation & privacy', () => {
  it('rejects unknown fields like aadhaar in profile', async () => {
    const r = await request(app()).post('/api/profile').send({ preferredLang: 'bho', consentDataStorage: true, aadhaar: '123412341234' });
    expect(r.status).toBe(400);
  });
  it('requires consent to store a profile', async () => {
    const r = await request(app()).post('/api/profile').send({ preferredLang: 'hi', consentDataStorage: false });
    expect(r.status).toBe(400);
  });
  it('stores and deletes a consented profile', async () => {
    const a = app();
    const c = await request(a).post('/api/profile').send({ preferredLang: 'hi', consentDataStorage: true, district: 'nalanda', crops: ['potato'] });
    expect(c.status).toBe(201);
    expect((await request(a).delete(`/api/profile/${c.body.id}`)).status).toBe(204);
  });
  it('rejects oversized and empty messages', async () => {
    expect((await request(app()).post('/api/assistant/message').send({ text: '' })).status).toBe(400);
    expect((await request(app()).post('/api/assistant/message').send({ text: 'x'.repeat(501) })).status).toBe(400);
  });
  it('admin endpoints require token', async () => {
    expect((await request(app()).get('/api/admin/content')).status).toBe(401);
  });
  it('meta lists 38 districts', async () => {
    const r = await request(app()).get('/api/meta');
    expect(r.body.districts).toHaveLength(38);
  });
});
