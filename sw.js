// Service Worker for ミプリンの冒険 PWA
const CACHE = 'mipurin-v2';
const CDN_PRECACHE = [
  'https://cdnjs.cloudflare.com/ajax/libs/rot.js/2.2.0/rot.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js',
  'https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js'
];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CDN_PRECACHE))); self.skipWaiting(); });
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request).then(r => r || Response.error()))
  );
});
