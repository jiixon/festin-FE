import apiClient from './client';
import { Booth, BoothStatusData, WaitingHistory } from '@/types';

interface BoothListResponse {
  booths: Array<{
    boothId: number;
    boothName: string;
    description?: string;
    universityName: string;
    status: 'OPEN' | 'CLOSED';
    capacity: number;
    currentWaiting: number; // API 스펙에서는 currentWaiting
    estimatedWaitTime: number;
  }>;
}

export const boothApi = {
  // 부스 목록 조회
  async getBooths(universityId?: number): Promise<Booth[]> {
    const params = universityId ? { universityId } : {};
    const response = await apiClient.get<BoothListResponse>('/api/v1/booths', { params });

    // currentWaiting -> totalWaiting 변환
    return response.data.booths.map(booth => ({
      ...booth,
      totalWaiting: booth.currentWaiting,
      currentPeople: 0, // 목록 조회에서는 제공 안 함
    }));
  },

  // 부스 상세 조회
  async getBoothDetail(boothId: number): Promise<Booth> {
    const response = await apiClient.get<Booth>(`/api/v1/booths/${boothId}`);
    return response.data;
  },

  // 다음 사람 호출 (스태프용)
  async callNext(boothId: number): Promise<WaitingHistory> {
    const response = await apiClient.post<WaitingHistory>('/api/v1/waitings/call', { boothId });
    return response.data;
  },

  // 입장 확인 (스태프용)
  async confirmEntrance(boothId: number, waitingId: number): Promise<WaitingHistory> {
    const response = await apiClient.post<WaitingHistory>(
      `/api/v1/booths/${boothId}/entrance/${waitingId}`
    );
    return response.data;
  },

  // 체험 완료 (스태프용)
  async completeExperience(boothId: number, waitingId: number): Promise<WaitingHistory> {
    const response = await apiClient.post<WaitingHistory>(
      `/api/v1/booths/${boothId}/complete/${waitingId}`
    );
    return response.data;
  },

  // 부스 현황 조회 (스태프용)
  async getBoothStatus(boothId: number): Promise<BoothStatusData> {
    const response = await apiClient.get<BoothStatusData>(`/api/v1/booths/${boothId}/status`);
    return response.data;
  },

  // 호출 대기 목록 조회 (스태프용)
  async getCalledList(boothId: number): Promise<WaitingHistory[]> {
    const response = await apiClient.get<{ calledList: WaitingHistory[] }>(
      `/api/v1/booths/${boothId}/called-list`
    );
    return response.data.calledList;
  },
};
