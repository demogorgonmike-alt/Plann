// Service worker: guarda la app para que funcione sin conexión.
// El plan (data/) se pide siempre a la red primero y, si no hay conexión, se usa la última copia.
const CACHE = "mi-plan-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "plan.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // la API de GitHub va directa
  const isData = /\/(plan|progress)\.json$/.test(url.pathname);
  const isPage = e.request.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/");
  if (isData || isPage) {
    // red primero: así los cambios del plan y de la app llegan en cuanto hay conexión
    e.respondWith(fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(isData ? url.pathname : e.request, copy));
      return r;
    }).catch(() => caches.match(isData ? url.pathname : e.request).then(r => r || caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
