'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Waiting } from '@/types';
import { waitingApi } from '@/lib/api/waiting';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';

export default function MyWaitingsPage() {
  const router = useRouter();
  const [waitings, setWaitings] = useState<Waiting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMyWaitings();
  }, []);

  const loadMyWaitings = async () => {
    try {
      setLoading(true);
      const data = await waitingApi.getMyWaitings();
      setWaitings(data);
      setError('');
    } catch (err) {
      console.error('Failed to load my waitings:', err);
      setError('내 대기 목록을 불러오는데 실패했습니다.');
      setWaitings([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen pb-20 bg-black">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">내 대기 목록</h2>
          <p className="text-neutral-500 mt-1">
            현재 대기 중인 부스 (최대 2개)
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mb-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="grid gap-4 mb-6">
          {waitings.map((waiting) => {
            const isNearTurn = waiting.position <= 5;

            return (
              <Card
                key={waiting.boothId}
                hover
                onClick={() => router.push(`/waiting/${waiting.boothId}`)}
                className={isNearTurn ? 'border-2 border-orange-600' : ''}
              >
                {isNearTurn && (
                  <div className="bg-orange-900/30 text-orange-400 text-xs font-semibold px-3 py-1.5 rounded mb-3 inline-block border border-orange-800">
                    ● 곧 차례입니다!
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-3">
                      {waiting.boothName}
                    </h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {waiting.position}
                        </span>
                        <span className="text-neutral-400">번째 대기 중</span>
                      </div>

                      <div className="flex items-center gap-4 text-neutral-500">
                        <span>전체 <span className="text-white">{waiting.totalWaiting}</span>명</span>
                        <span className="text-neutral-700">·</span>
                        <span>약 <span className="text-white">{waiting.estimatedWaitTime}</span>분</span>
                      </div>

                      <p className="text-xs text-neutral-600">
                        등록: {new Date(waiting.registeredAt).toLocaleString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl">
                      {isNearTurn ? '○' : '●'}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}

          {waitings.length === 0 && !error && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 text-neutral-700">○</div>
              <p className="text-neutral-500 mb-6">
                현재 대기 중인 부스가 없습니다
              </p>
              <Button onClick={() => router.push('/booths')}>
                부스 둘러보기
              </Button>
            </div>
          )}

          {waitings.length > 0 && waitings.length < 2 && (
            <Button
              fullWidth
              variant="ghost"
              onClick={() => router.push('/booths')}
            >
              + 다른 부스 추가하기 ({waitings.length}/2)
            </Button>
          )}
        </div>

        {waitings.length > 0 && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">안내사항</h3>
            <ul className="text-sm text-neutral-400 space-y-1">
              <li>• 카드를 터치하여 실시간 순번을 확인하세요</li>
              <li>• 호출 시 푸시 알림이 발송됩니다</li>
              <li>• 최대 2개 부스까지 동시 대기 가능합니다</li>
            </ul>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
