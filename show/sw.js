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
  'songs/אסיר 1376.html',
  'songs/בדד.html',
  'songs/בלוז לחילוני.html',
  'songs/בלוז לנפטר.html',
  'songs/בלוז לשבת.html',
  'songs/בלוז לשירלי.html',
  'songs/גרשון רוזנצוויג.html',
  'songs/דמייני שאת בסרט.html',
  'songs/הדברים הפשוטים שבחיים.html',
  'songs/היא לא מוצאת.html',
  'songs/הים נחצה לשניים.html',
  'songs/הרשימה.html',
  'songs/כל כך לחוץ.html',
  'songs/לאון השען.html',
  'songs/להיות ישראלי.html',
  'songs/לוח וגיר.html',
  'songs/מדריך געגוע.html',
  'songs/מה עוד צריך לקרות.html',
  'songs/ניפגש שוב בקרוב.html',
  'songs/נמאס לי.html',
  'songs/צוף לעמק האסור.html',
  'songs/צל עץ תמר.html',
  'songs/קונספירציה.html',
  'songs/בשורה תחתונה (קלישאות).html',
  'songs/שלושים שנה וחלום.html',
  'songs/שתיים כוסות של תה אדום.html',
  'songs/תופסים ראש קטן.html',
  'songs/תל אביבי.html',
  'songs/תקוע באדום.html'
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
