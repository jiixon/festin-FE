// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase 설정은 런타임에 환경변수에서 가져올 수 없으므로
// 클라이언트에서 postMessage로 설정을 전달받거나,
// 빌드 시 설정 파일을 생성해야 합니다.
// 여기서는 간단하게 self.addEventListener를 통해 설정을 받습니다.

let firebaseApp = null;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    if (!firebaseApp) {
      firebaseApp = firebase.initializeApp(event.data.config);
      const messaging = firebase.messaging();

      messaging.setBackgroundMessageHandler((payload) => {
        console.log('Received background message:', payload);

        const notificationTitle = payload.notification?.title || '새로운 알림';
        const notificationOptions = {
          body: payload.notification?.body || '',
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'festin-notification',
          requireInteraction: true,
          data: payload.data,
        };

        return self.registration.showNotification(notificationTitle, notificationOptions);
      });
    }
  }
});

// 알림 클릭 이벤트 처리
// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  // 알림 클릭 시 앱으로 이동
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열린 탭이 있으면 포커스
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // 없으면 새 탭 열기
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

console.log('FCM Service Worker is ready');
