const CACHE_NAME = "scouting-app-lake-city-final-v2.0";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/qrcode.min.js",
  "/js/script.js",
  "/images/back_arrow.png",
  "/images/blue_startingPos.png",
  "/images/red_startingPos.png",
  "/images/menu.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
