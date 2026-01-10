'use client';

import { useAuthStore } from '@/lib/stores/authStore';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="bg-black border-b border-neutral-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Festin
          </h1>
          {user && user.role === 'STAFF' && (
            <span className="text-xs px-2 py-1 rounded-full bg-purple-900/30 text-purple-400 border border-purple-800">
              스태프
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && user && (
            <>
              <span className="text-sm text-neutral-400">
                {user.nickname || user.email.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-neutral-500 hover:text-white transition-colors"
              >
                로그아웃
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
