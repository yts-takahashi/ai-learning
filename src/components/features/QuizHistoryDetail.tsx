'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getQuizHistory, getStatsByLesson, type LessonQuizStat } from '@/lib/quizHistory';
import { getQuizRateTextColor, getQuizRateBarColor } from '@/lib/quizUtils';

interface QuizHistoryDetailProps {
  lessonTitleMap: Record<string, string>;
}

function formatRelativeDate(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return '今日';
  if (days === 1) return '昨日';
  if (days < 7) return `${days}日前`;
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const INITIAL_LIMIT = 6;

export default function QuizHistoryDetail({ lessonTitleMap }: QuizHistoryDetailProps) {
  const [stats, setStats] = useState<LessonQuizStat[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const history = getQuizHistory();
    setStats(getStatsByLesson(history));
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="w-10 h-4 bg-gray-200 rounded" />
              <div className="flex-1">
                <div className="h-4 w-48 bg-gray-200 rounded mb-1" />
                <div className="h-3 w-32 bg-gray-100 rounded" />
              </div>
              <div className="w-16 h-1.5 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stats.length === 0) return null;

  const visibleStats = showAll ? stats : stats.slice(0, INITIAL_LIMIT);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-bold text-lg mb-4">クイズ履歴（レッスン別）</h2>
      <div className="space-y-2">
        {visibleStats.map((s) => (
          <Link
            key={s.slug}
            href={`/lessons/${s.slug}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="w-10 flex-shrink-0 text-center">
              <span
                className={`text-sm font-bold ${getQuizRateTextColor(s.bestRate)}`}
              >
                {s.bestRate}%
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 truncate">
                {lessonTitleMap[s.slug] ?? s.slug}
              </p>
              <p className="text-xs text-gray-400">
                最高 {s.bestScore}/{s.total}問正解 · {s.attempts}回挑戦 · {formatRelativeDate(s.latestTimestamp)}
              </p>
            </div>
            <div className="w-16 flex-shrink-0">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getQuizRateBarColor(s.bestRate)}`}
                  style={{ width: `${s.bestRate}%` }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
      {stats.length > INITIAL_LIMIT && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 w-full text-xs text-gray-400 hover:text-blue-600 transition-colors py-1"
        >
          {showAll ? '折りたたむ' : `他 ${stats.length - INITIAL_LIMIT} 件を表示`}
        </button>
      )}
    </div>
  );
}
