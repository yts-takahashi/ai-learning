'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { getQuizHistory, getStatsByLesson } from '@/lib/quizHistory';

interface WeakLessonsProps {
  lessonTitleMap: Record<string, string>;
}

export default function WeakLessons({ lessonTitleMap }: WeakLessonsProps) {
  const { weakLessons, hasAttempts, allPassed } = useMemo(() => {
    const history = getQuizHistory();
    const stats = getStatsByLesson(history);
    const has = stats.length > 0;
    const weak = stats
      .filter((s) => s.bestRate < 70)
      .sort((a, b) => a.bestRate - b.bestRate)
      .slice(0, 5);
    return { weakLessons: weak, hasAttempts: has, allPassed: has && weak.length === 0 };
  }, []);

  if (!hasAttempts) return null;

  if (allPassed) {
    return (
      <div className="bg-green-50 rounded-xl border border-green-200 p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-green-800">クイズ全問70%以上達成！</p>
            <p className="text-sm text-green-600">挑戦したすべてのレッスンで良いスコアを出しています。</p>
          </div>
        </div>
      </div>
    );
  }

  if (weakLessons.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-orange-200 p-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="font-bold text-lg">復習が必要なレッスン</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">クイズ正答率が70%未満のレッスンです。もう一度取り組んで理解を深めましょう。</p>
      <div className="space-y-2">
        {weakLessons.map((lesson) => (
          <Link
            key={lesson.slug}
            href={`/lessons/${lesson.slug}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors group border border-transparent hover:border-orange-100"
          >
            <span className={`w-12 text-center text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
              lesson.bestRate < 40
                ? 'bg-red-100 text-red-600'
                : 'bg-orange-100 text-orange-600'
            }`}>
              {lesson.bestRate}%
            </span>
            <span className="text-sm text-gray-700 group-hover:text-orange-700 transition-colors flex-1 truncate">
              {lessonTitleMap[lesson.slug] ?? lesson.slug}
            </span>
            <span className="text-xs text-gray-400 flex-shrink-0 group-hover:text-orange-500 transition-colors">
              復習する →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
