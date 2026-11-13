/** fetch with timeout + limited retry (network errors / 5xx only). */
export async function fetchJson<T>(url: string, opts: { timeoutMs?: number; retries?: number } = {}): Promise<T> {
  const { timeoutMs = 8000, retries = 1 } = opts;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ctrl.signal, headers: { accept: 'application/json' } });
      if (res.status >= 500) throw new Error(`upstream ${res.status}`);
      if (!res.ok) throw Object.assign(new Error(`upstream ${res.status}`), { noRetry: true });
      return (await res.json()) as T;
    } catch (e) {
      lastErr = e;
      if ((e as { noRetry?: boolean }).noRetry) break;
      if (attempt < retries) await new Promise((r) => setTimeout(r, 400 * 2 ** attempt));
    } finally {
      clearTimeout(t);
    }
  }
  throw lastErr;
}
