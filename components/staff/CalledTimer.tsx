'use client';

import { useState, useEffect } from 'react';

interface CalledTimerProps {
    calledAt: string; // ISO 8601 format
    limitMinutes?: number;
}

export default function CalledTimer({ calledAt, limitMinutes = 5 }: CalledTimerProps) {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const calledTime = new Date(calledAt).getTime();
            const now = new Date().getTime();
            const limitMs = limitMinutes * 60 * 1000;
            const diff = Math.max(0, Math.floor((calledTime + limitMs - now) / 1000));
            return diff;
        };

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [calledAt, limitMinutes]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    if (timeLeft <= 0) {
        return <span className="text-red-500 font-bold">● 시간 종료 (노쇼)</span>;
    }

    return (
        <span className="text-orange-400 font-medium">
            ● {minutes}분 {seconds}초 남음
        </span>
    );
}
