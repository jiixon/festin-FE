import { Waiting } from '@/types';

const STORAGE_KEY = 'mock_waitings';

export const mockWaitingStore = {
  // 내 대기 목록 가져오기
  getMyWaitings(): Waiting[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // 대기 등록
  addWaiting(waiting: Waiting): void {
    if (typeof window === 'undefined') return;
    const waitings = this.getMyWaitings();

    // 이미 등록된 부스인지 확인
    const exists = waitings.find(w => w.boothId === waiting.boothId);
    if (exists) return;

    // 최대 2개까지만
    if (waitings.length >= 2) {
      throw new Error('최대 2개 부스까지 동시 대기 가능합니다.');
    }

    waitings.push(waiting);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(waitings));
  },

  // 특정 부스 대기 조회
  getWaiting(boothId: number): Waiting | null {
    const waitings = this.getMyWaitings();
    return waitings.find(w => w.boothId === boothId) || null;
  },

  // 대기 취소
  removeWaiting(boothId: number): void {
    if (typeof window === 'undefined') return;
    const waitings = this.getMyWaitings();
    const filtered = waitings.filter(w => w.boothId !== boothId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  // 대기 정보 업데이트 (순번 변경 등)
  updateWaiting(boothId: number, updates: Partial<Waiting>): void {
    if (typeof window === 'undefined') return;
    const waitings = this.getMyWaitings();
    const index = waitings.findIndex(w => w.boothId === boothId);

    if (index !== -1) {
      waitings[index] = { ...waitings[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(waitings));
    }
  },

  // 모든 대기 초기화 (테스트용)
  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },
};
