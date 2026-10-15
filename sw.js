const CACHE = 'cassa-piadine-v3';
const ASSETS = ['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];

self.addEventListener('install', event => {
  // Do not call skipWaiting: never interrupt an order with an unexpected reload.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('cassa-piadine-') && k !== CACHE).map(k => caches.delete(k)))));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request);
        if (response.ok) {
          const clone=response.clone();
          event.waitUntil(caches.open(CACHE).then(cache=>cache.put('./index.html',clone)));
        }
        return response;
      } catch {
        return await caches.match('./index.html') || await caches.match('./') || new Response('Non disponibile offline',{status:503});
      }
    })());
    return;
  }
  event.respondWith(caches.match(event.request).then(r => r || fetch(event.request)));
});
