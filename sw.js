// ALL IN ONE Service Worker
const CACHE_NAME = 'all-in-one-cache-v3';

// Static assets to pre-cache immediately on install
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/main.css',
  './css/dashboard.css',
  './css/tools-shared.css',
  './js/main.js',
  './js/dashboard.js',
  './js/components.js',
  './data/tools-db.json',
  './assets/lib/qrious.min.js'
];

// Install Event - Pre-cache core shell
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Pre-caching core shell assets...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Clearing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Handle offline requests
self.addEventListener('fetch', (e) => {
  const requestUrl = new URL(e.request.url);

  // Skip non-GET requests
  if (e.request.method !== 'GET') return;

  // Skip non-HTTP/HTTPS protocols (like chrome-extension://)
  if (!requestUrl.protocol.startsWith('http')) return;

  // Caching Strategy:
  // 1. Cache-first for local static assets (CSS, JS, Fonts, Images, Libs)
  const isStaticAsset = 
    requestUrl.origin === self.location.origin && 
    (
      requestUrl.pathname.includes('/css/') || 
      requestUrl.pathname.includes('/js/') || 
      requestUrl.pathname.includes('/assets/') ||
      requestUrl.pathname.includes('/data/')
    );

  if (isStaticAsset) {
    e.respondWith(
      caches.match(e.request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        
        return fetch(e.request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200) return networkResponse;
          
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, responseToCache);
          });
          return networkResponse;
        });
      })
    );
  } else {
    // 2. Network-First with Cache-Fallback for HTML pages (Homepage, Tools, Info Pages)
    e.respondWith(
      fetch(e.request)
        .then(networkResponse => {
          // If valid response, cache a copy and return
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(e.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If network fails, attempt cache match
          return caches.match(e.request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            
            // Fallback to offline index if page is not in cache
            return caches.match('./index.html');
          });
        })
    );
  }
});
