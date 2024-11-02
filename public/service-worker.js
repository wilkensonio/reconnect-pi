// service-worker.js
const CACHE_NAME = 'reconnect-kiosk-static-v1';
const FONT_CACHE_NAME = 'google-fonts-cache';
const FA_CACHE_NAME = 'font-awesome-cache';

const FONT_FILE_TYPES = ['.woff2', '.woff', '.ttf', '.eot'];
const FONT_MIME_TYPES = {
    '.woff2': 'application/font-woff2',
    '.woff': 'application/font-woff',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

const ALLOWED_DOMAINS = new Set([
    'fonts.googleapis.com', 
    'fonts.gstatic.com',
    'cdnjs.cloudflare.com'
]);

const STATIC_ASSETS = [
    '/reconnect.png',
    '/rcnnct.png',
    '/CSC logo.png',
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
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

self.addEventListener('install', event => {
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)),
            caches.open(FONT_CACHE_NAME),
            caches.open(FA_CACHE_NAME)
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
                        .filter(name => ![CACHE_NAME, FONT_CACHE_NAME, FA_CACHE_NAME].includes(name))
                        .map(name => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    if (event.request.method !== 'GET') return;

    // Check if request is for a font file
    const fontExtension = FONT_FILE_TYPES.find(ext => url.pathname.endsWith(ext));
    const isFontFile = !!fontExtension;
    
    if (ALLOWED_DOMAINS.has(url.hostname) || isFontFile) {
        event.respondWith(
            caches.match(event.request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    return fetch(event.request.clone(), {
                        credentials: 'omit',
                        mode: 'cors',
                        headers: new Headers({
                            'Origin': self.location.origin
                        })
                    }).then(response => {
                        if (response && response.ok) {
                            const cacheName = url.hostname === 'cdnjs.cloudflare.com' 
                                ? FA_CACHE_NAME 
                                : FONT_CACHE_NAME;
                            
                            const responseToCache = response.clone();
                            caches.open(cacheName).then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                            return response;
                        }
                        return response;
                    }).catch(() => {
                        if (isFontFile) {
                            return new Response('', {
                                status: 200,
                                headers: new Headers({
                                    'Content-Type': FONT_MIME_TYPES[fontExtension] || 'application/octet-stream',
                                    'Access-Control-Allow-Origin': '*'
                                })
                            });
                        }
                        throw new Error('Font fetch failed');
                    });
                })
        );
        return;
    }

    // Handle other static assets
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

                        if (STATIC_ASSETS.some(asset => url.pathname.endsWith(asset))) {
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, response.clone()));
                        }

                        return response;
                    });
            })
    );
});