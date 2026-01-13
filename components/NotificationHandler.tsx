'use client';

import { useEffect, useState } from 'react';
import { onMessageListener } from '@/lib/firebase';
import { useAuthStore } from '@/lib/stores/authStore';
import { initializeFCM } from '@/lib/fcm';

/**
 * 포그라운드 알림 핸들러
 * 앱이 실행 중일 때 받는 알림을 처리합니다.
 */
export default function NotificationHandler() {
  const { user } = useAuthStore();
  const [fcmInitialized, setFcmInitialized] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 확인 로그
    console.log('NotificationHandler mounted. Waiting for foreground messages...');

    // 로그인된 상태라면 FCM 초기화 시도
    if (user && !fcmInitialized) {
      console.log('User is logged in. Initializing FCM...');
      initializeFCM()
        .then((success) => {
          if (success) {
            console.log('FCM initialized successfully via NotificationHandler');
            setFcmInitialized(true);
          }
        })
        .catch((err) => console.error('Failed to initialize FCM:', err));
    }

    // 포그라운드 메시지 리스너 설정
    const unsubscribe = onMessageListener((payload: any) => {
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

        try {
          new Notification(notificationTitle, notificationOptions);
        } catch (error) {
          console.error('Error showing notification:', error);
        }
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, fcmInitialized]);

  return null; // UI를 렌더링하지 않는 컴포넌트
}
