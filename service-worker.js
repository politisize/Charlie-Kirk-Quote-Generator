const CACHE_NAME = 'charlie-kirk-quote-library-v1.0.9';
const urlsToCache = [
    '/The-Charlie-Kirk-Quote-Library/',
    '/The-Charlie-Kirk-Quote-Library/index.html',
    '/The-Charlie-Kirk-Quote-Library/quotes.json',
    '/The-Charlie-Kirk-Quote-Library/manifest.json',
    '/The-Charlie-Kirk-Quote-Library/images/stop-in-the-name-of-god.jpg',
    '/The-Charlie-Kirk-Quote-Library/images/the-college-scam.jpg',
    '/The-Charlie-Kirk-Quote-Library/images/the-maga-doctrine.jpg',
    '/The-Charlie-Kirk-Quote-Library/images/right-wing-revolution.jpg',
    '/The-Charlie-Kirk-Quote-Library/images/time-for-a-turning-point.jpg',
    '/The-Charlie-Kirk-Quote-Library/images/campus-battlefield.jpg',
    '/The-Charlie-Kirk-Quote-Library/images/icon-192x192.png',
    '/The-Charlie-Kirk-Quote-Library/images/icon-512x512.png'
];

self.addEventListener('install', event => {
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

