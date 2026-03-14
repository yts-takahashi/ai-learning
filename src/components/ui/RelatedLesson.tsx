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
      <span className="text-blue-500 text-sm flex-shrink-0">📖</span>
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
