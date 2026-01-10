/**
 * FCM (Firebase Cloud Messaging) 헬퍼 함수들
 */

import { requestFCMToken } from './firebase';
import { authApi } from './api/auth';

/**
 * 서비스 워커 등록 및 Firebase 설정 전달
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service Worker is not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Service Worker registered:', registration);

    // Firebase 설정을 서비스 워커로 전달
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    // 서비스 워커에 설정 전달
    if (registration.active) {
      registration.active.postMessage({
        type: 'FIREBASE_CONFIG',
        config: firebaseConfig,
      });
    }

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

/**
 * FCM 토큰 획득 및 백엔드 등록
 */
export const initializeFCM = async (): Promise<boolean> => {
  try {
    // 서비스 워커 등록
    const registration = await registerServiceWorker();
    if (!registration) {
      console.log('Service Worker registration failed, skipping FCM');
      return false;
    }

    // FCM 토큰 요청
    const token = await requestFCMToken();
    if (!token) {
      console.log('Failed to get FCM token');
      return false;
    }

    // 백엔드에 토큰 등록
    const result = await authApi.registerFcmToken(token);
    if (result.success) {
      console.log('FCM token registered successfully');
      return true;
    } else {
      console.error('Failed to register FCM token with backend');
      return false;
    }
  } catch (error) {
    console.error('FCM initialization failed:', error);
    return false;
  }
};

/**
 * 알림 권한 상태 확인
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

/**
 * 알림 권한이 있는지 확인
 */
export const hasNotificationPermission = (): boolean => {
  return getNotificationPermission() === 'granted';
};
