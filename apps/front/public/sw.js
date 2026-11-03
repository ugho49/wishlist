// Installability requires a fetch handler. This one only forwards navigations
// to the network: authenticated API calls and hashed assets are never cached.
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  if (event.request.mode !== 'navigate') {
    return;
  }

  event.respondWith(fetch(event.request));
});
