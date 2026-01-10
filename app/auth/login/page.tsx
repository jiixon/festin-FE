'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { authApi } from '@/lib/api/auth';
import { initializeFCM } from '@/lib/fcm';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('이메일을 입력해주세요');
      return;
    }

    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요');
      return;
    }

    // 간단한 이메일 검증
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('올바른 이메일 형식이 아닙니다');
      return;
    }

    setLoading(true);

    try {
      const user = await authApi.simpleLogin(email.trim(), nickname.trim(), 'VISITOR');
      console.log('Login success:', user);
      console.log('AccessToken:', user.accessToken);
      setUser(user);

      // FCM 초기화 (백그라운드에서 실행, 실패해도 로그인은 진행)
      initializeFCM().catch((err) => {
        console.error('FCM initialization failed:', err);
      });

      router.push('/booths');
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError('로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* 헤더 */}
      <header className="p-4">
        <button
          onClick={() => router.back()}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          ← Festin
        </button>
      </header>

      {/* 메인 */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              시작하기
            </h2>
            <p className="text-neutral-500">
              이메일과 닉네임으로 간편하게 시작하세요
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              autoComplete="email"
              autoFocus
            />

            <Input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임"
              autoComplete="name"
            />

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={loading}
            >
              {loading ? '시작 중...' : '시작하기'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-neutral-600">
            이미 계정이 있으면 로그인, 없으면 자동으로 가입됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
