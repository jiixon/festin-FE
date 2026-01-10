'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Booth } from '@/types';
import { boothApi } from '@/lib/api/booth';
import { waitingApi } from '@/lib/api/waiting';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';

export default function BoothDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const boothId = Number(resolvedParams.id);

  const [booth, setBooth] = useState<Booth | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const loadBooth = async () => {
      try {
        setLoading(true);
        const data = await boothApi.getBoothDetail(boothId);
        setBooth(data);
      } catch (err) {
        console.error('Failed to load booth:', err);
        setBooth(null);
      } finally {
        setLoading(false);
      }
    };

    loadBooth();
  }, [boothId]);

  const handleRegister = async () => {
    if (!booth) return;

    setRegistering(true);

    try {
      await waitingApi.register(boothId);
      router.push(`/waiting/${boothId}`);
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);

      const errorMessage = err.response?.data?.message || err.message || '대기 등록에 실패했습니다.';
      alert(errorMessage);
      setRegistering(false);
    }
  };

  if (loading) return <Loading />;

  if (!booth) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-neutral-600">부스 정보를 찾을 수 없습니다.</p>
            <Button onClick={() => router.back()} variant="ghost" className="mt-4">
              돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isOpen = booth.status === 'OPEN';
  const isBusy = booth.totalWaiting > 50;

  return (
    <div className="min-h-screen pb-6 bg-black">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="text-neutral-400 hover:text-white mb-6 flex items-center gap-1"
        >
          ← 돌아가기
        </button>

        <Card className="mb-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h1 className="text-3xl font-bold text-white">
                {booth.boothName}
              </h1>
              <span
                className={`w-3 h-3 rounded-full ${
                  isOpen ? 'bg-green-500' : 'bg-neutral-700'
                }`}
              />
            </div>

            {booth.description && (
              <p className="text-neutral-400 text-lg mb-4">
                {booth.description}
              </p>
            )}

            <div className="flex items-center gap-2">
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

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-black rounded-lg border border-neutral-800">
              <div className="text-sm text-neutral-500 mb-1">대기 인원</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {booth.totalWaiting}
              </div>
              <div className="text-xs text-neutral-600">명</div>
            </div>

            <div className="text-center p-4 bg-black rounded-lg border border-neutral-800">
              <div className="text-sm text-neutral-500 mb-1">예상 대기</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {booth.estimatedWaitTime}
              </div>
              <div className="text-xs text-neutral-600">분</div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-neutral-400 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-neutral-600">●</span>
              <span>{booth.universityName}</span>
            </div>
            {booth.capacity && (
              <div className="flex items-center gap-2">
                <span className="text-neutral-600">●</span>
                <span>최대 수용: {booth.capacity}명</span>
              </div>
            )}
          </div>

          <Button
            fullWidth
            size="lg"
            onClick={handleRegister}
            disabled={!isOpen || registering}
          >
            {registering ? '등록 중...' : '대기 등록하기'}
          </Button>

          {!isOpen && (
            <p className="text-center text-sm text-neutral-600 mt-3">
              현재 운영 중이 아닙니다
            </p>
          )}
        </Card>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <h3 className="font-semibold text-white mb-2">안내사항</h3>
          <ul className="text-sm text-neutral-400 space-y-1">
            <li>• 최대 2개 부스까지 동시 대기 가능</li>
            <li>• 호출 시 푸시 알림 발송</li>
            <li>• 호출 후 5분 이내 미입장 시 자동 노쇼 처리</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
