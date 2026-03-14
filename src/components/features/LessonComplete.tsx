'use client';

import { useState } from 'react';
import { useProgress } from '@/hooks/useProgress';
import { getSessionDurationBySlug } from '@/lib/sessionHistory';

const COMPLETE_MESSAGES = [
  'お疲れさまでした！',
  'よく頑張りました！',
  '素晴らしい！',
  '着実に前進しています！',
  '継続は力なり！',
];

interface LessonCompleteProps {
  slug: string;
  duration?: number;
}

export default function LessonComplete({ slug, duration }: LessonCompleteProps) {
  const { isCompleted, toggle, isLoaded } = useProgress();
  const [justCompleted, setJustCompleted] = useState(false);
  const [message] = useState(
    () => COMPLETE_MESSAGES[Math.floor(Math.random() * COMPLETE_MESSAGES.length)],
  );
  const actualSeconds = getSessionDurationBySlug(slug);
  const actualMinutes = actualSeconds > 0 ? Math.max(1, Math.round(actualSeconds / 60)) : null;

  if (!isLoaded) {
    return (
      <div className="flex justify-center mt-12">
        <div className="h-12 w-48 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  const completed = isCompleted(slug);

  function handleClick() {
    const wasCompleted = isCompleted(slug);
    toggle(slug);
    if (!wasCompleted) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 3000);
    } else {
      setJustCompleted(false);
    }
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      {actualMinutes && duration && (
        <div className="flex justify-center gap-6 text-sm text-gray-500 mb-4">
          <span>推奨: <strong className="text-gray-700">{duration}分</strong></span>
          <span>実績: <strong className={actualMinutes <= duration ? 'text-green-600' : 'text-blue-600'}>{actualMinutes}分</strong></span>
        </div>
      )}

      {justCompleted && (
        <p className="text-center text-sm font-semibold text-green-600 mb-3 animate-bounce">
          {message}
        </p>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleClick}
          className={`flex items-center gap-3 px-8 py-3 rounded-lg font-semibold transition-all ${
            completed
              ? 'bg-green-50 border-2 border-green-500 text-green-700 hover:bg-green-100'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
          } ${justCompleted ? 'scale-105' : ''}`}
        >
          {completed ? (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              完了済み（クリックで取り消し）
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              このレッスンを完了にする
            </>
          )}
        </button>
      </div>
    </div>
  );
}
