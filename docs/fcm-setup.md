# FCM (Firebase Cloud Messaging) 설정 가이드

## 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: Festin)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

## 2. 웹 앱 추가

1. Firebase 프로젝트 설정 > 일반
2. "웹 앱 추가" 클릭 (</> 아이콘)
3. 앱 닉네임 입력 (예: Festin Web)
4. Firebase 호스팅은 선택하지 않음
5. 앱 등록

## 3. Firebase 구성 정보 복사

앱 등록 후 표시되는 Firebase SDK 구성 정보를 복사합니다:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## 4. VAPID 키 생성

1. Firebase Console > 프로젝트 설정 > 클라우드 메시징
2. "웹 푸시 인증서" 탭으로 이동
3. "키 쌍 생성" 클릭
4. 생성된 키 값 복사 (예: BNxxx...)

## 5. 환경 변수 설정

`.env.local` 파일에 Firebase 구성 정보를 추가합니다:

```bash
# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# FCM (Firebase Cloud Messaging)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BNxxx...
```

## 6. 개발 서버 재시작

환경 변수를 추가한 후에는 개발 서버를 재시작해야 합니다:

```bash
npm run dev
```

## 7. FCM 동작 흐름

### 로그인 시
1. 사용자가 로그인 (일반 또는 스태프)
2. `initializeFCM()` 함수 자동 실행
3. 서비스 워커 등록
4. 알림 권한 요청 (사용자 승인 필요)
5. FCM 토큰 생성
6. 백엔드에 FCM 토큰 등록 (`POST /api/v1/users/fcm-token`)

### 알림 수신
**포그라운드 (앱 실행 중)**
- `NotificationHandler` 컴포넌트가 메시지 수신
- 브라우저 알림 표시

**백그라운드 (앱 미실행)**
- Service Worker가 메시지 수신
- `firebase-messaging-sw.js`에서 알림 표시

## 8. 테스트 방법

### 알림 권한 확인
브라우저 개발자 도구 > Console에서:
```javascript
Notification.permission // "granted", "denied", "default"
```

### FCM 토큰 확인
로그인 후 Console에서 다음 로그 확인:
```
FCM Token obtained: fK3j2...
FCM token registered successfully
```

### Firebase Console에서 테스트 메시지 전송
1. Firebase Console > Engage > Messaging
2. "첫 번째 캠페인 만들기" 클릭
3. "Firebase 알림 메시지" 선택
4. 알림 제목 및 텍스트 입력
5. "테스트 메시지 전송" 클릭
6. FCM 토큰 입력 (Console 로그에서 복사)
7. "테스트" 클릭

## 9. 백엔드 알림 페이로드 형식

백엔드에서 Redis를 통해 전송하는 알림 JSON 형식:

```json
{
  "notification": {
    "title": "순번 호출",
    "body": "치킨 부스에서 호출했습니다. 5분 이내 입장해주세요!"
  },
  "data": {
    "boothId": "1",
    "waitingId": "123",
    "type": "CALLED"
  },
  "token": "사용자_FCM_토큰"
}
```

## 10. 문제 해결

### 알림이 오지 않는 경우
1. `.env.local` 파일에 모든 Firebase 설정값이 있는지 확인
2. 개발 서버를 재시작했는지 확인
3. 브라우저 알림 권한이 "granted"인지 확인
4. Console에 에러 로그가 있는지 확인
5. Service Worker가 제대로 등록되었는지 확인:
   - 개발자 도구 > Application > Service Workers

### Service Worker 업데이트 안 되는 경우
1. 개발자 도구 > Application > Service Workers
2. "Unregister" 클릭
3. 페이지 새로고침

### HTTPS 필요
- 로컬 개발: `localhost`는 HTTP로 가능
- 프로덕션: HTTPS 필수 (Service Worker 요구사항)

## 11. 프로덕션 배포 시 주의사항

1. **아이콘 파일 준비**
   - `/public/icon-192.png` (192x192)
   - `/public/icon-512.png` (512x512)

2. **HTTPS 필수**
   - Vercel, Netlify 등은 자동으로 HTTPS 제공

3. **환경 변수 설정**
   - 배포 플랫폼에 Firebase 환경 변수 추가

4. **Service Worker 캐싱**
   - Service Worker 파일은 캐시되므로 변경 시 버전 관리 필요

## 12. 참고 링크

- [Firebase 문서](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
