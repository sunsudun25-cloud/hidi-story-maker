// Service Worker for PWA
const CACHE_NAME = 'story-maker-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - network first, then cache fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // ⭐ API 요청은 캐시하지 않음 (특히 POST 요청)
  const isApiRequest = url.pathname.startsWith('/api/');
  const isPostRequest = event.request.method === 'POST';
  
  // API 요청이나 POST 요청은 캐시 없이 바로 fetch
  if (isApiRequest || isPostRequest) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // 일반 GET 요청은 캐시 전략 사용
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone();
        
        // Cache the fetched response for future use (GET 요청만)
        if (event.request.method === 'GET') {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // If network fails, try to get from cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          
          // Return a custom offline page if available
          return caches.match('/index.html');
        });
      })
  );
});
