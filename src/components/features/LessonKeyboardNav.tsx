'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface LessonKeyboardNavProps {
  prevSlug: string | null;
  nextSlug: string | null;
}

export default function LessonKeyboardNav({ prevSlug, nextSlug }: LessonKeyboardNavProps) {
  const router = useRouter();

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
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlug, nextSlug, router]);

  return null;
}
