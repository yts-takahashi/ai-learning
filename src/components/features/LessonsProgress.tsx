'use client';

import { useProgress } from '@/hooks/useProgress';
import ProgressBar from '@/components/ui/ProgressBar';
import { TOTAL_LESSONS } from '@/lib/constants';

export default function LessonsProgress() {
  const { completedSlugs, isLoaded } = useProgress();

  if (!isLoaded) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-2.5 bg-gray-200 rounded w-full" />
      </div>
    );
  }

  const completed = completedSlugs.size;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
      <h2 className="font-semibold text-gray-700 mb-3">学習進捗</h2>
      <ProgressBar value={completed} max={TOTAL_LESSONS} showLabel size="md" />
    </div>
  );
}
