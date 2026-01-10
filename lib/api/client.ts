import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiError } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 요청 인터셉터: JWT 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const role = localStorage.getItem('userRole');

      console.log('🔵 API Request:', config.method?.toUpperCase(), config.url);
      console.log('🔵 Token:', token ? `${token.substring(0, 20)}...` : 'null');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (role === 'STAFF') {
        config.headers['X-Staff-Role'] = 'BOOTH_MANAGER';
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error: AxiosError<ApiError>) => {
    console.error('❌ API Error:', error.config?.method?.toUpperCase(), error.config?.url);
    console.error('❌ Status:', error.response?.status);
    console.error('❌ Response:', error.response?.data);

    const apiError: ApiError = error.response?.data || {
      status: error.response?.status || 500,
      code: 'UNKNOWN_ERROR',
      message: error.message || '알 수 없는 오류가 발생했습니다.',
    };

    // 401 Unauthorized: 로그아웃 처리
    if (apiError.status === 401) {
      console.error('⚠️⚠️⚠️ 401 Unauthorized Error ⚠️⚠️⚠️');
      console.error('URL:', error.config?.url);
      console.error('Method:', error.config?.method);
      console.error('Headers:', error.config?.headers);
      console.error('Request Data:', error.config?.data);
      console.error('Response:', error.response?.data);
      console.error('localStorage.userRole:', typeof window !== 'undefined' ? localStorage.getItem('userRole') : null);
      console.error('localStorage.accessToken:', typeof window !== 'undefined' ? localStorage.getItem('accessToken')?.substring(0, 30) + '...' : null);

      // 디버깅을 위해 리다이렉트 비활성화 (임시)
      // if (typeof window !== 'undefined') {
      //   const userRole = localStorage.getItem('userRole');
      //   localStorage.removeItem('accessToken');
      //   localStorage.removeItem('userId');
      //   localStorage.removeItem('nickname');
      //   localStorage.removeItem('userRole');

      //   // 스태프는 스태프 로그인으로, 일반 유저는 일반 로그인으로
      //   if (userRole === 'STAFF') {
      //     window.location.href = '/auth/staff-login';
      //   } else {
      //     window.location.href = '/auth/login';
      //   }
      // }
    }

    return Promise.reject(apiError);
  }
);

export default apiClient;
