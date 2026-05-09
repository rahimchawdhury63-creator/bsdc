// ============================================
// BSDC — OneSignal Service Worker
// Place this file in the ROOT of your project
// File: /OneSignalSDKWorker.js
// ============================================

importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// ── Custom Push Event Handler ──
self.addEventListener('push', function(event) {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch(e) {
    data = { title: 'BSDC', body: event.data.text() };
  }

  const options = {
    body: data.body || data.alert || 'New update from BSDC',
    icon: '/assets/img/favicon.ico',
    badge: '/assets/img/favicon.ico',
    image: data.image || '/assets/img/og-cover.png',
    tag: 'bsdc-notification',
    renotify: true,
    requireInteraction: false,
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: {
      url: data.url || data.launch_url || 'https://www.bsdc.info.bd',
      notificationId: data.custom?.i || ''
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      data.headings?.en || data.title || 'Bangladesh Software Development Community',
      options
    )
  );
});

// ── Notification Click Handler ──
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const action = event.action;
  if (action === 'dismiss') return;

  const url = event.notification.data?.url || 'https://www.bsdc.info.bd';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url.includes('bsdc.info.bd') && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// ── Background Sync (offline support) ──
self.addEventListener('sync', function(event) {
  if (event.tag === 'bsdc-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  console.log('BSDC: Syncing offline data...');
}
