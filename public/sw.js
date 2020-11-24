console.log("Reached SW");

const appCache = "file-v2";
const dataCacheName = "data-v1";

const cacheFiles = [
  "/",
  "/index.html",
  "/style.css",
  "/db.js",
  "/index.js",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-192x192.png",
];

self.addEventListener("install", event => {
  console.log("hit install");

  event.waitUntil(
    caches
      .open(appCache)
      .then(cache => {
        return cache.addAll(cacheFiles);
      })
      .catch(error => console.log("error caching files on install: ", error))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  console.log("hit activation");

  event.waitUntil(
    caches
      .keys()
      .then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== appCache && key !== dataCacheName) {
              console.log("deleting cache: ", key);
              return caches.delete(key);
            }
          })
        );
      })
      .catch(error => console.log("activation error: ", error))
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    console.log(event);
  //handle api caching
  if (event.request.url.includes("/api")) {
    return event.respondWith(
      caches
        .open(dataCacheName)
        .then(cache => {
          return fetch(event.request)
            .then(response => {
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }

              return response;
            })
            .catch(error => {
              return cache.match(event.request);
            });
        })
        .catch(error => console.log("error fetching api: : ", error))
    );
  }

  event.respondWith(
      caches    
        .match(event.request) 
        .then(response => {
            return response || fetch(event.request);
        })
        .catch(error => console.log(error))
  )
});
