'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Waiting } from '@/types';
import { waitingApi } from '@/lib/api/waiting';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';

export default function WaitingPage({ params }: { params: Promise<{ boothId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const boothId = Number(resolvedParams.boothId);

  const [waiting, setWaiting] = useState<Waiting | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // 동적 폴링 주기 계산 (순번에 따라)
  const getPollingInterval = (position: number): number => {
    if (position <= 5) return 5000; // 5초
    if (position <= 20) return 10000; // 10초
    if (position <= 50) return 20000; // 20초
    return 30000; // 30초
  };

  const loadPosition = useCallback(async () => {
    try {
      const waitings = await waitingApi.getMyWaitings();
      const myWaiting = waitings.find(w => w.boothId === boothId);

      if (!myWaiting) {
        // 대기 정보가 없으면 완료되었거나 취소된 것으로 간주
        // "내 대기 목록"으로 리다이렉트
        router.push('/my-waitings');
        return;
      }

      setWaiting(myWaiting);
      setLastUpdate(new Date());
      setError('');
      setLoading(false);
    } catch (err) {
      console.error('Failed to load position:', err);
      setError('대기 정보를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  }, [boothId, router]);

  useEffect(() => {
    loadPosition();
  }, [loadPosition]);

  // 동적 폴링
  useEffect(() => {
    if (!waiting) return;

    const interval = getPollingInterval(waiting.position);
    const timer = setInterval(loadPosition, interval);

    return () => clearInterval(timer);
  }, [waiting, loadPosition]);

  const handleCancel = async () => {
    if (!window.confirm('정말 대기를 취소하시겠습니까?')) return;

    setCanceling(true);

    try {
      await waitingApi.cancel(boothId);
      router.push('/my-waitings');
    } catch (err) {
      console.error('Failed to cancel waiting:', err);
      alert('대기 취소에 실패했습니다.');
      setCanceling(false);
    }
  };

  if (loading) return <Loading />;

  if (error || !waiting) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-neutral-600">{error || '대기 정보를 찾을 수 없습니다.'}</p>
            <Button onClick={() => router.push('/booths')} variant="ghost" className="mt-4">
              부스 목록으로
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const pollingInterval = getPollingInterval(waiting.position);
  const isNearTurn = waiting.position <= 5;
  const isCalled = waiting.status === 'CALLED';
  const isEntered = waiting.status === 'ENTERED';

  return (
    <div className="min-h-screen pb-20 bg-black">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="text-neutral-400 hover:text-white mb-6 flex items-center gap-1"
        >
          ← 돌아가기
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {waiting.boothName}
          </h2>
          <p className="text-sm text-neutral-500">
            마지막 업데이트: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>

        <Card className="mb-6">
          {/* 호출됨 상태 */}
          {isCalled && (
            <div className="text-center mb-8">
              <div className="mb-6">
                <span className="text-7xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  입장
                </span>
              </div>
              <p className="text-2xl font-bold text-green-400 mb-4">🎉 호출되었습니다!</p>
              <p className="text-neutral-400">부스로 이동하여 입장해주세요</p>
              <p className="text-sm text-orange-400 mt-2">5분 이내 입장하지 않으면 노쇼 처리됩니다</p>
            </div>
          )}

          {/* 입장 완료 상태 */}
          {isEntered && (
            <div className="text-center mb-8">
              <div className="mb-6">
                <span className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  체험중
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-400 mb-4">✨ 입장 완료!</p>
              <p className="text-neutral-400">부스 체험을 즐기세요</p>
            </div>
          )}

          {/* 대기 중 상태 */}
          {!isCalled && !isEntered && (
            <>
              <div className="text-center mb-8">
                <div className="mb-6">
                  <span className="text-7xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {waiting.position}
                  </span>
                  <span className="text-2xl text-neutral-400 ml-2">번째</span>
                </div>
                <p className="text-neutral-500">내 순번</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-black rounded-lg border border-neutral-800">
                  <div className="text-sm text-neutral-500 mb-1">전체 대기</div>
                  <div className="text-2xl font-bold text-white">
                    {waiting.totalWaiting}
                  </div>
                  <div className="text-xs text-neutral-600">명</div>
                </div>

                <div className="text-center p-4 bg-black rounded-lg border border-neutral-800">
                  <div className="text-sm text-neutral-500 mb-1">예상 대기</div>
                  <div className="text-2xl font-bold text-white">
                    {waiting.estimatedWaitTime}
                  </div>
                  <div className="text-xs text-neutral-600">분</div>
                </div>
              </div>
            </>
          )}

          {isNearTurn && !isCalled && !isEntered && (
            <div className="bg-orange-900/30 border border-orange-800 rounded-lg p-4 mb-6">
              <p className="text-orange-400 font-semibold text-center">
                ● 곧 차례입니다! 부스 근처에서 대기해주세요
              </p>
            </div>
          )}

          <div className="text-center text-xs text-neutral-600 mb-6">
            자동 갱신 중 (약 {pollingInterval / 1000}초마다)
          </div>

          <div className="space-y-3">
            <Button
              fullWidth
              variant="secondary"
              onClick={loadPosition}
            >
              수동 새로고침
            </Button>

            <Button
              fullWidth
              variant="danger"
              onClick={handleCancel}
              disabled={canceling}
            >
              {canceling ? '취소 중...' : '대기 취소하기'}
            </Button>
          </div>
        </Card>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <h3 className="font-semibold text-white mb-2">안내사항</h3>
          <ul className="text-sm text-neutral-400 space-y-1">
            <li>• 순번은 자동으로 갱신됩니다</li>
            <li>• 호출 시 푸시 알림이 발송됩니다</li>
            <li>• 호출 후 5분 이내 입장하지 않으면 노쇼 처리됩니다</li>
            <li>• 다른 부스를 둘러보셔도 됩니다</li>
          </ul>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
