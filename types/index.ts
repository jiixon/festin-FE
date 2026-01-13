// 공통 타입
export type UserRole = 'VISITOR' | 'STAFF';
export type BoothStatus = 'OPEN' | 'CLOSED';
export type WaitingStatus = 'WAITING' | 'CALLED' | 'ENTERED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
export type CompletionType = 'ENTERED' | 'NO_SHOW' | 'CANCELLED';

// 사용자
export interface User {
  userId: number;
  email: string;
  nickname?: string;
  role: UserRole;
  accessToken: string;
  boothId?: number; // STAFF인 경우 관리하는 부스 ID
}

// 부스
export interface Booth {
  boothId: number;
  boothName: string;
  description?: string;
  universityName: string;
  status: BoothStatus;
  capacity: number;
  currentPeople?: number;
  totalWaiting: number;
  estimatedWaitTime: number; // 분
  openTime?: string;
  closeTime?: string;
}

// 대기
export interface Waiting {
  boothId: number;
  boothName: string;
  position: number;
  totalWaiting: number;
  estimatedWaitTime: number;
  registeredAt: string;
  status?: WaitingStatus;
  calledAt?: string; // 호출된 시간 (ISO 8601 형식)
  remainingTime?: number; // 노쇼까지 남은 시간(초)
}

// 대기 이력 (호출 후)
export interface WaitingHistory {
  waitingId: number;
  userId: number;
  nickname?: string;
  boothId: number;
  position: number;
  status: WaitingStatus;
  calledAt?: string;
  enteredAt?: string;
  completedAt?: string;
  completionType?: CompletionType;
  remainingTime?: number; // 노쇼까지 남은 시간(초)
}

// 부스 현황 (스태프용)
export interface BoothStatusData {
  boothId: number;
  boothName: string;
  currentPeople: number;
  capacity: number;
  totalWaiting: number;
  todayStats: {
    totalCalled: number;
    totalEntered: number;
    totalNoShow: number;
    totalCompleted: number;
  };
}

// API 에러 응답
export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// API 응답
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
