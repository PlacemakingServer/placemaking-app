const CACHE_NAME = 'pwa-cache-v1';

const urlsToCache = [
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        urlsToCache.map((url) => 
          cache.add(url).catch((err) => console.error(`❌ Falha ao adicionar ${url}:`, err))
        )
      );
    })
  );
});


self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || new Response(JSON.stringify([]), {
              headers: { 'Content-Type': 'application/json' },
            });
          });
        })
    );
    return; // 🔴 Impede que o código continue para o segundo event.respondWith
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('🗑 Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
