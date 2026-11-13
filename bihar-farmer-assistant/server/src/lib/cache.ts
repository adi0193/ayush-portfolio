/**
 * Tiny TTL cache. In production swap for Redis behind the same interface.
 * Entries keep their original fetch time so callers can show data age honestly.
 */
export interface Cached<T> { value: T; fetchedAt: number }

export class TtlCache<T> {
  private store = new Map<string, Cached<T>>();
  constructor(private ttlMs: number, private maxEntries = 500) {}

  get(key: string): Cached<T> | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (Date.now() - hit.fetchedAt > this.ttlMs) return undefined;
    return hit;
  }

  /** Returns an entry even if expired — for "last known data" fallbacks, clearly labelled stale. */
  getStale(key: string): Cached<T> | undefined {
    return this.store.get(key);
  }

  set(key: string, value: T): Cached<T> {
    if (this.store.size >= this.maxEntries) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
    const entry = { value, fetchedAt: Date.now() };
    this.store.set(key, entry);
    return entry;
  }
}
