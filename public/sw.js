/*
 * BSDC custom offline service worker.
 * Vite PWA/Workbox handles hashed assets. This worker focuses on an explicit
 * offline fallback page for navigation requests and safe cache upgrades.
 */
const BSDC_CACHE_VERSION = 'bsdc-offline-v1';
const BSDC_OFFLINE_URL = '/offline.html';
const BSDC_CORE_ASSETS = ['/', BSDC_OFFLINE_URL, '/favicon.svg', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(BSDC_CACHE_VERSION).then((cache) => cache.addAll(BSDC_CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key.startsWith('bsdc-offline-') && key !== BSDC_CACHE_VERSION).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(BSDC_OFFLINE_URL)));
    return;
  }
  if (request.destination === 'image' || request.destination === 'style' || request.destination === 'script') {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(BSDC_CACHE_VERSION).then((cache) => cache.put(request, copy));
        return response;
      }))
    );
  }
});
