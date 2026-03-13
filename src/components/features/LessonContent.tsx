'use client';

import { useState } from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { Lesson, QuizQuestion } from '@/lib/types';
import Quiz from '@/components/features/Quiz';

interface LessonContentProps {
  lesson: Lesson;
  articleSource: MDXRemoteSerializeResult;
  handsOnSource: MDXRemoteSerializeResult | null;
  quizQuestions: QuizQuestion[];
}

type Tab = 'article' | 'handson' | 'quiz';

export default function LessonContent({
  lesson,
  articleSource,
  handsOnSource,
  quizQuestions,
}: LessonContentProps) {
  const [activeTab, setActiveTab] = useState<Tab>('article');

  const hasHandsOn = lesson.hasHandsOn && handsOnSource !== null;
  const hasQuiz = lesson.hasQuiz && quizQuestions.length > 0;

  const tabs: { id: Tab; label: string; available: boolean }[] = [
    { id: 'article', label: '記事', available: true },
    { id: 'handson', label: 'ハンズオン', available: hasHandsOn },
    { id: 'quiz', label: 'クイズ', available: hasQuiz },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
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
        <div className="prose prose-gray max-w-none">
          <MDXRemote {...articleSource} />
        </div>
      )}

      {activeTab === 'handson' && handsOnSource && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4 text-green-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <MDXRemote {...handsOnSource} />
          </div>
        </div>
      )}

      {activeTab === 'quiz' && quizQuestions.length > 0 && (
        <Quiz questions={quizQuestions} />
      )}
    </div>
  );
}
