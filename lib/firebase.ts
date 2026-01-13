// Firebase 설정
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase 앱 초기화 (중복 방지)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Messaging 인스턴스 (브라우저 환경에서만)
let messaging: ReturnType<typeof getMessaging> | null = null;

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

/**
 * FCM 토큰 요청 및 권한 획득
 */
export const requestFCMToken = async (): Promise<string | null> => {
  try {
    // 브라우저 환경 체크
    if (typeof window === 'undefined' || !messaging) {
      console.log('FCM is not supported in this environment');
      return null;
    }

    // 알림 권한 요청
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      console.log('FCM Token obtained:', token);
      return token;
    }

    console.log('Notification permission denied');
    return null;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * 포그라운드 메시지 리스너
 */
export const onMessageListener = (callback: (payload: any) => void) => {
  if (!messaging) return;

  return onMessage(messaging, (payload) => {
    console.log('Received foreground message:', payload);
    callback(payload);
  });
};

export { messaging };
