'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Booth } from '@/types';
import { boothApi } from '@/lib/api/booth';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import { useAuthStore } from '@/lib/stores/authStore';

export default function BoothsPage() {
  const router = useRouter();
  const { user, initAuth } = useAuthStore();
  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (user && user.role !== 'VISITOR') {
      router.push('/staff/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    const loadBooths = async () => {
      try {
        setLoading(true);
        console.log('Loading booths...');
        console.log('AccessToken in localStorage:', localStorage.getItem('accessToken'));
        console.log('User from store:', user);
        const data = await boothApi.getBooths();
        setBooths(data);
      } catch (err) {
        console.error('Failed to load booths:', err);
        setBooths([]);
      } finally {
        setLoading(false);
      }
    };

    loadBooths();
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen pb-20 bg-black">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">부스 목록</h2>
          <p className="text-neutral-500 mt-1">원하는 부스를 선택해 대기하세요</p>
        </div>

        <div className="grid gap-3">
          {booths.map((booth) => {
            const isOpen = booth.status === 'OPEN';
            const isBusy = booth.totalWaiting > 50;

            return (
              <Card
                key={booth.boothId}
                hover={isOpen}
                onClick={() => isOpen && router.push(`/booths/${booth.boothId}`)}
                className={!isOpen ? 'opacity-50' : ''}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white">
                        {booth.boothName}
                      </h3>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOpen ? 'bg-green-500' : 'bg-neutral-700'
                        }`}
                      />
                    </div>

                    {booth.description && (
                      <p className="text-sm text-neutral-400 mb-3">
                        {booth.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-neutral-500">
                        대기 <span className={isBusy ? 'text-orange-500 font-semibold' : 'text-white'}>{booth.totalWaiting}</span>명
                      </span>
                      <span className="text-neutral-600">·</span>
                      <span className="text-neutral-500">
                        약 <span className="text-white">{booth.estimatedWaitTime}</span>분
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        isOpen
                          ? 'bg-green-900/30 text-green-400 border border-green-800'
                          : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                      }`}
                    >
                      {isOpen ? '운영 중' : '마감'}
                    </span>
                    {isOpen && isBusy && (
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-900/30 text-orange-400 border border-orange-800">
                        혼잡
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          {booths.length === 0 && (
            <div className="text-center py-16">
              <p className="text-neutral-600">현재 등록된 부스가 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
