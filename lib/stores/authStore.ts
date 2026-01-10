import { create } from 'zustand';
import { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', user.accessToken);
      localStorage.setItem('userId', String(user.userId));
      localStorage.setItem('email', user.email);
      if (user.nickname) localStorage.setItem('nickname', user.nickname);
      localStorage.setItem('userRole', user.role);
      if (user.boothId) localStorage.setItem('boothId', String(user.boothId));
    }
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('email');
      localStorage.removeItem('nickname');
      localStorage.removeItem('userRole');
      localStorage.removeItem('boothId');
    }
    set({ user: null, isAuthenticated: false });
  },

  initAuth: () => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
      const email = localStorage.getItem('email');
      const nickname = localStorage.getItem('nickname');
      const userRole = localStorage.getItem('userRole');
      const boothId = localStorage.getItem('boothId');

      if (accessToken && userId && email && userRole) {
        set({
          user: {
            userId: Number(userId),
            email,
            nickname: nickname || undefined,
            role: userRole as UserRole,
            accessToken,
            boothId: boothId ? Number(boothId) : undefined,
          },
          isAuthenticated: true,
        });
      }
    }
  },
}));
