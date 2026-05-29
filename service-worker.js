// service-worker.js — offline shell for Ular 3D
// Note: three.js is loaded from cdnjs and cached at runtime by the fetch
// handler below, so the game still runs offline after the first online visit.
const CACHE_VERSION = 'v1';
const CACHE_NAME = 'ular-3d-' + CACHE_VERSION;
const SHELL = ['./','./index.html','./offline.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') { e.respondWith(fetch(req).catch(() => caches.match(req).then((r) => r || caches.match('./offline.html')))); return; }
  // Cache-first for same-origin shell AND cross-origin assets (three.js, fonts).
  e.respondWith(caches.match(req).then((cached) => cached || fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(req, copy)); return res; }).catch(() => cached)));
});
