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

  return (
    <span className="text-sm text-gray-500">
      {completedCount}/{lessons.length} 完了
      {remaining > 0 && (
        <span className="ml-2 text-xs text-blue-600 font-medium">（残り {remaining} レッスン）</span>
      )}
    </span>
  );
}
