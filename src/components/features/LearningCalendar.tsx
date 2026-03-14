'use client';

import { useMemo } from 'react';
import { getSessions } from '@/lib/sessionHistory';

function toDateKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(dateKey: string): string {
  const [, m, d] = dateKey.split('-');
  return `${parseInt(m)}/${parseInt(d)}`;
}

export default function LearningCalendar() {
  const { days, maxCount, totalActiveDays } = useMemo(() => {
    const sessions = getSessions();
    const countByDay: Record<string, number> = {};
    sessions.forEach((s) => {
      const key = toDateKey(s.timestamp);
      countByDay[key] = (countByDay[key] ?? 0) + 1;
    });

    const result: { key: string; count: number }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = toDateKey(d.getTime());
      result.push({ key, count: countByDay[key] ?? 0 });
    }

    const max = Math.max(...result.map((d) => d.count), 1);
    const active = result.filter((d) => d.count > 0).length;
    return { days: result, maxCount: max, totalActiveDays: active };
  }, []);

  if (totalActiveDays === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-bold text-lg mb-3">学習カレンダー</h2>
        <p className="text-sm text-gray-400 text-center py-4">学習を始めるとここに記録されます</p>
      </div>
    );
  }

  function cellColor(count: number): string {
    if (count === 0) return 'bg-gray-100';
    const ratio = count / maxCount;
    if (ratio < 0.25) return 'bg-blue-200';
    if (ratio < 0.5) return 'bg-blue-400';
    if (ratio < 0.75) return 'bg-blue-500';
    return 'bg-blue-700';
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">学習カレンダー</h2>
        <span className="text-sm text-gray-500">過去30日間 · {totalActiveDays}日学習</span>
      </div>

      <div className="flex gap-1 flex-wrap">
        {days.map((day) => (
          <div
            key={day.key}
            title={`${formatDate(day.key)}: ${day.count}セッション`}
            className={`w-6 h-6 rounded-sm ${cellColor(day.count)} transition-colors`}
            aria-label={`${formatDate(day.key)}: ${day.count}セッション`}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-gray-400">少</span>
        <div className="flex gap-1">
          {['bg-gray-100', 'bg-blue-200', 'bg-blue-400', 'bg-blue-500', 'bg-blue-700'].map((cls) => (
            <div key={cls} className={`w-4 h-4 rounded-sm ${cls}`} />
          ))}
        </div>
        <span className="text-xs text-gray-400">多</span>
      </div>
    </div>
  );
}
