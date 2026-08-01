/* Service worker opcional de Índice.
   Colócalo junto a index.html. Guarda la app y los GIF ya vistos para que
   funcione sin conexión. Sube la versión para forzar una actualización. */
const V = "idx-v1";
const APP = V + "-app";
const MEDIA = V + "-media";
const MEDIA_HOSTS = ["cdn.jsdelivr.net", "raw.githubusercontent.com"];

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== APP && k !== MEDIA).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch (_) { return; }

  /* Imágenes y GIF: primero la caché, así no se vuelven a descargar. */
  if (MEDIA_HOSTS.includes(url.hostname)) {
    e.respondWith((async () => {
      const c = await caches.open(MEDIA);
      const hit = await c.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res && (res.ok || res.type === "opaque")) c.put(req, res.clone());
        return res;
      } catch (_) {
        return hit || Response.error();
      }
    })());
    return;
  }

  /* La propia app: primero la red (para que las actualizaciones lleguen),
     con la caché como respaldo cuando no hay conexión. */
  if (url.origin === self.location.origin) {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res && res.ok) (await caches.open(APP)).put(req, res.clone());
        return res;
      } catch (_) {
        const c = await caches.open(APP);
        return (await c.match(req)) || (await c.match("./")) ||
               (await c.match("index.html")) || Response.error();
      }
    })());
  }
});
