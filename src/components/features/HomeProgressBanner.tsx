'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getProgress } from '@/lib/progress';
import { TOTAL_LESSONS } from '@/lib/constants';

export default function HomeProgressBanner() {
  const [completedCount, setCompletedCount] = useState<number | null>(null);

  useEffect(() => {
    const slugs = getProgress();
    if (slugs.size > 0) {
      setCompletedCount(slugs.size);
    }
  }, []);

  if (completedCount === null) return null;

  const pct = Math.round((completedCount / TOTAL_LESSONS) * 100);
  const allCompleted = completedCount >= TOTAL_LESSONS;

  if (allCompleted) {
    return (
      <section className="bg-green-50 border-b border-green-200" aria-label="完走バナー">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <span className="text-xl" aria-hidden="true">🎉</span>
            <p className="text-sm font-semibold text-green-800 flex-1">
              全 {TOTAL_LESSONS} レッスン完走おめでとうございます！
            </p>
            <Link
              href="/dashboard"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              進捗を見る
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-blue-50 border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-800 mb-1.5">
              学習を継続中です — {completedCount}/{TOTAL_LESSONS} レッスン完了（{pct}%）
            </p>
            <div className="w-full bg-blue-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <Link
            href="/lessons"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            続きから学ぶ
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
