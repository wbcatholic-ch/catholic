/* =====================================================
   한국 천주교 성지·성당 앱 - Service Worker v2
   ※ 핵심 수정: 캐싱 실패해도 SW 설치 반드시 성공
   WebAPK 생성 기준 완전 충족
   ===================================================== */

const CACHE_NAME = 'catholic-app-v2';

// 반드시 캐시할 핵심 파일 (작은 것만)
const CORE_URLS = [
  './index.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
];

// 추가로 캐시 시도 (실패해도 무관)
const OPTIONAL_URLS = [
  './parishes.js',
  './diocese.html',
  './qa-firebase.html',
  './icon-512x512-maskable.png'
];

/* ── install: 핵심 파일만 필수 캐시, 나머지는 실패해도 OK ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // 핵심 파일: 하나씩 개별 캐시 (하나 실패해도 계속)
      for (const url of CORE_URLS) {
        try { await cache.add(url); }
        catch (e) { console.warn('[SW] 캐시 실패(무시):', url); }
      }
      // 선택 파일: 실패 완전 무시
      for (const url of OPTIONAL_URLS) {
        try { await cache.add(url); } catch (e) {}
      }
      return self.skipWaiting(); // 즉시 활성화 (필수)
    })
  );
});

/* ── activate: 이전 캐시 정리 후 즉시 제어 ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── fetch: 내부=Cache-First, 외부CDN=Network-First ── */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  let url;
  try { url = new URL(event.request.url); } catch { return; }

  // Kakao / Firebase / Google Fonts 등 외부 → Network 우선 (캐시 없이 통과)
  const isExternal =
    url.hostname !== self.location.hostname &&
    !url.hostname.endsWith('github.io');

  if (isExternal) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // 내부 파일 → Cache-First
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
