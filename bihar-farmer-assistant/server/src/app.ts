import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { timingSafeEqual } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { config } from './lib/config.js';
import { DISTRICTS, findDistrict, ZONE_LABEL_HI } from './data/districts.js';
import { CROPS, currentSeason } from './data/crops.js';
import { KNOWLEDGE } from './data/knowledge.js';
import { SCHEMES, findScheme } from './data/schemes.js';
import { respond, type AssistantDeps } from './services/assistant.js';
import { getMandiPrices } from './services/mandi.js';
import { getWeather } from './services/weather.js';
import { MemoryProfileStore, MemorySessionStore, type ProfileStore, type SessionStore } from './services/store.js';
import { createLlmProvider } from './providers/llm.js';
import { getSttProvider } from './providers/voice.js';

export interface AppDeps extends AssistantDeps {
  sessions?: SessionStore;
  profiles?: ProfileStore;
}

const LangZ = z.enum(['hi', 'bho']);
const DistrictZ = z.string().max(40).refine((v) => !!findDistrict(v), 'unknown district');
const CropZ = z.string().max(30).refine((v) => CROPS.some((c) => c.id === v), 'unknown crop');

const ContextZ = z
  .object({
    district: DistrictZ.optional(),
    block: z.string().max(60).optional(),
    village: z.string().max(60).optional(),
    landAcres: z.number().min(0).max(1000).optional(),
    crops: z.array(CropZ).max(10).optional(),
    irrigation: z.enum(['none', 'partial', 'full']).optional(),
    soil: z.string().max(60).optional(),
  })
  .strict();

const MessageZ = z.object({
  sessionId: z.string().uuid().optional(),
  text: z.string().trim().min(1).max(500),
  lang: LangZ.default('bho'),
  context: ContextZ.optional(),
});

const ProfileZ = ContextZ.extend({
  id: z.string().uuid().optional(),
  name: z.string().max(80).optional(),
  preferredLang: LangZ,
  consentDataStorage: z.literal(true, { message: 'consent required to store a profile on the server' }),
  consentImageUse: z.boolean().default(false),
}).strict();

const ReviewZ = z.object({ status: z.enum(['expert_reviewed', 'pending_expert_review', 'outdated']), reviewer: z.string().min(2).max(80), note: z.string().max(500).optional() });

