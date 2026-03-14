'use client';

import { useEffect, useState } from 'react';
import { getSessions, getTotalStats } from '@/lib/sessionHistory';

export default function LearningTimeStats() {
  const [stats, setStats] = useState<ReturnType<typeof getTotalStats> | null>(null);

  useEffect(() => {
    const sessions = getSessions();
    const s = getTotalStats(sessions);
    if (s.sessionCount > 0) setStats(s);
  }, []);

  if (!stats) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-bold text-lg mb-4">学習時間</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.totalMinutes}</p>
          <p className="text-xs text-gray-500 mt-1">累計分</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-800">{stats.sessionCount}</p>
          <p className="text-xs text-gray-500 mt-1">セッション数</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-800">{stats.avgMinutesPerSession}</p>
          <p className="text-xs text-gray-500 mt-1">平均分/回</p>
        </div>
      </div>
    </div>
  );
}
