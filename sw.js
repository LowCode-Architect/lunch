/* simple offline-first cache */
const CACHE = 'lunch-v1';
const ASSETS = [
  './',
  './index.html',
  './icon.png',
  './og_image.png',
  './manifest.json',
  './sw.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(res => res ||
      fetch(e.request).then(fetchRes => {
        const copy = fetchRes.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return fetchRes;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
