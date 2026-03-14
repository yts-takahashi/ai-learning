'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CHAPTERS } from '@/lib/constants';

export default function ChapterFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChapter = searchParams.get('chapter');

  function handleChange(chapterNum: string | null) {
    if (chapterNum) {
      router.push(`/lessons?chapter=${chapterNum}`);
    } else {
      router.push('/lessons');
    }
  }

  return (
    <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="チャプターフィルター">
      <button
        onClick={() => handleChange(null)}
        aria-pressed={!currentChapter}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          !currentChapter
            ? 'bg-blue-600 text-white'
            : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
        }`}
      >
        すべて
      </button>
      {CHAPTERS.map((ch) => (
        <button
          key={ch.number}
          onClick={() => handleChange(String(ch.number))}
          aria-pressed={currentChapter === String(ch.number)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            currentChapter === String(ch.number)
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
          }`}
        >
          Ch.{ch.number}
        </button>
      ))}
    </div>
  );
}
