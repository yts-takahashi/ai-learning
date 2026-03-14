import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getChapters, getAllLessons } from '@/lib/lessons';
import { CHAPTERS } from '@/lib/constants';
import { educationalCourseSchema } from '@/lib/schema';
import LessonCard from '@/components/features/LessonCard';
import LessonsProgress from '@/components/features/LessonsProgress';
import ChapterFilter from '@/components/features/ChapterFilter';
import ChapterProgress from '@/components/features/ChapterProgress';
import ChapterRoadmap from '@/components/features/ChapterRoadmap';
import DifficultyFilter from '@/components/features/DifficultyFilter';

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

      <div className="space-y-10">
        {filteredChapters.map((chapter) => {
          const chapterInfo = CHAPTERS.find((c) => c.number === chapter.number);

          return (
            <section key={chapter.number}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{chapter.number}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="font-bold text-xl text-gray-900">{chapter.title}</h2>
                    <ChapterProgress lessons={chapter.lessons} />
                  </div>
                  {chapterInfo && (
                    <p className="text-sm text-gray-500">{chapterInfo.description}</p>
                  )}
                </div>
              </div>

              {chapter.lessons.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center">
                  <p className="text-gray-400 text-sm">
                    このチャプターのレッスンはまだ公開されていません
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chapter.lessons.map((lesson) => (
                    <LessonCard key={lesson.slug} lesson={lesson} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
