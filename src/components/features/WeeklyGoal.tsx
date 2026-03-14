'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSessions } from '@/lib/sessionHistory';

const STORAGE_KEY = 'weekly-goal';
const DEFAULT_GOAL = 5;

function getThisWeekCount(): number {
  const sessions = getSessions();
  const now = new Date();
  const startOfWeek = new Date(now);
  // 月曜日起点
  const day = now.getDay(); // 0=sun
  const diff = day === 0 ? 6 : day - 1;
  startOfWeek.setDate(now.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const slugsThisWeek = new Set(
    sessions
      .filter((s) => s.timestamp >= startOfWeek.getTime())
      .map((s) => s.slug),
  );
  return slugsThisWeek.size;
}

function loadGoal(): number {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? parseInt(v, 10) : DEFAULT_GOAL;
  } catch {
    return DEFAULT_GOAL;
  }
}

export default function WeeklyGoal() {
  const [goal, setGoal] = useState<number>(DEFAULT_GOAL);
  const [thisWeek, setThisWeek] = useState<number>(0);
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState<string>(String(DEFAULT_GOAL));

  useEffect(() => {
    const g = loadGoal();
    setGoal(g);
    setInputVal(String(g));
    setThisWeek(getThisWeekCount());
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
    <div className={`bg-white rounded-xl border p-6 ${achieved ? 'border-green-300' : 'border-gray-200'}`}>
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

      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${achieved ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={thisWeek}
          aria-valuemin={0}
          aria-valuemax={goal}
        />
      </div>
    </div>
  );
}
