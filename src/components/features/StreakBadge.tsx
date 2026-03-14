'use client';

import { useEffect, useState } from 'react';
import { getStreakInfo, type StreakInfo } from '@/lib/streakTracker';

export default function StreakBadge() {
  const [info, setInfo] = useState<StreakInfo | null>(null);

  useEffect(() => {
    const s = getStreakInfo();
    if (s.best > 0) setInfo(s);
  }, []);

  if (!info) return null;

  const flame = info.current >= 7 ? '🔥' : info.current >= 3 ? '✨' : '📅';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-bold text-lg mb-4">学習ストリーク</h2>
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
          <p className={`text-xs font-medium ${info.studiedToday ? 'text-green-600' : 'text-gray-400'}`}>
            {info.studiedToday ? '✓ 今日の学習済み' : '今日はまだ学習していません'}
          </p>
        </div>
      </div>
    </div>
  );
}
