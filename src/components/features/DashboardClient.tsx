'use client';

import Link from 'next/link';
import { useProgress } from '@/hooks/useProgress';
import ProgressBar from '@/components/ui/ProgressBar';
import { CHAPTERS, TOTAL_LESSONS } from '@/lib/constants';

interface ChapterProgressInfo {
  number: number;
  title: string;
  slugs: string[];
}

interface DashboardClientProps {
  chapterProgressInfos: ChapterProgressInfo[];
  allSlugs: string[];
  lessonTitleMap: Record<string, string>;
}

export default function DashboardClient({ chapterProgressInfos, allSlugs, lessonTitleMap }: DashboardClientProps) {
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
  const recentCompleted = Array.from(completedSlugs)
    .filter((s) => allSlugs.includes(s))
    .slice(-5)
    .reverse();

  return (
    <div className="space-y-8">
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
