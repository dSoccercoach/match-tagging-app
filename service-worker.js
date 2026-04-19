const CACHE_NAME = "tracker-v2";

const FILES_TO_CACHE = [

"/",
"/index.html",
"/style.css",
"/app.js",
"/field_vertical_area.png",
"/field_vertical.png",

];

self.addEventListener("install", e => {

console.log("Service Worker installing");

self.skipWaiting();

e.waitUntil(

caches.open(CACHE_NAME).then(cache =>

cache.addAll(FILES_TO_CACHE)

)

);

});

self.addEventListener("activate", e => {

console.log("Service Worker activating");

e.waitUntil(

caches.keys().then(keys =>

Promise.all(

keys.map(key => {

if (key !== CACHE_NAME) {

console.log("Deleting old cache:", key);

return caches.delete(key);

}

})

)

)

);

self.clients.claim();

});

self.addEventListener("fetch", e => {

e.respondWith(

caches.match(e.request).then(response =>

response || fetch(e.request)

)

);

});