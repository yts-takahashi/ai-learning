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

  // アイコン種別の決定（7日以上: 炎, 3日以上: 星, それ以下: カレンダー）
  const iconType = info.current >= 7 ? 'fire' : info.current >= 3 ? 'star' : 'calendar';

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
          <div className="flex items-center justify-center mb-1">
            {iconType === 'fire' && (
              <svg className="w-10 h-10 text-orange-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2c0 0-4 5-4 9a4 4 0 008 0c0-4-4-9-4-9zm0 13a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            )}
            {iconType === 'star' && (
              <svg className="w-10 h-10 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
            {iconType === 'calendar' && (
              <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
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
          <p className={`text-xs font-medium flex items-center gap-1 ${info.studiedToday ? 'text-green-600' : 'text-blue-500'}`}>
            {info.studiedToday ? (
              <>
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                今日の学習済み
              </>
            ) : '今日の学習をはじめよう！'}
          </p>
        </div>
      </div>
    </div>
  );
}
