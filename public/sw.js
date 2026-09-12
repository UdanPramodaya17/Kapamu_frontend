const CACHE_NAME = 'Kapamu-v2';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Only intercept GET requests and bypass all API endpoints and localhost dev websockets
  if (
    e.request.method !== 'GET' ||
    e.request.url.includes('/api/') ||
    e.request.url.includes('chrome-extension') ||
    e.request.url.includes('/@vite/') ||
    e.request.url.includes('/@react-refresh')
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request).catch(async () => {
      const cached = await caches.match(e.request);
      if (cached) return cached;
      if (e.request.mode === 'navigate') {
        const indexMatch = await caches.match('/index.html');
        if (indexMatch) return indexMatch;
      }
      return new Response('Network error occurred', {
        status: 408,
        headers: { 'Content-Type': 'text/plain' },
      });
    })
  );
});
