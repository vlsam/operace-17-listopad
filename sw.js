// Service worker. Verze se bere z version.js, seznam souborů z precache.js (obojí generuje nástroj verze.ps1).
// Změna kteréhokoli importovaného skriptu = prohlížeč najde nový worker a aplikaci aktualizuje sám.
importScripts("version.js", "precache.js");

const CACHE = "app-" + APP_VERSION;
const PRECACHE = APP_FILES;
const SIT_TIMEOUT_MS = 4000; // pomalá síť: po této době se vezme cache, síť doběhne na pozadí a cache aktualizuje

self.addEventListener("install", (event) => {
  // cache: "reload" obejde HTTP cache, aby se do nové cache nedostaly staré soubory.
  // Selhání jednoho souboru nesmí zablokovat instalaci workeru (bez něj by se aplikace neaktualizovala),
  // proto allSettled místo addAll.
  event.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.allSettled(PRECACHE.map((u) => c.add(new Request(u, { cache: "reload" }))))
    )
  );
  self.skipWaiting(); // nový worker se neváže na zavření staré verze
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Ze sítě (vždy s ověřením u serveru), při výpadku nebo pomalé síti z cache.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;

  const zCache = () =>
    caches.match(req).then((hit) => hit || (req.mode === "navigate" ? caches.match("index.html") : undefined));

  const sit = fetch(req, { cache: "no-cache" }).then((res) => {
    if (res.status === 200) { // 206 a další odpovědi se do cache ukládat nesmí
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
    }
    return res;
  });
  const sitNeboCache = sit.catch(() => zCache().then((hit) => hit || Response.error()));
  const pomala = new Promise((r) => setTimeout(r, SIT_TIMEOUT_MS)).then(zCache).then((hit) => hit || sit);

  event.respondWith(Promise.race([sitNeboCache, pomala]));
});
