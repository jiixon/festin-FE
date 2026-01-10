# Festin - 축제 부스 대기열 관리 시스템 🎪

대학 축제 부스 대기열을 효율적으로 관리하는 PWA 웹 애플리케이션입니다.

## 🚀 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Push Notification**: Firebase Cloud Messaging (FCM)
- **PWA**: Progressive Web App

## 📦 주요 기능

### 일반 사용자 (방문자)
- ✅ 부스 목록 조회
- ✅ 부스 상세 정보 확인
- ✅ 대기 등록 (최대 2개 부스)
- ✅ 실시간 순번 조회 (동적 폴링)
- ✅ 내 대기 목록 관리
- ✅ 대기 취소
- 🔜 FCM 푸시 알림 (호출 시)

### 스태프
- ✅ 부스 현황 대시보드
- ✅ 다음 사람 호출
- ✅ 입장 확인
- ✅ 체험 완료 처리
- ✅ 실시간 통계 확인
- ✅ 호출 대기 목록 관리

## 🛠️ 로컬 개발 환경 설정

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 설정하세요:

```env
# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# FCM (Firebase Cloud Messaging) - 나중에 설정
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## 📁 프로젝트 구조

```
festin-front/
├── app/                      # Next.js App Router
│   ├── auth/                 # 로그인 페이지
│   ├── booths/               # 부스 목록 및 상세
│   ├── waiting/              # 순번 조회
│   ├── my-waitings/          # 내 대기 목록
│   └── staff/                # 스태프 대시보드
├── components/               # 공통 컴포넌트
│   ├── layout/               # Header, BottomNav
│   └── ui/                   # Button, Card, Input 등
├── lib/                      # 유틸리티
│   ├── api/                  # API 클라이언트
│   ├── stores/               # Zustand 상태 관리
│   └── firebase.ts           # FCM 설정
├── types/                    # TypeScript 타입 정의
├── public/                   # 정적 파일 (manifest, icons)
└── docs/                     # 프로젝트 문서
```

## 🔧 백엔드 API 연동

### 필요한 백엔드 API

현재 구현된 API:
- ✅ POST /api/v1/waitings - 대기 등록
- ✅ GET /api/v1/waitings/booth/{boothId} - 순번 조회
- ✅ DELETE /api/v1/waitings/{boothId} - 대기 취소
- ✅ POST /api/v1/booths/{boothId}/call - 다음 사람 호출
- ✅ POST /api/v1/booths/{boothId}/entrance/{waitingId} - 입장 확인
- ✅ POST /api/v1/booths/{boothId}/complete/{waitingId} - 체험 완료

추가 필요한 API (백엔드 구현 필요):
- 🔜 POST /api/v1/auth/simple-login - 간단 로그인
- 🔜 GET /api/v1/booths - 부스 목록 조회
- 🔜 GET /api/v1/booths/{boothId} - 부스 상세 조회
- 🔜 GET /api/v1/waitings/my - 내 대기 목록 조회
- 🔜 GET /api/v1/staff/booths/{boothId}/status - 부스 현황 조회
- 🔜 GET /api/v1/staff/booths/{boothId}/called-list - 호출 대기 목록

자세한 API 명세는 [`docs/api-spec/needed-apis.md`](docs/api-spec/needed-apis.md)를 참조하세요.

## 🎨 디자인 시스템

### 색상
- **Primary**: Indigo (600-700) - 메인 액션
- **Secondary**: Gray - 보조 액션
- **Danger**: Red - 경고, 취소
- **Success**: Green - 성공, 완료
- **Warning**: Orange/Yellow - 주의, 알림

### 컴포넌트
- `Button`: primary, secondary, danger, ghost 4가지 variant
- `Card`: 카드 레이아웃 (hover 효과 옵션)
- `Input`: 폼 입력 필드
- `Loading`: 로딩 스피너

## 🔔 FCM 푸시 알림 설정 (나중에)

1. Firebase 프로젝트 생성
2. Cloud Messaging 활성화
3. 웹 앱 등록 및 키 발급
4. `.env.local`에 Firebase 설정 추가
5. `lib/firebase.ts` 주석 해제
6. `public/firebase-messaging-sw.js` 주석 해제

## 📱 PWA 설정

PWA로 동작하며 모바일에서 홈 화면에 추가 가능합니다.

- Manifest: `/manifest.json`
- 아이콘: `/icon-192.png`, `/icon-512.png` (TODO: 실제 아이콘 제작 필요)

## 🚀 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

또는 GitHub 연동 후 자동 배포 설정

## 📝 개발 노트

### 인증 방식
- 1인 프로젝트를 위한 간단 로그인 방식 채택
- 닉네임 + 역할(VISITOR/STAFF)만으로 JWT 발급
- 실제 운영 시 이메일/비밀번호 또는 소셜 로그인 고려

### 동적 폴링
- 순번에 따라 갱신 주기 자동 조정
  - 1-5번: 5초
  - 6-20번: 10초
  - 21-50번: 20초
  - 51번~: 30초

### 스태프 부스 ID
- 현재는 하드코딩 (boothId = 1)
- 실제로는 로그인 시 담당 부스 ID를 받아와야 함

## 🐛 알려진 이슈

- [ ] FCM 푸시 알림 미구현 (Firebase 설정 필요)
- [ ] PWA 아이콘 미제작 (192x192, 512x512)
- [ ] 백엔드 API 일부 미구현 (needed-apis.md 참조)
- [ ] 스태프 담당 부스 ID 하드코딩

## 📄 라이선스

MIT License

## 👨‍💻 개발자

1인 프로젝트 - 백엔드 개발자

---

**Last Updated**: 2025-12-24
