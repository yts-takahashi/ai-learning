import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getChapters, getAllLessons } from '@/lib/lessons';
import { educationalCourseSchema } from '@/lib/schema';
import LessonsProgress from '@/components/features/LessonsProgress';
import ChapterFilter from '@/components/features/ChapterFilter';
import ChapterRoadmap from '@/components/features/ChapterRoadmap';
import DifficultyFilter from '@/components/features/DifficultyFilter';
import ChapterAccordion from '@/components/features/ChapterAccordion';

export const metadata: Metadata = {
  title: 'レッスン一覧 — AI Learning',
  description: '生成AI学習の全レッスン一覧。プロンプトエンジニアリングからRAG・エージェントまで全10チャプター。',
  openGraph: {
    title: 'レッスン一覧 — AI Learning',
    description: '生成AI学習の全レッスン一覧。プロンプトエンジニアリングからRAG・エージェントまで全10チャプター。',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'AI Learning',
  },
  twitter: {
    card: 'summary',
    title: 'レッスン一覧 — AI Learning',
    description: '生成AI学習の全レッスン一覧。プロンプトエンジニアリングからRAG・エージェントまで全10チャプター。',
  },
};

interface LessonsPageProps {
  searchParams: Promise<{ chapter?: string; difficulty?: string }>;
}

export default async function LessonsPage({ searchParams }: LessonsPageProps) {
  const params = await searchParams;
  const chapterNum = params.chapter ? parseInt(params.chapter, 10) : null;
  const difficulty = params.difficulty ?? null;

  const chapters = getChapters();
  const allLessons = getAllLessons();
  const courseSchema = educationalCourseSchema(allLessons);

  const filteredChapters = chapters
    .filter((ch) => chapterNum === null || ch.number === chapterNum)
    .map((ch) => ({
      ...ch,
      lessons: difficulty
        ? ch.lessons.filter((l) => l.difficulty === difficulty)
        : ch.lessons,
    }))
    .filter((ch) => !difficulty || ch.lessons.length > 0);

  const isFiltered = chapterNum !== null || difficulty !== null;
  const filteredLessonCount = filteredChapters.reduce((sum, ch) => sum + ch.lessons.length, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">レッスン一覧</h1>
        <p className="text-gray-500">チャプターごとにレッスンを確認できます</p>
      </div>

      <LessonsProgress />

      {chapterNum === null && <ChapterRoadmap />}

      <Suspense>
        <ChapterFilter />
      </Suspense>
      <Suspense>
        <DifficultyFilter />
      </Suspense>

      {isFiltered && (
        <p className="text-sm text-gray-500 mb-4" aria-live="polite">
          絞り込み結果: <span className="font-semibold text-gray-700">{filteredLessonCount}</span> 件
        </p>
      )}

      <ChapterAccordion
        chapters={filteredChapters}
        allSlugsInOrder={allLessons.map((l) => l.slug)}
        defaultOpenAll
      />
    </div>
  );
}
