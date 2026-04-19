const CACHE_NAME = "tracker-v4";

const FILES_TO_CACHE = [
"./",
"./index.html",
"./style.css",
"./app.js",
"./field_vertical_area.png",
"./field_vertical.png"
];

self.addEventListener("install", event => {

console.log("SW installing");

self.skipWaiting();

event.waitUntil(

caches.open(CACHE_NAME)
.then(cache => {
console.log("Caching files");
return cache.addAll(FILES_TO_CACHE);
})
.catch(err => {
console.error("Cache failed:", err);
})

);

});

self.addEventListener("activate", event => {

console.log("SW activating");

event.waitUntil(

caches.keys().then(keys =>
Promise.all(
keys.map(key => {
if (key !== CACHE_NAME) {
return caches.delete(key);
}
})
)
)

);

self.clients.claim();

});

self.addEventListener("fetch", event => {

event.respondWith(

caches.match(event.request)
.then(response => response || fetch(event.request))

);

});