'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    // 회원가입이 자동이므로 로그인 페이지로 리다이렉트
    router.replace('/auth/login');
  }, [router]);

  return null;
}
