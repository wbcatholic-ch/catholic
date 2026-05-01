/* =====================================================
   한국 천주교 성지·성당 앱 - Service Worker
   Cache-First 전략 + Network fallback
   WebAPK 생성 기준 완전 충족
   ===================================================== */

const CACHE_NAME = 'catholic-app-v1';
const CACHE_URLS = [
  './index.html',
  './manifest.json',
  './parishes.js',
  './diocese.html',
  './qa-firebase.html',
  './icon-192x192.png',
  './icon-512x512.png',
  './icon-512x512-maskable.png'
];

/* ── install: 핵심 파일 사전 캐시 ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_URLS);
    }).then(() => {
      return self.skipWaiting(); // 즉시 활성화
    })
  );
});

/* ── activate: 이전 캐시 정리 ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => {
      return self.clients.claim(); // 즉시 모든 탭 제어
    })
  );
});

/* ── fetch: Cache-First, 없으면 Network ── */
self.addEventListener('fetch', event => {
  // POST, chrome-extension 등 처리 불가 요청 제외
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  // 외부 CDN (Kakao, Firebase, Font 등)은 Network-First
  const url = new URL(event.request.url);
  const isExternal = !url.origin.includes('bong0219-eng.github.io')
                  && url.origin !== self.location.origin;

  if (isExternal) {
    // 외부 리소스: Network → Cache fallback
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 내부 파일: Cache-First → Network fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
