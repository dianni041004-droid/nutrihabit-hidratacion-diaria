// Service Worker para notificaciones push
const CACHE_NAME = 'nutrihabit-v1';
const ASSETS = [
    '/',
    '/manifest.json',
    '/ui/inicio/index.html',
    '/ui/historial/historial.html',
    '/ui/metas/metas.html',
    '/ui/profile/perfil.html',
    '/ui/hidratacion/registro.html',
    '/ui/recordatorios/recordatorios.html',
    '/css/style.css'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache abierto');
                // Intentar cachear cada archivo individualmente
                return Promise.allSettled(
                    ASSETS.map(url => 
                        cache.add(url).catch(err => {
                            console.warn(`No se pudo cachear: ${url}`, err);
                        })
                    )
                );
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('push', (event) => {
    let data = {
        title: '💧 NutriHabit',
        body: '¡Hora de hidratarte! Recuerda beber agua.',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png'
    };

    if (event.data) {
        try {
            const parsed = event.data.json();
            data = { ...data, ...parsed };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/icons/icon-192.png',
        badge: data.badge || '/icons/icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'nutrihabit-notification',
        requireInteraction: true,
        data: {
            url: data.url || '/ui/inicio/index.html'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/ui/inicio/index.html';
    
    event.waitUntil(
        clients.matchAll({ 
            type: 'window', 
            includeUncontrolled: true 
        }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, body, icon } = event.data;
        self.registration.showNotification(title || '💧 NutriHabit', {
            body: body || '¡Hora de hidratarte!',
            icon: icon || '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            vibrate: [200, 100, 200],
            tag: 'nutrihabit-notification',
            requireInteraction: true
        });
    }
});