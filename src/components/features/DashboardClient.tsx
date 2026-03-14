'use client';

import Link from 'next/link';
import { useProgress } from '@/hooks/useProgress';
import ProgressBar from '@/components/ui/ProgressBar';
import QuizStats from '@/components/features/QuizStats';
import LearningTimeStats from '@/components/features/LearningTimeStats';
import StreakBadge from '@/components/features/StreakBadge';
import QuizHistoryDetail from '@/components/features/QuizHistoryDetail';
import LearningInsights from '@/components/features/LearningInsights';
import WeakLessons from '@/components/features/WeakLessons';
import { CHAPTERS, TOTAL_LESSONS } from '@/lib/constants';

interface ChapterProgressInfo {
  number: number;
  title: string;
  slugs: string[];
}

interface OrderedLesson {
  slug: string;
  title: string;
  chapterTitle: string;
  chapter: number;
  duration: number;
}

interface DashboardClientProps {
  chapterProgressInfos: ChapterProgressInfo[];
  allSlugs: string[];
  lessonTitleMap: Record<string, string>;
  orderedLessons?: OrderedLesson[];
}

export default function DashboardClient({ chapterProgressInfos, allSlugs, lessonTitleMap, orderedLessons = [] }: DashboardClientProps) {
  const { completedSlugs, isLoaded } = useProgress();

  if (!isLoaded) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  const totalCompleted = allSlugs.filter((s) => completedSlugs.has(s)).length;
  const nextLesson = orderedLessons.find((l) => !completedSlugs.has(l.slug)) ?? null;
  const recentCompleted = Array.from(completedSlugs)
    .filter((s) => allSlugs.includes(s))
    .slice(-5)
    .reverse();

  return (
    <div className="space-y-8">
      {/* Next Lesson Recommendation */}
      {nextLesson && totalCompleted < allSlugs.length && (
        <Link
          href={`/lessons/${nextLesson.slug}`}
          className="flex items-center gap-4 bg-blue-600 rounded-xl p-5 hover:bg-blue-700 transition-colors group"
        >
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-blue-100 mb-0.5">次に学ぶレッスン</p>
            <p className="text-base font-bold text-white truncate">{nextLesson.title}</p>
            <p className="text-xs text-blue-200">Ch.{nextLesson.chapter} — {nextLesson.chapterTitle} · {nextLesson.duration}分</p>
          </div>
          <svg className="w-5 h-5 text-blue-200 group-hover:text-white flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      {/* Overall Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-bold text-lg mb-4">全体の進捗</h2>
        <ProgressBar value={totalCompleted} max={TOTAL_LESSONS} showLabel size="lg" />
      </div>

      {/* Chapter Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-bold text-lg mb-6">チャプター別進捗</h2>
        <div className="space-y-5">
          {chapterProgressInfos.map((ch) => {
            const chInfo = CHAPTERS.find((c) => c.number === ch.number);
            const chCompleted = ch.slugs.filter((s) => completedSlugs.has(s)).length;
            const chTotal = chInfo?.lessonCount ?? ch.slugs.length;

            return (
              <div key={ch.number}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded text-xs flex items-center justify-center font-bold flex-shrink-0">
                      {ch.number}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{ch.title}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {chCompleted}/{chTotal}
                  </span>
                </div>
                <ProgressBar value={chCompleted} max={chTotal} size="sm" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Recently Completed */}
      {recentCompleted.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-lg mb-4">最近完了したレッスン</h2>
          <div className="space-y-2">
            {recentCompleted.map((slug) => (
              <Link
                key={slug}
                href={`/lessons/${slug}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                  {lessonTitleMap[slug] ?? slug}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <StreakBadge />
      <LearningTimeStats />
      <LearningInsights chapters={chapterProgressInfos} />
      <WeakLessons lessonTitleMap={lessonTitleMap} />
      <QuizStats />
      <QuizHistoryDetail lessonTitleMap={lessonTitleMap} />

      {recentCompleted.length === 0 && totalCompleted === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-400 mb-4">まだレッスンを完了していません</p>
          <Link
            href="/lessons"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            レッスンを始める
          </Link>
        </div>
      )}
    </div>
  );
}
