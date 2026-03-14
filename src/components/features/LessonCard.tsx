'use client';

import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { Lesson } from '@/lib/types';
import { useProgress } from '@/hooks/useProgress';
import { useMemo } from 'react';
import { getQuizHistory } from '@/lib/quizHistory';

interface LessonCardProps {
  lesson: Lesson;
  allSlugsInOrder?: string[];
}

export default function LessonCard({ lesson, allSlugsInOrder }: LessonCardProps) {
  const { completedSlugs, isCompleted } = useProgress();
  const completed = isCompleted(lesson.slug);

  const isNext =
    !completed &&
    !!allSlugsInOrder &&
    allSlugsInOrder.findIndex((s) => !completedSlugs.has(s)) === allSlugsInOrder.indexOf(lesson.slug);

  const bestQuizRate = useMemo(() => {
    if (!lesson.hasQuiz) return null;
    const history = getQuizHistory();
    const attempts = history[lesson.slug];
    if (!attempts?.length) return null;
    const best = attempts.reduce((max, a) => (a.score > max.score ? a : max), attempts[0]);
    return Math.round((best.score / best.total) * 100);
  }, [lesson.slug, lesson.hasQuiz]);

  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      className={`flex items-center gap-4 p-4 rounded-lg border bg-white hover:border-blue-300 hover:shadow-sm transition-all group ${
        isNext ? 'border-blue-400 ring-1 ring-blue-200' : 'border-gray-200'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
          completed
            ? 'bg-green-500 border-green-500 text-white'
            : isNext
              ? 'border-blue-400 text-blue-500'
              : 'border-gray-300 group-hover:border-blue-400'
        }`}
      >
        {completed ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span className={`text-xs ${isNext ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-400'}`}>
            {lesson.lessonNumber}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3
            className={`font-medium truncate group-hover:text-blue-600 transition-colors ${
              completed ? 'text-gray-500' : 'text-gray-900'
            }`}
          >
            {lesson.title}
          </h3>
          {isNext && (
            <span className="flex-shrink-0 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              続きから
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{lesson.duration} 分</span>
          <Badge difficulty={lesson.difficulty} />
          {lesson.hasHandsOn && <span className="text-green-600">ハンズオン</span>}
          {lesson.hasQuiz && (
            bestQuizRate !== null ? (
              <span className={`font-semibold ${bestQuizRate === 100 ? 'text-amber-500' : 'text-purple-600'}`}>
                {bestQuizRate === 100 ? '★' : ''}クイズ{bestQuizRate}%
              </span>
            ) : (
              <span className="text-purple-600">クイズ</span>
            )
          )}
        </div>
      </div>

      <svg
        className="w-4 h-4 text-gray-300 group-hover:text-blue-400 flex-shrink-0 transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
