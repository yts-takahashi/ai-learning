'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSwipe } from '@/hooks/useSwipe';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import { useProgress } from '@/hooks/useProgress';

interface LessonKeyboardNavProps {
  prevSlug: string | null;
  nextSlug: string | null;
  slug: string;
}

export default function LessonKeyboardNav({ prevSlug, nextSlug, slug }: LessonKeyboardNavProps) {
  const router = useRouter();
  const { toggle } = useProgress();
  useSessionTimer(slug);
  const { onTouchStart, onTouchEnd } = useSwipe(
    nextSlug ? () => router.push(`/lessons/${nextSlug}`) : undefined,
    prevSlug ? () => router.push(`/lessons/${prevSlug}`) : undefined,
  );

  useEffect(() => {
    const el = document.body;
    el.addEventListener('touchstart', onTouchStart);
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [onTouchStart, onTouchEnd]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // フォーム要素にフォーカスがある場合は何もしない
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable) {
        return;
      }

      if (e.key === 'j' && nextSlug) {
        router.push(`/lessons/${nextSlug}`);
      } else if (e.key === 'k' && prevSlug) {
        router.push(`/lessons/${prevSlug}`);
      } else if (e.key === 'c') {
        toggle(slug);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlug, nextSlug, router, slug, toggle]);

  if (!prevSlug && !nextSlug) return null;

  return (
    <div className="flex justify-end mb-2" aria-hidden="true">
      <span className="text-xs text-gray-300 select-none">
        {prevSlug && <span className="mr-3"><kbd className="font-mono bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded border border-gray-200 text-[11px]">k</kbd> 前</span>}
        {nextSlug && <span className="mr-3"><kbd className="font-mono bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded border border-gray-200 text-[11px]">j</kbd> 次</span>}
        <span><kbd className="font-mono bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded border border-gray-200 text-[11px]">c</kbd> 完了</span>
      </span>
    </div>
  );
}
