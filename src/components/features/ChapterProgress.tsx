'use client';

import { useProgress } from '@/hooks/useProgress';
import { Lesson } from '@/lib/types';

interface ChapterProgressProps {
  lessons: Lesson[];
}

export default function ChapterProgress({ lessons }: ChapterProgressProps) {
  const { isCompleted, isLoaded } = useProgress();

  if (!isLoaded || lessons.length === 0) return null;

  const completedCount = lessons.filter((l) => isCompleted(l.slug)).length;
  const remaining = lessons.length - completedCount;

  const allCompleted = remaining === 0;

  return (
    <span className="flex items-center gap-2 text-sm text-gray-500">
      {completedCount}/{lessons.length} 完了
      {allCompleted ? (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          チャプター完了
        </span>
      ) : (
        <span className="text-xs text-blue-600 font-medium">（残り {remaining}/{lessons.length}）</span>
      )}
    </span>
  );
}
