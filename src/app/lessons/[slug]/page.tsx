import { notFound } from 'next/navigation';
import Link from 'next/link';
import { serialize } from 'next-mdx-remote/serialize';
import { getLessonBySlug, getAdjacentLessons, getAllLessons } from '@/lib/lessons';
import { parseLessonContent } from '@/lib/parseLesson';
import { parseQuizMarkdown } from '@/lib/parseQuiz';
import { CHAPTERS, DIFFICULTY_LABELS } from '@/lib/constants';
import Badge from '@/components/ui/Badge';
import LessonContent from '@/components/features/LessonContent';
import LessonComplete from '@/components/features/LessonComplete';

interface LessonPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const lessons = getAllLessons();
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: LessonPageProps) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) return {};

  return {
    title: `${lesson.title} — AI Learning`,
    description: `${lesson.chapterTitle} | ${DIFFICULTY_LABELS[lesson.difficulty]} | ${lesson.duration}分`,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    notFound();
  }

  const { prev, next } = getAdjacentLessons(slug);
  const { article, handson, quiz } = parseLessonContent(lesson.content);

  const articleSource = await serialize(article);
  const handsOnSource = handson ? await serialize(handson) : null;
  const quizQuestions = quiz ? parseQuizMarkdown(quiz) : [];

  const chapterInfo = CHAPTERS.find((c) => c.number === lesson.chapter);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          ホーム
        </Link>
        <span>/</span>
        <Link href="/lessons" className="hover:text-blue-600 transition-colors">
          レッスン一覧
        </Link>
        <span>/</span>
        <Link
          href={`/lessons?chapter=${lesson.chapter}`}
          className="hover:text-blue-600 transition-colors"
        >
          {lesson.chapterTitle}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{lesson.title}</span>
      </nav>

      {/* Lesson Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Ch.{lesson.chapter} — {chapterInfo?.title ?? lesson.chapterTitle}
          </span>
          <Badge difficulty={lesson.difficulty} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{lesson.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {lesson.duration} 分
          </span>
          {lesson.hasHandsOn && (
            <span className="flex items-center gap-1 text-green-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              ハンズオンあり
            </span>
          )}
          {lesson.hasQuiz && (
            <span className="flex items-center gap-1 text-purple-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              クイズあり
            </span>
          )}
        </div>
      </div>

      {/* Lesson Content with Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
        <LessonContent
          lesson={lesson}
          articleSource={articleSource}
          handsOnSource={handsOnSource}
          quizQuestions={quizQuestions}
        />

        {/* Complete Button */}
        <LessonComplete slug={slug} />
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-4 mt-8">
        {prev ? (
          <Link
            href={`/lessons/${prev.slug}`}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all group flex-1"
          >
            <svg
              className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">前のレッスン</p>
              <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 truncate">
                {prev.title}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {next ? (
          <Link
            href={`/lessons/${next.slug}`}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all group flex-1 text-right justify-end"
          >
            <div className="min-w-0">
              <p className="text-xs text-gray-400">次のレッスン</p>
              <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 truncate">
                {next.title}
              </p>
            </div>
            <svg
              className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}
