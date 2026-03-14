'use client';

import { useEffect, useState } from 'react';
import { getStreakInfo, type StreakInfo } from '@/lib/streakTracker';
import { Skeleton } from '@/components/ui/Skeleton';

export default function StreakBadge() {
  const [info, setInfo] = useState<StreakInfo | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const s = getStreakInfo();
    if (s.best > 0) setInfo(s);
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="flex items-center gap-6">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!info) return null;

  const flame = info.current >= 7 ? '🔥' : info.current >= 3 ? '✨' : '📅';

  function getMilestoneMessage(streak: number): string | null {
    if (streak === 30) return '30日連続達成！驚異的な継続力です！';
    if (streak === 7) return '1週間連続達成！習慣化できていますね！';
    if (streak === 3) return '3日連続達成！いいペースです！';
    return null;
  }
  const milestoneMessage = getMilestoneMessage(info.current);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-bold text-lg mb-4">学習ストリーク</h2>
      {milestoneMessage && (
        <div className="mb-4 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-xs font-semibold text-orange-700">
          {milestoneMessage}
        </div>
      )}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-4xl mb-1">{flame}</div>
          <p className="text-3xl font-bold text-orange-500">{info.current}</p>
          <p className="text-xs text-gray-500 mt-1">現在の連続日数</p>
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>最高記録</span>
              <span className="font-semibold text-gray-700">{info.best}日</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, (info.current / Math.max(info.best, 1)) * 100)}%` }}
              />
            </div>
          </div>
          <p className={`text-xs font-medium ${info.studiedToday ? 'text-green-600' : 'text-blue-500'}`}>
            {info.studiedToday ? '✓ 今日の学習済み' : '今日の学習をはじめよう！'}
          </p>
        </div>
      </div>
    </div>
  );
}
