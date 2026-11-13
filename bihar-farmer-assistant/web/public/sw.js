/* Offline support.
 * - App shell: cache-first.
 * - Knowledge, schemes, meta: network-first with cache fallback (educational content is
 *   useful offline and carries its own "last checked" dates).
 * - Mandi prices and weather are NEVER served from this cache: the app keeps its own
 *   copy and labels it with the data date so old prices are never shown as current.
 */
const VERSION = 'bfa-v1';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg'];
const OFFLINE_API = ['/api/knowledge', '/api/schemes', '/api/meta'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.startsWith('/api/')) {
    if (!OFFLINE_API.some((p) => url.pathname.startsWith(p))) return;
    e.respondWith(
      fetch(e.request)
        .then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); return res; })
        .catch(() => caches.match(e.request).then((r) => r || new Response(JSON.stringify({ error: 'offline' }), { status: 503, headers: { 'content-type': 'application/json' } }))),
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      if (res.ok && (url.pathname.startsWith('/assets/') || SHELL.includes(url.pathname))) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match('/index.html'))),
  );
});
