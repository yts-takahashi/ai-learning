'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const DIFFICULTIES = [
  { value: 'beginner', label: '初級', color: 'bg-green-600' },
  { value: 'intermediate', label: '中級', color: 'bg-yellow-500' },
  { value: 'advanced', label: '上級', color: 'bg-red-500' },
] as const;

export default function DifficultyFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('difficulty');
  const chapter = searchParams.get('chapter');

  function handleChange(value: string | null) {
    const params = new URLSearchParams();
    if (chapter) params.set('chapter', chapter);
    if (value) params.set('difficulty', value);
    const qs = params.toString();
    router.push(qs ? `/lessons?${qs}` : '/lessons');
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="難易度フィルター">
      <button
        onClick={() => handleChange(null)}
        aria-pressed={!current}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
          !current ? 'bg-gray-800 text-white border-gray-800' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
        }`}
      >
        全難易度
      </button>
      {DIFFICULTIES.map((d) => (
        <button
          key={d.value}
          onClick={() => handleChange(d.value)}
          aria-pressed={current === d.value}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
            current === d.value
              ? `${d.color} text-white border-transparent`
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
          }`}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}
