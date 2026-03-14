'use client';

import { useProgress } from '@/hooks/useProgress';
import { getSessions } from '@/lib/sessionHistory';
import { getQuizHistory } from '@/lib/quizHistory';
import { useMemo } from 'react';

interface ChapterInfo {
  number: number;
  title: string;
  slugs: string[];
}

interface LearningInsightsProps {
  chapters: ChapterInfo[];
}

export default function LearningInsights({ chapters }: LearningInsightsProps) {
  const { completedSlugs, isLoaded } = useProgress();

  const insights = useMemo(() => {
    if (!isLoaded) return [];
    const sessions = getSessions();
    const quizHistory = getQuizHistory();

    return chapters.map((ch) => {
      const completed = ch.slugs.filter((s) => completedSlugs.has(s)).length;
      const total = ch.slugs.length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      const totalMinutes = Math.round(
        sessions.filter((s) => ch.slugs.includes(s.slug)).reduce((sum, s) => sum + s.duration, 0) / 60,
      );

      const quizRates = ch.slugs
        .filter((slug) => quizHistory[slug]?.length)
        .map((slug) => {
          const attempts = quizHistory[slug];
          const best = attempts.reduce((max, a) => (a.score > max.score ? a : max), attempts[0]);
          return Math.round((best.score / best.total) * 100);
        });
      const avgQuizRate = quizRates.length > 0 ? Math.round(quizRates.reduce((s, r) => s + r, 0) / quizRates.length) : null;

      return { number: ch.number, title: ch.title, total, completed, completionRate, totalMinutes, avgQuizRate };
    });
  }, [chapters, completedSlugs, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-56 bg-gray-100 rounded mb-5" />
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="flex justify-between mb-1.5">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-4 w-20 bg-gray-100 rounded" />
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeChapters = insights.filter((ch) => ch.completed > 0 || ch.avgQuizRate !== null);
  if (activeChapters.length === 0) return null;

  function completionColor(rate: number) {
    if (rate === 100) return 'bg-green-500';
    if (rate >= 50) return 'bg-blue-500';
    return 'bg-gray-300';
  }

  function quizColor(rate: number) {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-500';
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-bold text-lg mb-1">学習ペース分析</h2>
      <p className="text-xs text-gray-400 mb-5">チャプター別の完了率・学習時間・クイズ正答率</p>
      <div className="space-y-5">
        {insights.map((ch) => (
          <div key={ch.number}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-600 text-white rounded text-xs flex items-center justify-center font-bold flex-shrink-0">
                  {ch.number}
                </span>
                <span className="text-sm font-medium text-gray-700 truncate max-w-[160px]">{ch.title}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
                {ch.totalMinutes > 0 && (
                  <span className="flex items-center gap-0.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {ch.totalMinutes}分
                  </span>
                )}
                {ch.avgQuizRate !== null && (
                  <span className={`font-semibold ${quizColor(ch.avgQuizRate)}`}>
                    クイズ {ch.avgQuizRate}%
                  </span>
                )}
                <span className="text-gray-400">{ch.completed}/{ch.total}</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${completionColor(ch.completionRate)}`}
                style={{ width: `${ch.completionRate}%` }}
                role="progressbar"
                aria-valuenow={ch.completionRate}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${ch.title} 完了率 ${ch.completionRate}%`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
