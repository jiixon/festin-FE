import apiClient from './client';
import { Waiting } from '@/types';

export const waitingApi = {
  // 대기 등록
  async register(boothId: number): Promise<Waiting> {
    console.log('🔶 Registering for booth:', boothId);
    console.log('🔶 Request body:', { boothId });
    const response = await apiClient.post<Waiting>('/api/v1/waitings', { boothId });
    return response.data;
  },

  // 순번 조회
  async getPosition(boothId: number): Promise<Waiting> {
    const response = await apiClient.get<Waiting>(`/api/v1/waitings/booth/${boothId}`);
    return response.data;
  },

  // 내 대기 목록 조회 (TODO: 백엔드 API 구현 필요)
  async getMyWaitings(): Promise<Waiting[]> {
    const response = await apiClient.get<{ waitings: Waiting[] }>('/api/v1/waitings/my');
    return response.data.waitings;
  },

  // 대기 취소
  async cancel(boothId: number): Promise<void> {
    await apiClient.delete(`/api/v1/waitings/${boothId}`);
  },
};
