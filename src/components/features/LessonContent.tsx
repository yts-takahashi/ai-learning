'use client';

import { useState } from 'react';
import { Lesson, QuizQuestion } from '@/lib/types';
import Quiz from '@/components/features/Quiz';
import TableOfContents from '@/components/ui/TableOfContents';
import type { Heading } from '@/lib/parseLesson';

interface LessonContentProps {
  lesson: Lesson;
  articleContent: React.ReactNode;
  handsOnContent: React.ReactNode | null;
  quizQuestions: QuizQuestion[];
  nextSlug?: string | null;
  headings?: Heading[];
}

type Tab = 'article' | 'handson' | 'quiz';

export default function LessonContent({
  lesson,
  articleContent,
  handsOnContent,
  quizQuestions,
  nextSlug,
  headings = [],
}: LessonContentProps) {
  const [activeTab, setActiveTab] = useState<Tab>('article');

  const hasHandsOn = lesson.hasHandsOn && handsOnContent !== null;
  const hasQuiz = lesson.hasQuiz && quizQuestions.length > 0;

  const tabs: { id: Tab; label: string; available: boolean }[] = [
    { id: 'article', label: '記事', available: true },
    { id: 'handson', label: 'ハンズオン', available: hasHandsOn },
    { id: 'quiz', label: 'クイズ', available: hasQuiz },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8" role="tablist" aria-label="レッスンコンテンツ">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => tab.available && setActiveTab(tab.id)}
            disabled={!tab.available}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : tab.available
                  ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  : 'border-transparent text-gray-300 cursor-not-allowed'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'article' && (
        <div
          id="tabpanel-article"
          role="tabpanel"
          aria-labelledby="tab-article"
          className="prose prose-gray max-w-none"
        >
          <TableOfContents headings={headings} />
          {articleContent}
        </div>
      )}

      {activeTab === 'handson' && handsOnContent && (
        <div
          id="tabpanel-handson"
          role="tabpanel"
          aria-labelledby="tab-handson"
          className="bg-green-50 border border-green-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4 text-green-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            <span className="font-semibold">ハンズオン</span>
          </div>
          <div className="prose prose-green max-w-none">
            {handsOnContent}
          </div>
        </div>
      )}

      {activeTab === 'quiz' && quizQuestions.length > 0 && (
        <div
          id="tabpanel-quiz"
          role="tabpanel"
          aria-labelledby="tab-quiz"
        >
          <Quiz questions={quizQuestions} nextSlug={nextSlug} slug={lesson.slug} />
        </div>
      )}
    </div>
  );
}
