// Service Worker for Lior Porat Show PWA
const CACHE_NAME = 'liorporat-show-v1.8.3';

// Core assets and songs to precache for offline show access
const PRECACHE_ASSETS = [
  './',
  'index.html',
  'manifest.json',
  '../styles.css?v=1.8.3',
  '../song.css?v=1.8.3',
  '../songs.css?v=1.8.3',
  '../songPage.js?v=1.8.3',
  '../script.js?v=1.8.3',
  '../Media/show/icon-192.png',
  '../Media/show/icon-512.png',
  '../Media/show/apple-touch-icon.png',
  'לוח וגיר.html',
  'בלוז לשבת.html',
  'בלוז לחילוני.html',
  'להיות ישראלי.html',
  'לאון השען.html',
  'בדד.html',
  'תל אביבי.html',
  'בשורה תחתונה (קלישאות).html',
  'כל כך לחוץ.html',
  'צל עץ תמר.html',
  'הים נחצה לשניים.html',
  'תקוע באדום.html',
  'בלוז לנפטר.html',
  'אסיר 1376.html',
  'ניפגש שוב בקרוב.html',
  'הרשימה.html'
];

// 1. Install Event: Cache all essential assets and songs
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        PRECACHE_ASSETS.map(async (assetUrl) => {
          try {
            const response = await fetch(assetUrl, { cache: 'reload' });
            if (response.ok) {
              await cache.put(assetUrl, response);
            }
          } catch (err) {
            console.warn('[SW] Precache skipped for:', assetUrl, err);
          }
        })
      );
    })
  );
});

// 2. Activate Event: Clean up old caches when version updates
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key.startsWith('liorporat-show-') && key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Network-First strategy with resilient offline Cache fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Online: update cache in background with fresh copy
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Offline: Look in cache
        const directMatch = await caches.match(request);
        if (directMatch) return directMatch;

        // Strip query string (e.g. ?v=...) to find matching base asset
        const urlObj = new URL(request.url);
        const withoutQuery = urlObj.origin + urlObj.pathname;
        const matchWithoutQuery = await caches.match(withoutQuery);
        if (matchWithoutQuery) return matchWithoutQuery;

        // Match Hebrew encoded vs decoded URL paths
        const decodedPath = decodeURIComponent(urlObj.pathname);
        const openCache = await caches.open(CACHE_NAME);
        const keys = await openCache.keys();
        for (const k of keys) {
          if (decodeURIComponent(new URL(k.url).pathname) === decodedPath) {
            return openCache.match(k);
          }
        }

        // Navigation fallback for show
        if (request.mode === 'navigate') {
          return (await caches.match('./')) || (await caches.match('index.html'));
        }
      })
  );
});