function adminOnly(req: Request, res: Response, next: NextFunction) {
  const token = req.header('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  const expected = config.adminToken;
  const ok = expected.length >= 12 && token.length === expected.length && timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  if (!ok) return res.status(401).json({ error: 'unauthorized' });
  next();
}

export function createApp(deps: AppDeps = {}) {
  const app = express();
  const sessions = deps.sessions ?? new MemorySessionStore();
  const profiles = deps.profiles ?? new MemoryProfileStore();
  const assistantDeps: AssistantDeps = { llm: deps.llm === undefined ? createLlmProvider() : deps.llm, mandi: deps.mandi, weatherProvider: deps.weatherProvider };
  const reviews: Array<{ entryId: string; status: string; reviewer: string; note?: string; at: string }> = [];

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin.split(',') }));
  app.use(express.json({ limit: '32kb' }));
  app.use('/api/', rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      integrations: {
        mandi: config.dataGovApiKey ? 'configured' : 'not_configured',
        weather: 'open-meteo',
        llm: assistantDeps.llm ? assistantDeps.llm.name : 'template_only',
        stt: getSttProvider()?.name ?? 'browser_only',
      },
    });
  });

  app.get('/api/meta', (_req, res) => {
    res.json({
      season: currentSeason(),
      districts: DISTRICTS.map((d) => ({ id: d.id, nameHi: d.nameHi, nameEn: d.nameEn, zone: d.zone, zoneLabelHi: ZONE_LABEL_HI[d.zone] })),
      crops: CROPS.map((c) => ({ id: c.id, nameHi: c.nameHi, nameBho: c.nameBho })),
    });
  });

  app.post('/api/assistant/message', async (req, res, next) => {
    try {
      const body = MessageZ.parse(req.body);
      let s = body.sessionId ? sessions.get(body.sessionId) : undefined;
      if (!s) s = sessions.create(body.lang);
      s.lang = body.lang;
      const out = await respond(body.text, s, body.context ?? {}, assistantDeps);
      sessions.save(s);
      res.json({ sessionId: s.id, reply: out });
    } catch (e) {
      next(e);
    }
  });

  app.get('/api/mandi', async (req, res, next) => {
    try {
      const q = z.object({ crop: CropZ, district: DistrictZ.optional() }).parse(req.query);
      res.json(await getMandiPrices({ cropId: q.crop, districtId: findDistrict(q.district)?.id }, {}));
    } catch (e) {
      next(e);
    }
  });

  app.get('/api/weather', async (req, res, next) => {
    try {
      const q = z.object({ district: DistrictZ }).parse(req.query);
      res.json(await getWeather(findDistrict(q.district)!, assistantDeps.weatherProvider));
    } catch (e) {
      next(e);
    }
  });

  app.get('/api/schemes', (_req, res) => res.json({ schemes: SCHEMES }));
  app.get('/api/schemes/:id', (req, res) => {
    const s = findScheme(req.params.id);
    return s ? res.json(s) : res.status(404).json({ error: 'not_found' });
  });

  app.get('/api/knowledge', (req, res) => {
    const crop = typeof req.query.crop === 'string' ? req.query.crop : undefined;
    const items = KNOWLEDGE.filter((k) => k.reviewStatus !== 'outdated' && (!crop || k.crops.length === 0 || k.crops.includes(crop)));
    res.json({ items });
  });

  // Profiles are stored server-side only with explicit consent; the app works fully with
  // a device-only profile. No Aadhaar or ID numbers are accepted (schema is strict).
  app.post('/api/profile', (req, res, next) => {
    try {
      const p = ProfileZ.parse(req.body);
      res.status(201).json(profiles.upsert(p));
    } catch (e) {
      next(e);
    }
  });
  app.get('/api/profile/:id', (req, res) => {
    const p = profiles.get(req.params.id);
    return p ? res.json(p) : res.status(404).json({ error: 'not_found' });
  });
  app.delete('/api/profile/:id', (req, res) => res.status(profiles.delete(req.params.id) ? 204 : 404).end());

  app.post('/api/voice/stt', (_req, res) => {
    // Browser STT is used in the MVP. Server STT is enabled after the Bhojpuri benchmark.
    res.status(501).json({ error: 'server_stt_not_configured', fallback: 'browser_web_speech_or_text' });
  });

  // Content review workflow (expert sign-off). In-memory audit log in the MVP.
  app.get('/api/admin/content', adminOnly, (_req, res) => {
    res.json({
      knowledge: KNOWLEDGE.map((k) => ({ id: k.id, title: k.titleHi, status: k.reviewStatus, lastChecked: k.lastChecked, source: k.source.name })),
      schemes: SCHEMES.map((x) => ({ id: x.id, name: x.nameHi, verification: x.verification })),
      reviews,
    });
  });
  app.post('/api/admin/content/:id/review', adminOnly, (req, res, next) => {
    try {
      const body = ReviewZ.parse(req.body);
      const entry = KNOWLEDGE.find((k) => k.id === req.params.id);
      if (!entry) return res.status(404).json({ error: 'not_found' });
      entry.reviewStatus = body.status;
      entry.lastChecked = new Date().toISOString().slice(0, 10);
      const rec = { entryId: entry.id, ...body, at: new Date().toISOString() };
      reviews.push(rec);
      res.json(rec);
    } catch (e) {
      next(e);
    }
  });

  // Optional: serve the built PWA from the same process (set WEB_DIST=/path/to/web/dist).
  const webDist = process.env.WEB_DIST;
  if (webDist && existsSync(join(webDist, 'index.html'))) {
    app.use('/assets', express.static(join(webDist, 'assets'), { immutable: true, maxAge: '365d' }));
    app.use(express.static(webDist, { index: false, setHeaders: (res, path) => { if (path.endsWith('sw.js')) res.setHeader('Cache-Control', 'no-cache'); } }));
    app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(join(webDist, 'index.html')));
  }

  app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found' }));

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    void _next;
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'invalid_input', issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) });
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  });

  return app;
}
