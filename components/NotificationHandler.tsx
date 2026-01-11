'use client';

import { useEffect } from 'react';
import { onMessageListener } from '@/lib/firebase';

/**
 * 포그라운드 알림 핸들러
 * 앱이 실행 중일 때 받는 알림을 처리합니다.
 */
export default function NotificationHandler() {
  useEffect(() => {
    // 포그라운드 메시지 리스너 설정
    onMessageListener()
      .then((payload: any) => {
        if (!payload) return;

        console.log('Foreground notification received:', payload);

        // 브라우저 알림 표시
        if ('Notification' in window && Notification.permission === 'granted') {
          const notificationTitle = payload.notification?.title || '새로운 알림';
          const notificationOptions = {
            body: payload.notification?.body || '',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: 'festin-notification',
            requireInteraction: true,
            data: payload.data,
          };

          new Notification(notificationTitle, notificationOptions);
        }

        // 커스텀 UI 알림 (선택사항)
        // 예: Toast 메시지 표시
        // showToast(payload.notification?.title, payload.notification?.body);
      })
      .catch((err: unknown) => {
        console.error('Error in foreground message listener:', err);
      });
  }, []);

  return null; // UI를 렌더링하지 않는 컴포넌트
}
