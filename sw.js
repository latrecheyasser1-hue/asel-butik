const CACHE_NAME = 'asel-butik-cache-v29';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/config.js',
    '/admin/',
    '/admin/index.html',
    '/admin.css',
    '/admin.js',
    '/register/',
    '/register/index.html',
    '/favicon.ico',
    '/manifest.json',
    '/admin/manifest.json',
    '/images/logo.png',
    '/images/logo-192.png',
    '/images/logo-512.png'
];

const CDN_ASSETS = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.108.2/dist/umd/supabase.js',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.js',
    'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching static assets');
            return Promise.allSettled(
                STATIC_ASSETS.concat(CDN_ASSETS).map(url => {
                    return cache.add(url).catch(err => {
                        console.warn(`Failed to cache asset on install: ${url}`, err);
                    });
                })
            );
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log('Deleting old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    // Only intercept GET requests
    if (event.request.method !== 'GET') return;

    // Do not intercept file:// requests
    if (event.request.url.startsWith('file:')) return;

    const url = new URL(event.request.url);

    // Bypass Supabase database and storage API calls
    if (url.hostname.includes('supabase.co')) {
        return;
    }

    // Determine caching strategy
    const isCDN = CDN_ASSETS.some(cdnUrl => event.request.url.startsWith(cdnUrl)) || 
                  url.hostname.includes('fonts.gstatic.com') ||
                  url.pathname.includes('/webfonts/'); // FontAwesome fonts

    if (isCDN) {
        // Cache-First/Stale-While-Revalidate for external dependencies
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                }).catch(() => {
                    // Fail silently
                });
            })
        );
    } else {
        // Network-First for our local pages and assets
        event.respondWith(
            fetch(event.request).then(networkResponse => {
                // If network response is good, cache it and return it
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // If offline or network fails, try to serve from cache
                return caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // If everything fails and it's a navigation request, return index or admin pages
                    if (event.request.mode === 'navigate') {
                        if (url.pathname.includes('/admin/')) {
                            return caches.match('/admin/index.html');
                        }
                        if (url.pathname.includes('/register/')) {
                            return caches.match('/register/index.html');
                        }
                        return caches.match('/index.html');
                    }
                });
            })
        );
    }
});
