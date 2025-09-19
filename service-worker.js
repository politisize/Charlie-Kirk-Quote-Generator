const CACHE_NAME = 'kirk-quotes-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
  'https://m.media-amazon.com/images/I/71R2Xg71XcL._SL1500_.jpg',
  'https://m.media-amazon.com/images/I/71A644TjEFL._SL1500_.jpg',
  'https://m.media-amazon.com/images/I/611bX1zGg3L._SL1500_.jpg',
  'https://m.media-amazon.com/images/I/71D0L2z1n6L._SL1500_.jpg',
  'https://m.media-amazon.com/images/I/71u9z2-bs4L._SL1500_.jpg',
  'https://m.media-amazon.com/images/I/81I-u36-zFL._SL1500_.jpg'
];

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

