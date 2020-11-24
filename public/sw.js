console.log("Reached SW"); 

const appCache = "file-v1"; 

const cachesFiles = [
    "/", 
    "/index.html", 
    "/style.css", 
    "/db.js", 
    "/index.js", 
    "/manifest.webmanifest", 
    "/assets/images/icons/icon-192x192.png", 
    "/assets/images/icons/icon-192x192.png"
]; 

self.addEventListener("install", (event) => {
    console.log("hit install");
});

event.waitUntil(
    caches
      .open(fileCacheName)
      .then(cache => {
        return cache.addAll(filesToCache);
      })
      .catch(error => console.log("error caching files on install: ", error))
  );
  self.skipWaiting();
});

self.addEventListener("active", event => {
  console.log("hit activation");

  event.waitUntil(
    caches
      .keys()
      .then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== filesToCache && key !== dataCacheName) {
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

self.addEventListener("fetch", event => {
  //handle api caching
  if (event.request.url.includes("/api")) {
    return event.respondWith(
      caches
        .open(dataCacheName)
        .then(cache => {
          return fetch(event.request)
            .then(response => {
              if ((response.status = 200)) {
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
});