'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getQuizHistory, getStatsByLesson, type LessonQuizStat } from '@/lib/quizHistory';

interface QuizHistoryDetailProps {
  lessonTitleMap: Record<string, string>;
}

export default function QuizHistoryDetail({ lessonTitleMap }: QuizHistoryDetailProps) {
  const [stats, setStats] = useState<LessonQuizStat[]>([]);

  useEffect(() => {
    const history = getQuizHistory();
    setStats(getStatsByLesson(history));
  }, []);

  if (stats.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-bold text-lg mb-4">クイズ履歴（レッスン別）</h2>
      <div className="space-y-2">
        {stats.map((s) => (
          <Link
            key={s.slug}
            href={`/lessons/${s.slug}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="w-10 flex-shrink-0 text-center">
              <span
                className={`text-sm font-bold ${
                  s.bestRate >= 80 ? 'text-green-600' : s.bestRate >= 50 ? 'text-yellow-600' : 'text-red-500'
                }`}
              >
                {s.bestRate}%
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 truncate">
                {lessonTitleMap[s.slug] ?? s.slug}
              </p>
              <p className="text-xs text-gray-400">
                最高 {s.bestScore}/{s.total}問正解 · {s.attempts}回挑戦
              </p>
            </div>
            <div className="w-16 flex-shrink-0">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    s.bestRate >= 80 ? 'bg-green-500' : s.bestRate >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${s.bestRate}%` }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
