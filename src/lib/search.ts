import type { Lesson } from './types';

export interface SearchItem {
  slug: string;
  title: string;
  chapterTitle: string;
  chapter: number;
  difficulty: string;
  duration: number;
}

export function buildSearchIndex(lessons: Lesson[]): SearchItem[] {
  return lessons.map((l) => ({
    slug: l.slug,
    title: l.title,
    chapterTitle: l.chapterTitle,
    chapter: l.chapter,
    difficulty: l.difficulty,
    duration: l.duration,
  }));
}
