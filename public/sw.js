self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through fetch handler satisfies the PWA installability requirements
  // without caching assets, preventing any stale content issues.
  event.respondWith(fetch(event.request));
});
