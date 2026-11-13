/** API client with timeout + one retry, and explicit offline errors. */
export class OfflineError extends Error {}

async function req<T>(path: string, init?: RequestInit, timeoutMs = 15000): Promise<T> {
  if (!navigator.onLine) throw new OfflineError('offline');
  let last: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(path, { ...init, signal: ctrl.signal, headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) } });
      if (res.status >= 500 && attempt === 0) throw new Error(String(res.status));
      if (!res.ok) throw Object.assign(new Error(`http ${res.status}`), { status: res.status, final: true });
      return (await res.json()) as T;
    } catch (e) {
      last = e;
      if ((e as { final?: boolean }).final) break;
      await new Promise((r) => setTimeout(r, 700));
    } finally {
      clearTimeout(t);
    }
  }
  throw last;
}

export const api = {
  get: <T,>(p: string) => req<T>(p),
  post: <T,>(p: string, body: unknown) => req<T>(p, { method: 'POST', body: JSON.stringify(body) }),
  del: (p: string) => fetch(p, { method: 'DELETE' }),
};

/** Small localStorage helpers that never throw (private mode, full storage). */
export const local = {
  get<T>(k: string, fallback: T): T {
    try {
      const v = localStorage.getItem(k);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
      /* ignore */
    }
  },
  remove(k: string) {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  },
};
