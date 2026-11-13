/**
 * Storage interfaces + in-memory implementations.
 *
 * The MVP runs without a database so it can be demoed anywhere. Production uses the
 * PostgreSQL/PostGIS schema in ../../db/schema.sql behind these same interfaces.
 */
import { randomUUID } from 'node:crypto';
import type { Session } from './assistant.js';
import type { FarmerContext, Lang } from '../lib/types.js';

export interface SessionStore {
  get(id: string): Session | undefined;
  create(lang: Lang): Session;
  save(s: Session): void;
}

export class MemorySessionStore implements SessionStore {
  private map = new Map<string, Session>();
  constructor(private ttlMs = 2 * 60 * 60 * 1000) {}
  get(id: string) {
    const s = this.map.get(id);
    if (s && Date.now() - s.updatedAt > this.ttlMs) {
      this.map.delete(id);
      return undefined;
    }
    return s;
  }
  create(lang: Lang): Session {
    const s: Session = { id: randomUUID(), lang, slots: {}, history: [], updatedAt: Date.now() };
    this.map.set(s.id, s);
    return s;
  }
  save(s: Session) {
    this.map.set(s.id, s);
  }
}

export interface StoredProfile extends FarmerContext {
  id: string;
  name?: string;
  preferredLang: Lang;
  consentDataStorage: boolean;
  consentImageUse: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileStore {
  get(id: string): StoredProfile | undefined;
  upsert(p: Omit<StoredProfile, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): StoredProfile;
  delete(id: string): boolean;
}

export class MemoryProfileStore implements ProfileStore {
  private map = new Map<string, StoredProfile>();
  get(id: string) {
    return this.map.get(id);
  }
  upsert(p: Omit<StoredProfile, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): StoredProfile {
    const now = new Date().toISOString();
    const existing = p.id ? this.map.get(p.id) : undefined;
    const rec: StoredProfile = { ...existing, ...p, id: existing?.id ?? randomUUID(), createdAt: existing?.createdAt ?? now, updatedAt: now };
    this.map.set(rec.id, rec);
    return rec;
  }
  delete(id: string) {
    return this.map.delete(id);
  }
}
