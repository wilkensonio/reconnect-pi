// service-worker.js
const CACHE_NAME = 'reconnect-kiosk-static-v1';
const FONT_CACHE_NAME = 'google-fonts-cache';

const STATIC_ASSETS = [
    // Images
    '/reconnect.png',
    '/rcnnct.png',
    '/CSC logo.png',

    // Styles
    '/src/styles/index.css',
    '/src/styles/App.css',
    '/src/styles/BackgroundLogos.css',
    '/src/styles/Button.css',
    '/src/styles/Calendar.css',
    '/src/styles/common.css',
    '/src/styles/ErrorBoundary.css',
    '/src/styles/FacultySelection.css',
    '/src/styles/Home.css',
    '/src/styles/Loading.css',
    '/src/styles/Login.css',
    '/src/styles/PiMessageModal.css',
    '/src/styles/Schedule.css',
    '/src/styles/ViewMeetings.css',

    // External CSS
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Font configurations
const FONT_DOMAINS = new Set(['fonts.googleapis.com', 'fonts.gstatic.com']);

self.addEventListener('install', event => {
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)),
            caches.open(FONT_CACHE_NAME)
        ])
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME && name !== FONT_CACHE_NAME)
                        .map(name => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Handle font requests
    if (FONT_DOMAINS.has(url.hostname)) {
        event.respondWith(
            caches.open(FONT_CACHE_NAME)
                .then(cache => cache.match(event.request))
                .then(response => {
                    if (response) return response;

                    return fetch(event.request.clone(), {
                        mode: 'cors',
                        credentials: 'omit',
                        headers: {
                            'Origin': self.location.origin
                        }
                    }).then(response => {
                        // Cache only if response is valid
                        if (response && response.ok) {
                            caches.open(FONT_CACHE_NAME)
                                .then(cache => cache.put(event.request, response.clone()));
                        }
                        return response;
                    }).catch(() => {
                        return new Response('', {
                            status: 200,
                            headers: new Headers({
                                'Content-Type': 'text/plain',
                            })
                        });
                    });
                })
        );
        return;
    }

    // Handle other assets
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then(response => {
                        if (!response || !response.ok) {
                            return response;
                        }

                        // Cache successful responses for static assets
                        if (STATIC_ASSETS.some(asset => url.pathname.endsWith(asset))) {
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, response.clone()));
                        }

                        return response;
                    });
            })
    );
});