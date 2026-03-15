var CACHE = 'tasks-v2';
var ASSETS = [
  '/To-Do-List/',
  '/To-Do-List/index.html',
  '/To-Do-List/manifest.json'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(ASSETS).catch(function(){});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  // Never intercept external services
  if (e.request.url.indexOf('supabase.co') >= 0) return;
  if (e.request.url.indexOf('jsdelivr.net') >= 0) return;
  if (e.request.url.indexOf('fonts.googleapis') >= 0) return;
  if (e.request.url.indexOf('chrome-extension') >= 0) return;

  // Network-first: always get fresh from network, cache as backup only
  e.respondWith(
    fetch(e.request)
      .then(function(res) {
        if (res && res.status === 200) {
          var clone = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        }
        return res;
      })
      .catch(function() {
        return caches.match(e.request);
      })
  );
});
