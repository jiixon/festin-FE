// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// URL 쿼리 파라미터에서 설정 읽기
const params = new URLSearchParams(self.location.search);
const config = {
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  storageBucket: params.get('storageBucket'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
};

// 설정이 있으면 즉시 초기화
if (config.apiKey && config.projectId) {
  try {
    firebase.initializeApp(config);
    const messaging = firebase.messaging();

    console.log('FCM SW: Initialized with config', config);

    messaging.setBackgroundMessageHandler((payload) => {
      console.log('Received background message:', payload);

      // 백엔드에서 notification 필드를 보내면 이 핸들러는 실행되지 않을 수 있음 (브라우저가 자동 처리)
      // data-only 메시지일 경우에만 이 코드가 실행됨

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
  } catch (err) {
    console.error('FCM SW: Initialization failed', err);
  }
} else {
  console.warn('FCM SW: No config found in URL parameters');
}

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

// 디버깅용 raw push 리스너
self.addEventListener('push', (event) => {
  console.log('📌 [DEBUG] Raw Push Event Received:', event);
  if (event.data) {
    console.log('📌 [DEBUG] Push Data Text:', event.data.text());
    try {
      console.log('📌 [DEBUG] Push Data JSON:', event.data.json());
    } catch (e) {
      console.log('📌 [DEBUG] Push Data is not JSON');
    }
  } else {
    console.log('📌 [DEBUG] Push Event has no data');
  }
});

console.log('FCM Service Worker is ready');
