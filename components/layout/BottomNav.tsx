'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useAuthStore } from '@/lib/stores/authStore';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  if (!user) return null;

  const visitorNav = [
    { href: '/booths', label: '부스 목록', icon: '●' },
    { href: '/my-waitings', label: '내 대기', icon: '○' },
  ];

  const staffNav = [
    { href: '/staff/dashboard', label: '대시보드', icon: '●' },
  ];

  const navItems = user.role === 'VISITOR' ? visitorNav : staffNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-neutral-800 z-50">
      <div className="max-w-7xl mx-auto px-4 flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center gap-1 py-3 px-6 transition-colors relative',
                isActive
                  ? 'text-white'
                  : 'text-neutral-600 hover:text-neutral-400'
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-b-full" />
              )}
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
