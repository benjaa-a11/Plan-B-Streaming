self.addEventListener('push', function (event) {
    if (!event.data) {
        console.log('Push event sin datos.');
        return;
    }

    try {
        const data = event.data.json();
        const title = data.title || 'Nueva Notificación';
        const options = {
            body: data.message || 'Has recibido una nueva notificación.',
            icon: data.icon || '/icon.png',
            badge: '/badge.png', // Un ícono pequeño para la barra de notificaciones
            data: {
                url: data.data?.url || '/'
            }
        };

        event.waitUntil(self.registration.showNotification(title, options));
    } catch (e) {
        console.error('Error al procesar el push event:', e);
        // Fallback para datos de texto plano
        const title = 'Nueva Notificación';
        const options = {
            body: event.data.text(),
            icon: '/icon.png',
            badge: '/badge.png',
            data: {
                url: '/'
            }
        };
        event.waitUntil(self.registration.showNotification(title, options));
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(function (clientList) {
            // Si ya hay una ventana abierta, enfócala
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // Si no, abre una nueva ventana
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
