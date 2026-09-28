const CACHE_NAME = 'aurely-manifestation-action-v13-20260928';
const FONT_WEIGHTS = {
  'cormorant-garamond': [400, 600, 700],
  'nunito-sans': [400, 600, 700],
  inter: [400, 600, 700],
  lora: [400, 600, 700],
  'atkinson-hyperlegible': [400, 700],
  kalam: [400],
  caveat: [400],
  'patrick-hand': [400],
  'dancing-script': [400],
  sacramento: [400]
};
const STICKERS = [
  'abundance-seeds',
  'cozy-home',
  'evidence-win',
  'gratitude-bouquet',
  'growing-sprout',
  'guiding-star',
  'milestone-flag',
  'one-small-step',
  'open-heart',
  'open-journal',
  'sunrise-intention',
  'travel-suitcase'
];
const APP_SHELL = [
  './app.js?v=11',
  './src/data.js?v=11',
  './styles.css?v=11',
  './welcome.css?v=11',
  './src/welcome.js?v=11',
  './focus.css?v=11',
  './src/focus-session.js?v=11',
  './manifest.webmanifest',
  './assets/logo.svg',
  './assets/hero-sunset.png',
  './assets/botanical-still.png',
  './icon-192.png',
  './icon-512.png',
  ...STICKERS.map((name) => `./assets/stickers/${name}.svg`),
  ...Object.entries(FONT_WEIGHTS).flatMap(([family, weights]) => weights.map((weight) => `./assets/fonts/${family}-latin-${weight}-normal.woff2`))
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(['./', './index.html']);
    await Promise.all(APP_SHELL.map(async (path) => {
      try {
        await cache.add(path);
      } catch {
        // One missing optional file must not block installing the app shell.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith('aurely-manifestation-action-') && name !== CACHE_NAME).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;

  const isNavigation = request.mode === 'navigate';
  const isAsset = /\.(?:css|js|mjs|png|jpe?g|webp|svg|woff2?|webmanifest)$/i.test(url.pathname);
  if (!isNavigation && !isAsset) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cached = await cache.match(request);
      if (cached) return cached;
      if (isNavigation) {
        const home = await cache.match('./index.html') || await cache.match('./');
        if (home) return home;
      }
      return Response.error();
    }
  })());
});
