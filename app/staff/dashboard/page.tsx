'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BoothStatusData, WaitingHistory } from '@/types';
import { boothApi } from '@/lib/api/booth';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { useAuthStore } from '@/lib/stores/authStore';
import CalledTimer from '@/components/staff/CalledTimer';

export default function StaffDashboardPage() {
  const router = useRouter();
  const { user, initAuth } = useAuthStore();

  const [boothStatus, setBoothStatus] = useState<BoothStatusData | null>(null);
  const [calledList, setCalledList] = useState<WaitingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);
  const [error, setError] = useState('');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    initAuth();
    setAuthChecked(true);
  }, [initAuth]);

  useEffect(() => {
    if (!authChecked) return;

    if (!user) {
      router.push('/auth/staff-login');
      return;
    }

    if (user.role !== 'STAFF') {
      router.push('/booths');
      return;
    }

    if (!user.boothId) {
      setError('담당 부스가 할당되지 않았습니다.');
      setLoading(false);
      return;
    }

    // 인증 완료 후 대시보드 로드
    loadDashboard();

    // 10초마다 자동 갱신
    const interval = setInterval(loadDashboard, 10000);
    return () => clearInterval(interval);
  }, [authChecked, user, router]);

  const loadDashboard = async () => {
    if (!user?.boothId) return;

    try {
      setLoading(true);
      const [statusData, calledData] = await Promise.all([
        boothApi.getBoothStatus(user.boothId),
        boothApi.getCalledList(user.boothId),
      ]);

      setBoothStatus(statusData);
      setCalledList(calledData);
      setError('');
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('대시보드 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async () => {
    if (!boothStatus || !user?.boothId) return;

    if (boothStatus.currentPeople >= boothStatus.capacity) {
      setError('부스 정원이 가득 찼습니다.');
      return;
    }

    if (boothStatus.totalWaiting === 0) {
      setError('대기 중인 사람이 없습니다.');
      return;
    }

    setCalling(true);
    setError('');

    try {
      await boothApi.callNext(user.boothId);
      await loadDashboard();
    } catch (err) {
      console.error('Failed to call next:', err);
      setError('호출에 실패했습니다.');
    } finally {
      setCalling(false);
    }
  };

  const handleConfirmEntrance = async (waitingId: number) => {
    if (!window.confirm('입장을 확인하시겠습니까?') || !user?.boothId) return;

    try {
      await boothApi.confirmEntrance(user.boothId, waitingId);
      await loadDashboard();
    } catch (err) {
      console.error('Failed to confirm entrance:', err);
      alert('입장 확인에 실패했습니다.');
    }
  };

  const handleCompleteExperience = async (waitingId: number) => {
    if (!window.confirm('체험 완료 처리하시겠습니까?') || !user?.boothId) return;

    try {
      await boothApi.completeExperience(user.boothId, waitingId);
      await loadDashboard();
    } catch (err) {
      console.error('Failed to complete experience:', err);
      alert('완료 처리에 실패했습니다.');
    }
  };

  if (loading) return <Loading />;

  if (!boothStatus) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-neutral-600">부스 정보를 불러오는데 실패했습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  const capacityPercent = (boothStatus.currentPeople / boothStatus.capacity) * 100;
  const isFull = boothStatus.currentPeople >= boothStatus.capacity;

  return (
    <div className="min-h-screen pb-20 bg-black">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">
            {boothStatus.boothName}
          </h2>
          <p className="text-neutral-500 mt-1">스태프 대시보드</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mb-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* 부스 현황 */}
        <Card className="mb-6">
          <h3 className="font-bold text-lg mb-4 text-white">부스 현황</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 bg-black rounded-lg border border-neutral-800">
              <div className="text-sm text-neutral-500 mb-1">현재 인원</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {boothStatus.currentPeople}
                <span className="text-lg text-neutral-600">
                  / {boothStatus.capacity}
                </span>
              </div>
            </div>

            <div className="text-center p-4 bg-black rounded-lg border border-neutral-800">
              <div className="text-sm text-neutral-500 mb-1">대기 인원</div>
              <div className="text-3xl font-bold text-white">
                {boothStatus.totalWaiting}
              </div>
              <div className="text-xs text-neutral-600">명</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2 text-neutral-400">
              <span>정원 현황</span>
              <span className="font-semibold text-white">
                {capacityPercent.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${isFull ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'
                  }`}
                style={{ width: `${Math.min(capacityPercent, 100)}%` }}
              />
            </div>
          </div>

          <Button
            fullWidth
            size="lg"
            onClick={handleCallNext}
            disabled={isFull || calling || boothStatus.totalWaiting === 0}
          >
            {calling ? '호출 중...' : '다음 사람 호출하기'}
          </Button>

          {isFull && (
            <p className="text-center text-sm text-red-400 mt-3">
              ● 정원이 가득 찼습니다. 체험 완료 후 호출하세요.
            </p>
          )}
        </Card>

        {/* 오늘 통계 */}
        <Card className="mb-6">
          <h3 className="font-bold text-lg mb-4 text-white">오늘 통계</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-black rounded-lg border border-neutral-800">
              <div className="text-xs text-neutral-500">총 호출</div>
              <div className="text-xl font-bold text-white">
                {boothStatus.todayStats.totalCalled}
              </div>
            </div>

            <div className="text-center p-3 bg-black rounded-lg border border-green-900">
              <div className="text-xs text-neutral-500">입장 확인</div>
              <div className="text-xl font-bold text-green-400">
                {boothStatus.todayStats.totalEntered}
              </div>
            </div>

            <div className="text-center p-3 bg-black rounded-lg border border-blue-900">
              <div className="text-xs text-neutral-500">완료</div>
              <div className="text-xl font-bold text-blue-400">
                {boothStatus.todayStats.totalCompleted}
              </div>
            </div>

            <div className="text-center p-3 bg-black rounded-lg border border-red-900">
              <div className="text-xs text-neutral-500">노쇼</div>
              <div className="text-xl font-bold text-red-400">
                {boothStatus.todayStats.totalNoShow}
              </div>
            </div>
          </div>
        </Card>

        {/* 호출된 사람 목록 */}
        <Card>
          <h3 className="font-bold text-lg mb-4 text-white">호출 대기 목록</h3>

          {calledList.length === 0 ? (
            <div className="text-center py-8 text-neutral-600">
              호출된 사람이 없습니다
            </div>
          ) : (
            <div className="space-y-3">
              {calledList.map((waiting) => {
                const isEntered = waiting.status === 'ENTERED';
                const remainingMin = waiting.remainingTime
                  ? Math.floor(waiting.remainingTime / 60)
                  : 0;

                return (
                  <div
                    key={waiting.waitingId}
                    className="border border-neutral-800 rounded-lg p-4 bg-black"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-white">
                          {waiting.nickname || `사용자 ${waiting.userId}`}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {waiting.position}번째 • {waiting.status === 'CALLED' ? '호출됨' : '입장함'}
                        </div>
                        {waiting.status === 'CALLED' && waiting.calledAt && (
                          <div className="text-xs mt-1">
                            <CalledTimer calledAt={waiting.calledAt} />
                          </div>
                        )}
                      </div>

                      <span
                        className={`text-xs px-2 py-1 rounded-full ${isEntered
                            ? 'bg-green-900/30 text-green-400 border border-green-800'
                            : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
                          }`}
                      >
                        {isEntered ? '입장 완료' : '호출됨'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {!isEntered && (
                        <Button
                          fullWidth
                          size="sm"
                          onClick={() => handleConfirmEntrance(waiting.waitingId)}
                        >
                          입장 확인
                        </Button>
                      )}

                      {isEntered && (
                        <Button
                          fullWidth
                          size="sm"
                          variant="secondary"
                          onClick={() => handleCompleteExperience(waiting.waitingId)}
                        >
                          체험 완료
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
