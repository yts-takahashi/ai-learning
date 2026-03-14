'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSessions } from '@/lib/sessionHistory';

const STORAGE_KEY = 'weekly-goal';
const DEFAULT_GOAL = 5;

function getThisWeekData(): { count: number; slugs: string[] } {
  const sessions = getSessions();
  const now = new Date();
  const startOfWeek = new Date(now);
  // 月曜日起点
  const day = now.getDay(); // 0=sun
  const diff = day === 0 ? 6 : day - 1;
  startOfWeek.setDate(now.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const slugsThisWeek = Array.from(
    new Set(
      sessions
        .filter((s) => s.timestamp >= startOfWeek.getTime())
        .map((s) => s.slug),
    ),
  );
  return { count: slugsThisWeek.length, slugs: slugsThisWeek };
}

function loadGoal(): number {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? parseInt(v, 10) : DEFAULT_GOAL;
  } catch {
    return DEFAULT_GOAL;
  }
}

interface WeeklyGoalProps {
  lessonTitleMap?: Record<string, string>;
}

export default function WeeklyGoal({ lessonTitleMap = {} }: WeeklyGoalProps) {
  const [goal, setGoal] = useState<number>(DEFAULT_GOAL);
  const [thisWeek, setThisWeek] = useState<number>(0);
  const [weekSlugs, setWeekSlugs] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState<string>(String(DEFAULT_GOAL));

  useEffect(() => {
    const g = loadGoal();
    setGoal(g);
    setInputVal(String(g));
    const { count, slugs } = getThisWeekData();
    setThisWeek(count);
    setWeekSlugs(slugs);
  }, []);

  const saveGoal = useCallback(() => {
    const v = Math.max(1, Math.min(50, parseInt(inputVal, 10) || DEFAULT_GOAL));
    setGoal(v);
    setInputVal(String(v));
    try {
      localStorage.setItem(STORAGE_KEY, String(v));
    } catch {
      // ignore
    }
    setEditing(false);
  }, [inputVal]);

  const pct = Math.min(100, Math.round((thisWeek / goal) * 100));
  const achieved = thisWeek >= goal;

  return (
    <div className={`rounded-xl border p-6 ${achieved ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-lg">今週の学習目標</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
            aria-label="目標を編集"
          >
            目標を変更
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-600">週に</span>
          <input
            type="number"
            min={1}
            max={50}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveGoal()}
            className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:border-blue-400"
            placeholder={String(DEFAULT_GOAL)}
            aria-label="週次目標レッスン数"
            autoFocus
          />
          <span className="text-sm text-gray-600">レッスン</span>
          <button
            onClick={saveGoal}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
          >
            保存
          </button>
          <button
            onClick={() => { setEditing(false); setInputVal(String(goal)); }}
            className="px-3 py-1 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-3">
          {achieved
            ? `今週の目標 ${goal} レッスンを達成しました！`
            : `今週の目標: ${goal} レッスン`}
        </p>
      )}

      <div className="flex items-end gap-3 mb-3">
        <span className="text-3xl font-bold text-blue-600">{thisWeek}</span>
        <span className="text-gray-400 text-sm mb-1">/ {goal} レッスン</span>
        {achieved && (
          <span className="mb-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
            達成
          </span>
        )}
      </div>

      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all ${achieved ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={thisWeek}
          aria-valuemin={0}
          aria-valuemax={goal}
        />
      </div>

      {weekSlugs.length > 0 && (
        <div className="space-y-1">
          {weekSlugs.map((slug) => (
            <div key={slug} className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              <span className="truncate">{lessonTitleMap[slug] ?? slug}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
