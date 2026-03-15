import Link from 'next/link';
import { getLessonBySlug } from '@/lib/lessons';

interface RelatedLessonProps {
  slug: string;
  label?: string;
}

export default function RelatedLesson({ slug, label }: RelatedLessonProps) {
  const lesson = getLessonBySlug(slug);
  if (!lesson) return null;

  return (
    <Link
      href={`/lessons/${slug}`}
      className="flex items-center gap-3 p-3 my-2 bg-blue-50 border border-blue-100 rounded-lg hover:border-blue-300 hover:bg-blue-100 transition-colors group"
    >
      <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      <div className="min-w-0">
        {label && (
          <p className="text-xs text-blue-500 font-medium mb-0.5">{label}</p>
        )}
        <p className="text-sm font-medium text-blue-700 group-hover:text-blue-900 truncate">
          {lesson.title}
        </p>
        <p className="text-xs text-blue-500">
          Ch.{lesson.chapter} — {lesson.chapterTitle} · {lesson.duration}分
        </p>
      </div>
      <svg
        className="w-4 h-4 text-blue-400 group-hover:text-blue-600 flex-shrink-0 ml-auto"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
