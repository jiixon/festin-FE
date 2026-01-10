import apiClient from './client';
import { User, UserRole } from '@/types';

interface LoginResponse {
  accessToken: string;
  userId: number;
  email: string;
  nickname: string;
  role: UserRole;
  boothId?: number; // STAFF인 경우 관리하는 부스 ID
  managedBoothId?: number; // 백엔드에서 이 이름으로 올 수도 있음
}

export const authApi = {
  // 간단 로그인 (자동 회원가입)
  async simpleLogin(
    email: string,
    nickname: string,
    role: UserRole,
    managedBoothId?: number
  ): Promise<User> {
    const requestBody: {
      email: string;
      nickname: string;
      role: UserRole;
      managedBoothId?: number;
    } = {
      email,
      nickname,
      role,
    };

    if (managedBoothId !== undefined) {
      requestBody.managedBoothId = managedBoothId;
    }

    const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', requestBody);

    return {
      userId: response.data.userId,
      email: response.data.email,
      nickname: response.data.nickname,
      role: response.data.role,
      accessToken: response.data.accessToken,
      boothId: response.data.boothId || response.data.managedBoothId, // STAFF인 경우 부스 ID 포함
    };
  },

  // 로그아웃
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('email');
      localStorage.removeItem('nickname');
      localStorage.removeItem('userRole');
    }
  },

  // FCM 토큰 등록
  async registerFcmToken(fcmToken: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>('/api/v1/users/fcm-token', {
      fcmToken,
    });
    return response.data;
  },
};
