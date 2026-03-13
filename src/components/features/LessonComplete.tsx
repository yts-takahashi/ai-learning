'use client';

import { useProgress } from '@/hooks/useProgress';

interface LessonCompleteProps {
  slug: string;
}

export default function LessonComplete({ slug }: LessonCompleteProps) {
  const { isCompleted, toggle, isLoaded } = useProgress();

  if (!isLoaded) {
    return (
      <div className="flex justify-center mt-12">
        <div className="h-12 w-48 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  const completed = isCompleted(slug);

  return (
    <div className="flex justify-center mt-12 pt-8 border-t border-gray-200">
      <button
        onClick={() => toggle(slug)}
        className={`flex items-center gap-3 px-8 py-3 rounded-lg font-semibold transition-all ${
          completed
            ? 'bg-green-50 border-2 border-green-500 text-green-700 hover:bg-green-100'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {completed ? (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            完了済み（クリックで取り消し）
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            このレッスンを完了にする
          </>
        )}
      </button>
    </div>
  );
}
