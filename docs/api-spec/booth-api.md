# Booth API - 부스 관리 (스태프용)

## 📋 개요

부스 스태프가 대기자를 호출하고, 입장을 확인하며, 체험 완료를 처리하는 API입니다.

### Base URL
```
Production: https://api.festin.shop
Development: http://localhost:8080
```

### 인증
```
Authorization: Bearer <JWT_TOKEN>
X-Staff-Role: BOOTH_MANAGER
```

### 공통 에러 응답
```json
{
  "status": 400,
  "code": "ERROR_CODE",
  "message": "에러 메시지",
  "details": {}
}
```

---

## 👨‍💼 API 명세

### 1. 다음 사람 호출

**POST /api/v1/booths/{boothId}/call**

**목적**: 대기열에서 다음 순번 호출

#### Request

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
X-Staff-Role: BOOTH_MANAGER
```

**Path Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `boothId` | Long | ✅ | 부스 ID |

#### Success Response (200 OK)
```json
{
  "waitingId": 123,
  "userId": 456,
  "position": 1,
  "calledAt": "2025-11-20T10:45:00Z"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `waitingId` | Long | 대기 이력 ID (MySQL에 저장된 ID) |
| `userId` | Long | 호출된 사용자 ID |
| `position` | Integer | 호출 시점 순번 |
| `calledAt` | String | 호출 시간 (ISO 8601) |

#### Error Responses

**409 Conflict - 정원 초과**
```json
{
  "status": 409,
  "code": "BOOTH_FULL",
  "message": "부스 정원이 초과되었습니다.",
  "details": {
    "current": 50,
    "capacity": 50
  }
}
```

**404 Not Found - 대기열 비어있음**
```json
{
  "status": 404,
  "code": "QUEUE_EMPTY",
  "message": "대기 중인 사람이 없습니다."
}
```

---

### 2. 입장 확인

**POST /api/v1/booths/{boothId}/entrance/{waitingId}**

**목적**: 호출된 사용자 입장 확인

#### Request

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
X-Staff-Role: BOOTH_MANAGER
```

**Path Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `boothId` | Long | ✅ | 부스 ID |
| `waitingId` | Long | ✅ | 대기 ID |

#### Success Response (200 OK)
```json
{
  "waitingId": 123,
  "status": "ENTERED",
  "enteredAt": "2025-11-20T10:50:00Z"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `waitingId` | Long | 대기 이력 ID |
| `status` | String | 현재 상태 (ENTERED) |
| `enteredAt` | String | 입장 확인 시간 (ISO 8601) |

#### Error Responses

**400 Bad Request - 잘못된 상태**
```json
{
  "status": 400,
  "code": "INVALID_STATUS",
  "message": "호출된 상태가 아닙니다.",
  "details": {
    "currentStatus": "COMPLETED"
  }
}
```

**404 Not Found - 대기 정보 없음**
```json
{
  "status": 404,
  "code": "WAITING_NOT_FOUND",
  "message": "해당 대기 정보를 찾을 수 없습니다."
}
```

---

### 3. 체험 완료

**POST /api/v1/booths/{boothId}/complete/{waitingId}**

**목적**: 사용자 체험 완료 처리

#### Request

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
X-Staff-Role: BOOTH_MANAGER
```

**Path Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `boothId` | Long | ✅ | 부스 ID |
| `waitingId` | Long | ✅ | 대기 ID |

#### Success Response (200 OK)
```json
{
  "waitingId": 123,
  "status": "COMPLETED",
  "completionType": "ENTERED",
  "completedAt": "2025-11-20T10:55:00Z"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `waitingId` | Long | 대기 이력 ID |
| `status` | String | 현재 상태 (COMPLETED) |
| `completionType` | String | 완료 유형 (ENTERED/NO_SHOW/CANCELLED) |
| `completedAt` | String | 완료 시간 (ISO 8601) |

#### Error Responses

**400 Bad Request - 잘못된 상태**
```json
{
  "status": 400,
  "code": "INVALID_STATUS",
  "message": "입장 확인된 상태가 아닙니다.",
  "details": {
    "currentStatus": "CALLED"
  }
}
```

---

## 📝 비즈니스 규칙

### 호출 규칙
- 대기열에서 **가장 앞 사람 1명**만 호출
- 부스 정원 여유 있을 때만 호출 가능
- 호출 시 **MySQL에 영구 저장** (Redis에서 제거)
- FCM 푸시 알림 자동 발송

### 입장 규칙
- **호출됨(CALLED)** 상태에서만 입장 확인 가능
- 입장 확인 시 부스 현재 인원 +1 (Redis INCR)
- 타임아웃 내 미입장 시 자동 **노쇼(NO_SHOW)** 처리

### 완료 규칙
- **입장 확인됨(ENTERED)** 상태에서만 완료 가능
- 완료 시 부스 현재 인원 -1 (Redis DECR)
- 완료 유형: `ENTERED` (정상), `NO_SHOW` (미입장), `CANCELLED` (취소)

---

## 🔄 상태 전이 흐름

```
[대기 중] (Redis에만 존재)
    ↓
[호출됨 CALLED] (MySQL 저장 + FCM 발송)
    ↓
[입장 확인됨 ENTERED] (정원 +1)
    ↓
[완료됨 COMPLETED] (정원 -1)
```

**예외 흐름**:
- `CALLED` → `NO_SHOW` (타임아웃)
- `CALLED` → `CANCELLED` (사용자 취소, 향후)

---

**Last Updated**: 2025-12-17
**Version**: 1.0