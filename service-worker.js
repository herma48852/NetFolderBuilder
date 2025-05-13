const CACHE_NAME = 'my-pwa-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/new-main.js',
    '/tween.umd.js',
    '/js/three.module.js',
    '/js/OrbitControls.js',
    '/phys-nets/tetrahedron-phys.json',
    '/phys-nets/cube-phys.json',
    '/phys-nets/octahedron-phys.json',
    '/phys-nets/dodecahedron-phys.json',
    '/phys-nets/icosahedron-phys.json',
    '/phys-nets/cubotahedron-phys.json',
    '/phys-nets/elongated-square-gyrobicupola-phys.json',
    '/phys-nets/rhombicuboctahedron-phys.json',
    '/phys-nets/icosidodecahedron-phys.json',
    '/phys-nets/truncated-tetrahedron-phys.json',
    '/phys-nets/truncated-cube-phys.json',
    '/phys-nets/truncated-octahedron-phys.json',
    '/phys-nets/truncated-cuboctahedron-phys.json',
    '/phys-nets/truncated-dodecahedron-phys.json',
    '/phys-nets/truncated-icosahedron-phys.json',
    '/phys-nets/truncated-icosidodecahedron-phys.json',
    '/phys-nets/small-rhombicosidodecahedron-phys.json',
    '/phys-nets/snub-cube-phys.json',
    '/phys-nets/snub-dodecahedron-phys.json',
    '/icons/192.png',
    '/icons/512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
