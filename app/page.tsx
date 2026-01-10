'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import Button from '@/components/ui/Button';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    // 이미 로그인된 경우 자동 리다이렉트
    if (isAuthenticated && user) {
      if (user.role === 'VISITOR') {
        router.push('/booths');
      } else {
        router.push('/staff/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-neutral-800 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-black">
      <div className="w-full max-w-md text-center">
        {/* 로고 */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            FESTIN
          </h1>
          <p className="text-neutral-400 text-lg">
            축제의 새로운 경험
          </p>
        </div>

        {/* 메인 액션 */}
        <div className="space-y-4">
          <Button
            fullWidth
            size="lg"
            onClick={() => router.push('/auth/login')}
          >
            로그인하고 시작하기
          </Button>

          {/* 스태프 링크 */}
          <button
            onClick={() => router.push('/auth/staff-login')}
            className="w-full text-sm text-neutral-500 hover:text-neutral-300 transition-colors py-2"
          >
            스태프이신가요? 여기를 클릭
          </button>
        </div>

        {/* 푸터 안내 */}
        <div className="mt-16 text-neutral-600 text-xs">
          <p>대학 축제 부스 대기열 관리 시스템</p>
        </div>
      </div>
    </div>
  );
}
