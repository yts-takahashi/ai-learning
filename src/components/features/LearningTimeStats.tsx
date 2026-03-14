'use client';

import { useEffect, useState } from 'react';
import { getSessions, getTotalStats } from '@/lib/sessionHistory';

export default function LearningTimeStats() {
  const [stats, setStats] = useState<ReturnType<typeof getTotalStats> | null>(null);
  const [todayMinutes, setTodayMinutes] = useState(0);

  useEffect(() => {
    const sessions = getSessions();
    const s = getTotalStats(sessions);
    if (s.sessionCount > 0) setStats(s);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySec = sessions
      .filter((s) => s.timestamp >= today.getTime())
      .reduce((sum, s) => sum + s.duration, 0);
    setTodayMinutes(Math.round(todaySec / 60));
  }, []);

  if (!stats) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-bold text-lg mb-4">学習時間</h2>
      {todayMinutes > 0 && (
        <div className="bg-blue-50 rounded-lg px-4 py-3 mb-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-blue-500">本日の学習時間</p>
            <p className="text-lg font-bold text-blue-700">{todayMinutes} 分</p>
          </div>
        </div>
      )}
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
