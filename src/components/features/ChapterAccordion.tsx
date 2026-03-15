'use client';

import { useState } from 'react';
import LessonCard from '@/components/features/LessonCard';
import ChapterProgress from '@/components/features/ChapterProgress';
import { CHAPTERS } from '@/lib/constants';
import type { Lesson } from '@/lib/types';

interface Chapter {
  number: number;
  title: string;
  lessons: Lesson[];
}

interface ChapterAccordionProps {
  chapters: Chapter[];
  allSlugsInOrder: string[];
  defaultOpenAll?: boolean;
}

export default function ChapterAccordion({ chapters, allSlugsInOrder, defaultOpenAll = false }: ChapterAccordionProps) {
  const [openSet, setOpenSet] = useState<Set<number>>(() =>
    defaultOpenAll ? new Set(chapters.map((c) => c.number)) : new Set(chapters.map((c) => c.number))
  );

  function toggle(num: number) {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(num)) {
        next.delete(num);
      } else {
        next.add(num);
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {chapters.map((chapter) => {
        const chapterInfo = CHAPTERS.find((c) => c.number === chapter.number);
        const isOpen = openSet.has(chapter.number);

        return (
          <section key={chapter.number} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
              aria-expanded={isOpen}
              onClick={() => toggle(chapter.number)}
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">{chapter.number}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="font-bold text-lg text-gray-900">{chapter.title}</h2>
                  <ChapterProgress lessons={chapter.lessons} />
                </div>
                {chapterInfo && (
                  <p className="text-sm text-gray-500 mt-0.5 truncate">{chapterInfo.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  約{Math.round(chapter.lessons.reduce((sum, l) => sum + l.duration, 0) / 60 * 10) / 10}時間（{chapter.lessons.reduce((sum, l) => sum + l.duration, 0)}分）· {chapter.lessons.length}レッスン
                </p>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen && (
              <div className="border-t border-gray-100 p-4">
                {chapter.lessons.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg border border-dashed border-gray-200 p-6 text-center">
                    <p className="text-gray-400 text-sm">
                      このチャプターのレッスンはまだ公開されていません
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chapter.lessons.map((lesson) => (
                      <LessonCard key={lesson.slug} lesson={lesson} allSlugsInOrder={allSlugsInOrder} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
