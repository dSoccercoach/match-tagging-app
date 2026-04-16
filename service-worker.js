self.addEventListener("install", e => {

e.waitUntil(

caches.open("tracker").then(cache =>

cache.addAll([

"/",

"/index.html",

"/style.css",

"/app.js",

"/field.png"

])

)

);

});

self.addEventListener("fetch", e => {

e.respondWith(

caches.match(e.request).then(

response => response || fetch(e.request)

)

);

});