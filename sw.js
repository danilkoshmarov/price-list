const CACHE_NAME = 'smoky-notes-v3';
const urlsToCache = [
    '/price-list/',
    '/price-list/index.html',
    'https://i.ibb.co/GvyPxNKK/SN.jpg',
    'https://api.npoint.io/55674e9c91b4698843d7'
];

// Установка
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

// Активация (удаляем старые кэши)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Перехват запросов
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
            .catch(() => {
                // Если нет интернета и кэша — показываем fallback
                return caches.match('/price-list/index.html');
            })
    );
});

// Фоновая синхронизация (для заказов)
self.addEventListener('sync', event => {
    if(event.tag === 'sync-orders'){
        event.waitUntil(
            fetch('https://api.npoint.io/55674e9c91b4698843d7', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({sync: true})
            }).then(() => console.log('✅ Синхронизация выполнена'))
        );
    }
});

console.log('🔧 Service Worker загружен v3');