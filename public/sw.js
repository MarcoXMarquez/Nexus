const SHELL_CACHE = "nexus-shell-v10";
const MEDIA_CACHE = "nexus-media-v10";
const STATIC_CACHE = "nexus-static-v10";
const SHELL = ["/offline.html", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const current = new Set([SHELL_CACHE, MEDIA_CACHE, STATIC_CACHE]);
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => !current.has(key)).map((key) => caches.delete(key)))));
  self.clients.claim();
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) (await caches.open(STATIC_CACHE)).put(request, response.clone());
    return response;
  } catch {
    return (await caches.match(request)) || (await caches.match("/offline.html"));
  }
}

async function cacheFirstMedia(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(MEDIA_CACHE)).put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const update = fetch(request).then(async (response) => {
    if (response.ok) (await caches.open(STATIC_CACHE)).put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || update;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === "navigate") { event.respondWith(networkFirst(request)); return; }
  if (/\/(posters|backdrops|title-logos|artwork)\//.test(url.pathname)) { event.respondWith(cacheFirstMedia(request)); return; }
  if (url.pathname.startsWith("/_next/static/") || /\.(css|js|woff2?)$/.test(url.pathname)) event.respondWith(staleWhileRevalidate(request));
});
